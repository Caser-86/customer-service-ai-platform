import { Module, Global } from '@nestjs/common';
import { ConversationEventService } from './conversation-event.service';

@Global()
@Module({
  providers: [ConversationEventService],
  exports: [ConversationEventService]
})
export class EventsModule {}
