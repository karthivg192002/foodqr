import { Controller, Post, Delete, Get, Param, Body, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@Controller()
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Public()
  @Post('frontend/subscribe')
  subscribe(@Body() body: { email: string }) {
    return this.service.subscribe(body.email);
  }

  @Public()
  @Delete('frontend/unsubscribe/:email')
  unsubscribe(@Param('email') email: string) {
    return this.service.unsubscribe(email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/subscribers')
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/subscribers/active')
  findActive() {
    return this.service.findActive();
  }
}
