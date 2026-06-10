import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Sse,
  MessageEvent
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { PublicService } from './public.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private publicService: PublicService,
    private prisma: PrismaService
  ) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new visitor conversation' })
  async createConversation(
    @Body()
    body: {
      tenantId?: string;
      name?: string;
      email?: string;
      metadata?: any;
    }
  ) {
    const tenantId = body.tenantId || 'default-tenant';
    const result = await this.publicService.createConversation(tenantId, {
      name: body.name,
      email: body.email,
      metadata: body.metadata
    });
    return { ok: true, data: result };
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a visitor message' })
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string; tenantId?: string }
  ) {
    const tenantId = body.tenantId || 'default-tenant';
    const result = await this.publicService.sendMessage(
      tenantId,
      id,
      body.content
    );
    return { ok: true, data: result };
  }

  @Get('conversations/:id/events')
  @Sse('events')
  @ApiOperation({ summary: 'SSE events for conversation' })
  getConversationEvents(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string
  ): Observable<MessageEvent> {
    return new Observable((observer) => {
      const sendEvent = async () => {
        try {
          const messages = await this.publicService.getConversationEvents(
            tenantId || 'default-tenant',
            id
          );

          for (const message of messages) {
            observer.next({
              data: JSON.stringify({
                type: 'message',
                data: message
              })
            });
          }

          observer.next({
            data: JSON.stringify({ type: 'done', data: null })
          });

          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      sendEvent();
    });
  }
}
