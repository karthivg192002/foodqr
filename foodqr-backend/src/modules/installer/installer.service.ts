import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { User } from '../users/entities/user.entity';
import { UserRole, UserStatus } from '../../common/enums';

@Injectable()
export class InstallerService {
  constructor(
    @InjectRepository(AppSetting) private settingRepo: Repository<AppSetting>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async isInstalled(): Promise<boolean> {
    const setting = await this.settingRepo.findOne({ where: { key: 'installation_complete' } });
    return setting?.value === 'true';
  }

  async checkRequirements() {
    const checks: Record<string, boolean> = {};

    // Check DB connection
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = true;
    } catch {
      checks.database = false;
    }

    // Check env vars
    checks.jwtSecret = !!process.env.JWT_SECRET;
    checks.dbHost = !!process.env.DB_HOST;

    // Check NodeJS version >= 18
    const [major] = process.versions.node.split('.').map(Number);
    checks.nodeVersion = major >= 18;

    const allPassed = Object.values(checks).every(Boolean);
    return { checks, allPassed, nodeVersion: process.versions.node };
  }

  async setupDatabase() {
    try {
      await this.dataSource.synchronize();
      return { success: true, message: 'Database tables created/synchronized successfully' };
    } catch (e) {
      throw new BadRequestException('Database setup failed: ' + e.message);
    }
  }

  async createAdmin(dto: { name: string; email: string; password: string; businessName?: string }) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      if (existing.role === UserRole.ADMIN) {
        return { message: 'Admin user already exists', userId: existing.id };
      }
      throw new BadRequestException('Email already in use by another account');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const admin = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    await this.userRepo.save(admin);

    if (dto.businessName) {
      const setting = this.settingRepo.create({ key: 'business_name', value: dto.businessName, group: 'company' });
      await this.settingRepo.save(setting).catch(() => null);
    }

    return { message: 'Admin user created', userId: admin.id };
  }

  async finalize(dto: { businessName?: string; timezone?: string; currency?: string }) {
    const settings = [
      { key: 'installation_complete', value: 'true', group: 'system' },
      { key: 'installation_date', value: new Date().toISOString(), group: 'system' },
    ];
    if (dto.businessName) settings.push({ key: 'business_name', value: dto.businessName, group: 'company' });
    if (dto.timezone) settings.push({ key: 'timezone', value: dto.timezone, group: 'site' });
    if (dto.currency) settings.push({ key: 'currency_symbol', value: dto.currency, group: 'site' });

    for (const s of settings) {
      const existing = await this.settingRepo.findOne({ where: { key: s.key } });
      if (existing) {
        await this.settingRepo.update(existing.id, { value: s.value });
      } else {
        await this.settingRepo.save(this.settingRepo.create(s));
      }
    }

    return { message: 'Installation complete! You can now log in with your admin credentials.' };
  }

  getWizardHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FoodQR Setup Wizard</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f3f4f6;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .container{background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:600px;width:100%;overflow:hidden}
    .header{background:#f97316;color:white;padding:32px;text-align:center}
    .header h1{font-size:28px;font-weight:700;margin-bottom:8px}
    .header p{opacity:.85;font-size:15px}
    .steps{display:flex;padding:24px 32px 0;gap:0}
    .step{flex:1;text-align:center;position:relative}
    .step:not(:last-child)::after{content:'';position:absolute;top:14px;left:60%;width:80%;height:2px;background:#e5e7eb;z-index:0}
    .step-num{width:28px;height:28px;border-radius:50%;background:#e5e7eb;color:#6b7280;font-size:13px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;position:relative;z-index:1}
    .step.active .step-num{background:#f97316;color:white}
    .step.done .step-num{background:#22c55e;color:white}
    .step-label{font-size:11px;color:#6b7280;margin-top:6px}
    .content{padding:32px}
    .panel{display:none}
    .panel.active{display:block}
    h2{font-size:20px;font-weight:700;color:#111;margin-bottom:8px}
    .subtitle{color:#6b7280;font-size:14px;margin-bottom:24px}
    .form-group{margin-bottom:16px}
    label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
    input{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;transition:border .2s}
    input:focus{border-color:#f97316}
    .btn{width:100%;padding:12px;background:#f97316;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;transition:opacity .2s}
    .btn:hover{opacity:.9}
    .btn-secondary{background:#6b7280}
    .check-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#f9fafb;border-radius:8px;margin-bottom:8px}
    .check-icon{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
    .check-ok{background:#dcfce7;color:#16a34a}
    .check-fail{background:#fee2e2;color:#dc2626}
    .check-label{font-size:14px;color:#374151}
    .alert{padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:16px}
    .alert-success{background:#dcfce7;color:#166534}
    .alert-error{background:#fee2e2;color:#991b1b}
    .actions{display:flex;gap:12px;margin-top:24px}
    .actions .btn{margin-top:0}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ FoodQR Setup</h1>
      <p>Complete these steps to get your restaurant management system ready</p>
    </div>
    <div class="steps">
      <div class="step active" id="st1"><div class="step-num">1</div><div class="step-label">Requirements</div></div>
      <div class="step" id="st2"><div class="step-num">2</div><div class="step-label">Database</div></div>
      <div class="step" id="st3"><div class="step-num">3</div><div class="step-label">Admin</div></div>
      <div class="step" id="st4"><div class="step-num">4</div><div class="step-label">Finish</div></div>
    </div>
    <div class="content">
      <!-- Step 1 -->
      <div class="panel active" id="p1">
        <h2>System Requirements</h2>
        <p class="subtitle">Checking that your server meets all requirements</p>
        <div id="checks-container"><p style="color:#6b7280;font-size:14px">Click "Check Requirements" to begin.</p></div>
        <div class="actions">
          <button class="btn" onclick="checkRequirements()">Check Requirements</button>
          <button class="btn" id="btn-step2" style="display:none" onclick="goTo(2)">Continue →</button>
        </div>
      </div>
      <!-- Step 2 -->
      <div class="panel" id="p2">
        <h2>Database Setup</h2>
        <p class="subtitle">Synchronize database tables with the application schema</p>
        <div id="db-result"></div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="goTo(1)">← Back</button>
          <button class="btn" onclick="setupDatabase()">Setup Database</button>
          <button class="btn" id="btn-step3" style="display:none" onclick="goTo(3)">Continue →</button>
        </div>
      </div>
      <!-- Step 3 -->
      <div class="panel" id="p3">
        <h2>Create Administrator</h2>
        <p class="subtitle">Set up your admin account to access the dashboard</p>
        <div class="form-group"><label>Full Name</label><input id="adminName" type="text" placeholder="John Doe" /></div>
        <div class="form-group"><label>Email Address</label><input id="adminEmail" type="email" placeholder="admin@restaurant.com" /></div>
        <div class="form-group"><label>Password</label><input id="adminPassword" type="password" placeholder="Minimum 8 characters" /></div>
        <div class="form-group"><label>Business Name</label><input id="bizName" type="text" placeholder="My Restaurant" /></div>
        <div id="admin-result"></div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="goTo(2)">← Back</button>
          <button class="btn" onclick="createAdmin()">Create Admin</button>
          <button class="btn" id="btn-step4" style="display:none" onclick="goTo(4)">Continue →</button>
        </div>
      </div>
      <!-- Step 4 -->
      <div class="panel" id="p4">
        <h2>Final Configuration</h2>
        <p class="subtitle">Configure basic site settings to complete the installation</p>
        <div class="form-group"><label>Timezone</label><input id="timezone" type="text" placeholder="UTC" value="UTC" /></div>
        <div class="form-group"><label>Currency Symbol</label><input id="currency" type="text" placeholder="$" value="$" /></div>
        <div id="finish-result"></div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="goTo(3)">← Back</button>
          <button class="btn" onclick="finalize()">Complete Installation</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    function goTo(n){
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      document.getElementById('p'+n).classList.add('active');
      document.querySelectorAll('.step').forEach((s,i)=>{
        s.classList.remove('active','done');
        if(i+1<n) s.classList.add('done');
        if(i+1===n) s.classList.add('active');
      });
    }
    async function checkRequirements(){
      const r=await fetch('/installer/check-requirements',{method:'POST'});
      const data=await r.json();
      const labels={database:'Database Connection',jwtSecret:'JWT Secret configured',dbHost:'Database host configured',nodeVersion:'Node.js >= 18'};
      let html='';
      let allOk=true;
      for(const [k,v] of Object.entries(data.checks||{})){
        const ok=!!v;
        if(!ok)allOk=false;
        html+=\`<div class="check-item"><div class="check-icon \${ok?'check-ok':'check-fail'}">\${ok?'✓':'✗'}</div><div class="check-label">\${labels[k]||k}</div></div>\`;
      }
      document.getElementById('checks-container').innerHTML=html;
      if(allOk) document.getElementById('btn-step2').style.display='block';
    }
    async function setupDatabase(){
      document.getElementById('db-result').innerHTML='<div class="alert" style="background:#fef3c7;color:#92400e">Setting up database...</div>';
      try{
        const r=await fetch('/installer/setup-database',{method:'POST'});
        const data=await r.json();
        document.getElementById('db-result').innerHTML=\`<div class="alert alert-success">\${data.message}</div>\`;
        document.getElementById('btn-step3').style.display='block';
      }catch(e){
        document.getElementById('db-result').innerHTML='<div class="alert alert-error">Database setup failed. Check your connection settings.</div>';
      }
    }
    async function createAdmin(){
      const body={name:document.getElementById('adminName').value,email:document.getElementById('adminEmail').value,password:document.getElementById('adminPassword').value,businessName:document.getElementById('bizName').value};
      if(!body.name||!body.email||!body.password){document.getElementById('admin-result').innerHTML='<div class="alert alert-error">Please fill all required fields.</div>';return;}
      const r=await fetch('/installer/create-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await r.json();
      if(r.ok){
        document.getElementById('admin-result').innerHTML=\`<div class="alert alert-success">\${data.message}</div>\`;
        document.getElementById('btn-step4').style.display='block';
      } else {
        document.getElementById('admin-result').innerHTML=\`<div class="alert alert-error">\${data.message||'Failed to create admin'}</div>\`;
      }
    }
    async function finalize(){
      const body={timezone:document.getElementById('timezone').value,currency:document.getElementById('currency').value};
      const r=await fetch('/installer/finalize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const data=await r.json();
      if(r.ok){
        document.getElementById('finish-result').innerHTML=\`<div class="alert alert-success">\${data.message}<br><br><strong>Installation complete!</strong> <a href="/" style="color:#166534">Go to the app →</a></div>\`;
      } else {
        document.getElementById('finish-result').innerHTML=\`<div class="alert alert-error">\${data.message||'Failed to finalize'}</div>\`;
      }
    }
  </script>
</body>
</html>`;
  }
}
