import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Permission } from '../auth/permissions';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('knowledge/documents')
  @RequirePermissions(Permission.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Upload knowledge document' })
  async uploadDocument(
    @Body() body: { title: string; content: string; sourceType?: string },
    @Request() req: any
  ) {
    const result = await this.adminService.uploadDocument(
      req.user.tenantId,
      body
    );
    return { ok: true, data: result };
  }

  @Post('knowledge/reindex')
  @RequirePermissions(Permission.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Reindex all knowledge' })
  async reindex(@Request() req: any) {
    const result = await this.adminService.reindexAll(req.user.tenantId);
    return { ok: true, data: result };
  }

  @Get('knowledge/documents')
  @RequirePermissions(Permission.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'List knowledge documents' })
  async listDocuments(@Request() req: any) {
    const result = await this.adminService.getDocuments(req.user.tenantId);
    return { ok: true, data: result };
  }

  @Get('analytics/overview')
  @RequirePermissions(Permission.ANALYTICS_READ)
  @ApiOperation({ summary: 'Get analytics overview' })
  async getAnalytics(@Request() req: any) {
    const result = await this.adminService.getAnalytics(req.user.tenantId);
    return { ok: true, data: result };
  }

  @Get('audit')
  @RequirePermissions(Permission.AUDIT_READ)
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Request() req: any
  ) {
    const result = await this.adminService.getAuditLogs(
      req.user.tenantId,
      parseInt(page) || 1,
      parseInt(limit) || 50
    );
    return { ok: true, data: result };
  }

  @Post('bot/config')
  @RequirePermissions(Permission.BOT_WRITE)
  @ApiOperation({ summary: 'Update bot configuration' })
  async updateBotConfig(
    @Body()
    body: { provider?: string; model?: string; handoffThreshold?: number },
    @Request() req: any
  ) {
    const result = await this.adminService.updateBotConfig(
      req.user.tenantId,
      body
    );
    return { ok: true, data: result };
  }

  @Get('team')
  @RequirePermissions(Permission.TEAM_READ)
  @ApiOperation({ summary: 'Get team members' })
  async getTeam(@Request() req: any) {
    const result = await this.adminService.getTeamMembers(req.user.tenantId);
    return { ok: true, data: result };
  }
}
