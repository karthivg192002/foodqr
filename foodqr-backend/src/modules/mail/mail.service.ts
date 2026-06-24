import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { AppSetting } from '../settings/entities/app-setting.entity';
import { TenantConnectionService } from '../tenants/connection/tenant-connection.service';
import { tenantAwareRepo } from '../tenants/connection/tenant-aware-repo';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(AppSetting) private settingRepo: Repository<AppSetting>,
    connections: TenantConnectionService,
  ) {
    this.settingRepo = tenantAwareRepo(connections, AppSetting, settingRepo);
  }

  private async getSmtpConfig() {
    const keys = ['mail_host', 'mail_port', 'mail_username', 'mail_password', 'mail_encryption', 'mail_from_address', 'mail_from_name'];
    const settings = await this.settingRepo.find({ where: keys.map((k) => ({ key: k })) as any });
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return map;
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const cfg = await this.getSmtpConfig();
      const transporter = nodemailer.createTransport({
        host: cfg.mail_host || process.env.MAIL_HOST || 'smtp.mailtrap.io',
        port: parseInt(cfg.mail_port || process.env.MAIL_PORT || '587'),
        secure: (cfg.mail_encryption || 'tls') === 'ssl',
        auth: {
          user: cfg.mail_username || process.env.MAIL_USERNAME,
          pass: cfg.mail_password || process.env.MAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"${cfg.mail_from_name || 'FoodQR'}" <${cfg.mail_from_address || 'noreply@foodqr.com'}>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    await this.sendMail(
      to,
      'Your FoodQR Verification Code',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#f97316">FoodQR Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1f2937;padding:16px 0">${otp}</div>
        <p style="color:#6b7280;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>`,
    );
  }

  async sendOrderConfirmation(to: string, orderNo: string, total: number): Promise<void> {
    await this.sendMail(
      to,
      `Order Confirmed — #${orderNo}`,
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#f97316">Order Confirmed!</h2>
        <p>Your order <strong>#${orderNo}</strong> has been placed successfully.</p>
        <p>Total: <strong>$${parseFloat(total as any).toFixed(2)}</strong></p>
        <p style="color:#6b7280;font-size:13px">We'll notify you when your order status changes.</p>
      </div>`,
    );
  }

  async sendOrderStatusUpdate(to: string, orderNo: string, status: string): Promise<void> {
    const statusLabels: Record<string, string> = {
      accepted: 'accepted and is being prepared',
      preparing: 'now being prepared in the kitchen',
      prepared: 'ready for pickup/delivery',
      out_for_delivery: 'out for delivery',
      delivered: 'delivered. Enjoy your meal!',
      canceled: 'canceled',
      rejected: 'rejected',
    };
    const label = statusLabels[status] || status;
    await this.sendMail(
      to,
      `Order #${orderNo} — Status Update`,
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#f97316">Order Update</h2>
        <p>Your order <strong>#${orderNo}</strong> is ${label}.</p>
      </div>`,
    );
  }

  async sendPasswordReset(to: string, token: string, frontendUrl: string): Promise<void> {
    const link = `${frontendUrl}/auth/reset-password?token=${token}`;
    await this.sendMail(
      to,
      'Reset Your FoodQR Password',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#f97316">Password Reset</h2>
        <p>Click the link below to reset your password. The link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Reset Password</a>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, please ignore this email.</p>
      </div>`,
    );
  }
}
