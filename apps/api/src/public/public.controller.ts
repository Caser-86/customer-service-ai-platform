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
import { ConversationEventService } from '../events/conversation-event.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private publicService: PublicService,
    private eventService: ConversationEventService
  ) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new visitor conversation' })
  async createConversation(
    @Body()
    body: {
      tenantSlug: string;
      name?: string;
      email?: string;
      metadata?: any;
    }
  ) {
    const result = await this.publicService.createConversation(
      body.tenantSlug,
      {
        name: body.name,
        email: body.email,
        metadata: body.metadata
      }
    );
    return { ok: true, data: result };
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a visitor message' })
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Headers('x-visitor-token') visitorToken: string
  ) {
    const result = await this.publicService.sendMessage(
      visitorToken,
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
    @Headers('x-visitor-token') visitorToken: string
  ): Observable<MessageEvent> {
    // Verify token first
    this.publicService.verifyVisitorTokenPublic(visitorToken, id);

    return new Observable((observer) => {
      const subscription = this.eventService.getEventStream(id).subscribe({
        next: (event) => {
          observer.next({
            data: JSON.stringify(event)
          });
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete()
      });

      // Send initial connection message
      observer.next({
        data: JSON.stringify({
          type: 'connected',
          conversationId: id
        })
      });

      return () => subscription.unsubscribe();
    });
  }
}
