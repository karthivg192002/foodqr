import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('broadcast')
  @Roles(UserRole.ADMIN)
  broadcast(@Body() dto: { title: string; body: string }) {
    return this.notificationsService.broadcastToAll(dto.title, dto.body);
  }

  @Post('email')
  @Roles(UserRole.ADMIN)
  sendEmail(@Body() dto: { to: string; subject: string; html: string }) {
    return this.notificationsService.sendEmail(dto.to, dto.subject, dto.html);
  }
}
