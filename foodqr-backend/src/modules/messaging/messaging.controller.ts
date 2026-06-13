import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessagingService } from './messaging.service';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  @Get('branch/:branchId/threads')
  getThreadsForBranch(@Param('branchId') branchId: string) {
    return this.service.getThreadsForBranch(branchId);
  }

  @Post('thread')
  getOrCreateThread(@Request() req, @Body() body: { branchId: string }) {
    return this.service.getOrCreateThread(req.user.sub, body.branchId);
  }

  @Get('thread/:id/history')
  getHistory(@Param('id') id: string) { return this.service.getHistory(id); }

  @Post('thread/:id/send')
  send(@Param('id') id: string, @Request() req, @Body() body: { text: string }) {
    return this.service.sendMessage(id, req.user.sub, body.text);
  }

  @Post('thread/:id/read')
  markRead(@Param('id') id: string) { return this.service.markRead(id); }
}
