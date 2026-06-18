import {
  Controller, Get, Patch, Delete, Param, ParseUUIDPipe, UseGuards, Request,
  ParseIntPipe, DefaultValuePipe, Query, Post, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InboxService } from './inbox.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';

@ApiTags('Inbox')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inbox')
export class InboxController {
  constructor(private readonly service: InboxService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.service.findByUser(user.id, page, limit);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.markRead(id, user.id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.service.markAllRead(user.id);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.delete(id, user.id);
  }

  /** Admin: send notification to a specific user */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @Post('admin/send')
  sendToUser(@Body() body: { userId: string; title: string; body: string; modelType?: string; modelId?: string }) {
    const { userId, ...rest } = body;
    return this.service.send(userId, rest.title, rest.body, rest as any);
  }
}
