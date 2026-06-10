import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface ConversationEvent {
  type: 'message.token' | 'message.citation' | 'message.done' | 'conversation.handoff' | 'agent.reply';
  conversationId: string;
  data: any;
}

@Injectable()
export class ConversationEventService {
  private eventStreams = new Map<string, Subject<ConversationEvent>>();

  getEventStream(conversationId: string): Observable<ConversationEvent> {
    if (!this.eventStreams.has(conversationId)) {
      this.eventStreams.set(conversationId, new Subject<ConversationEvent>());
    }
    return this.eventStreams.get(conversationId)!.asObservable();
  }

  publishEvent(event: ConversationEvent) {
    const stream = this.eventStreams.get(event.conversationId);
    if (stream) {
      stream.next(event);
    }
  }

  publishToken(conversationId: string, token: string) {
    this.publishEvent({
      type: 'message.token',
      conversationId,
      data: { token },
    });
  }

  publishCitation(conversationId: string, citations: any[]) {
    this.publishEvent({
      type: 'message.citation',
      conversationId,
      data: { citations },
    });
  }

  publishDone(conversationId: string, messageId: string) {
    this.publishEvent({
      type: 'message.done',
      conversationId,
      data: { messageId },
    });
  }

  publishHandoff(conversationId: string, reason: string) {
    this.publishEvent({
      type: 'conversation.handoff',
      conversationId,
      data: { reason },
    });
  }

  publishAgentReply(conversationId: string, messageId: string, content: string) {
    this.publishEvent({
      type: 'agent.reply',
      conversationId,
      data: { messageId, content },
    });
  }

  closeStream(conversationId: string) {
    const stream = this.eventStreams.get(conversationId);
    if (stream) {
      stream.complete();
      this.eventStreams.delete(conversationId);
    }
  }
}
