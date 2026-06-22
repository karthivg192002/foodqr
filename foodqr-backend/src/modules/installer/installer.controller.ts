import { Controller, Get, Post, Body, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InstallerService } from './installer.service';

@ApiTags('Installer')
@Controller('installer')
export class InstallerController {
  constructor(private readonly service: InstallerService) {}

  @Get()
  @ApiOperation({ summary: 'Serve the setup wizard HTML page' })
  async wizard(@Res() res: Response) {
    const installed = await this.service.isInstalled();
    if (installed) {
      return res.status(200).send('<html><body><p>Already installed. <a href="/">Go to app</a></p></body></html>');
    }
    res.set('Content-Type', 'text/html').send(this.service.getWizardHtml());
  }

  @Get('status')
  @ApiOperation({ summary: 'Check installation status' })
  async status() {
    return { installed: await this.service.isInstalled() };
  }

  @Post('check-requirements')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check server requirements' })
  checkRequirements() {
    return this.service.checkRequirements();
  }

  @Post('setup-database')
  @HttpCode(200)
  @ApiOperation({ summary: 'Run database synchronization' })
  setupDatabase() {
    return this.service.setupDatabase();
  }

  @Post('create-admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create the initial admin user' })
  createAdmin(@Body() dto: { name: string; email: string; password: string; businessName?: string }) {
    return this.service.createAdmin(dto);
  }

  @Post('create-super-admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'One-time bootstrap: create the platform super-admin (fails if one already exists)' })
  createSuperAdmin(@Body() dto: { name: string; email: string; password: string }) {
    return this.service.createSuperAdmin(dto);
  }

  @Post('finalize')
  @HttpCode(200)
  @ApiOperation({ summary: 'Finalize installation with site settings' })
  finalize(@Body() dto: { businessName?: string; timezone?: string; currency?: string }) {
    return this.service.finalize(dto);
  }
}
