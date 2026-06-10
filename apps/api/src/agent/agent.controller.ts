import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('agent')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get('inbox')
  @ApiOperation({ summary: 'Get agent inbox' })
  async getInbox(@Request() req: any) {
    const result = await this.agentService.getInbox(req.user.tenantId);
    return { ok: true, data: result };
  }

  @Post('conversations/:id/claim')
  @ApiOperation({ summary: 'Claim a conversation' })
  async claimConversation(@Param('id') id: string, @Request() req: any) {
    const result = await this.agentService.claimConversation(
      req.user.tenantId,
      id,
      req.user.id
    );
    return { ok: true, data: result };
  }

  @Post('conversations/:id/reply')
  @ApiOperation({ summary: 'Reply to a conversation' })
  async reply(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req: any
  ) {
    const result = await this.agentService.replyToConversation(
      req.user.tenantId,
      id,
      req.user.id,
      body.content
    );
    return { ok: true, data: result };
  }

  @Post('conversations/:id/close')
  @ApiOperation({ summary: 'Close a conversation' })
  async close(@Param('id') id: string, @Request() req: any) {
    const result = await this.agentService.closeConversation(
      req.user.tenantId,
      id,
      req.user.id
    );
    return { ok: true, data: result };
  }

  @Post('conversations/:id/tickets')
  @ApiOperation({ summary: 'Create a ticket from conversation' })
  async createTicket(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string; priority?: string },
    @Request() req: any
  ) {
    const result = await this.agentService.createTicket(
      req.user.tenantId,
      id,
      req.user.id,
      body
    );
    return { ok: true, data: result };
  }
}
