import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiCompatibleProvider } from './providers/openai-compatible.provider';
import { VectorSearchService } from './vector-search.service';
import { ConversationEventService } from '../events/conversation-event.service';

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);

  constructor(
    private prisma: PrismaService,
    private mockProvider: MockAiProvider,
    private openaiProvider: OpenAiCompatibleProvider,
    private vectorSearch: VectorSearchService,
    private eventService: ConversationEventService,
  ) {}

  async handleVisitorMessage(
    tenantId: string,
    conversationId: string,
    content: string
  ) {
    this.logger.log(`Handling visitor message for conversation ${conversationId}`);

    // Save visitor message
    await this.prisma.message.create({
      data: { tenantId, conversationId, role: 'visitor', content }
    });

    // Check for handoff keywords
    const handoffKeywords = ['人工', '转人工', '客服', '投诉', 'human', 'agent', 'support'];
    const shouldHandoff = handoffKeywords.some((keyword) =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    if (shouldHandoff) {
      return this.triggerHandoff(tenantId, conversationId, 'keyword_match');
    }

    // Search knowledge base
    const searchResults = await this.vectorSearch.search(tenantId, content, 5);

    // Check confidence
    if (searchResults.length === 0 || searchResults[0].score < 0.3) {
      return this.triggerHandoff(tenantId, conversationId, 'low_confidence');
    }

    // Get bot config
    const botConfig = await this.prisma.botConfig.findFirst({
      where: { tenantId }
    });

    // Prepare citations
    const citations = searchResults.map((r) => ({
      documentId: r.documentId,
      content: r.content,
      score: r.score
    }));

    // Generate response
    let response: string;
    let model: string;

    if (botConfig?.provider === 'openai-compatible' && process.env.LLM_API_KEY) {
      const result = await this.openaiProvider.generate(content, citations);
      response = result.content;
      model = result.model;
    } else {
      const result = await this.mockProvider.generate(content, citations);
      response = result.content;
      model = result.model;
    }

    // Publish token events (simulate streaming)
    const tokens = response.split('');
    for (const token of tokens) {
      this.eventService.publishToken(conversationId, token);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Publish citations
    this.eventService.publishCitation(conversationId, citations);

    // Save AI response
    const aiMessage = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        role: 'assistant',
        content: response,
        citations: citations
      }
    });

    // Publish done
    this.eventService.publishDone(conversationId, aiMessage.id);

    // Save AI run
    await this.prisma.aiRun.create({
      data: {
        tenantId,
        conversationId,
        model,
        confidence: searchResults[0]?.score || 0,
        status: 'completed',
        promptTokens: 100,
        completionTokens: 50
      }
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    return {
      messageId: aiMessage.id,
      content: response,
      citations,
      model
    };
  }

  private async triggerHandoff(tenantId: string, conversationId: string, reason: string) {
    // Update conversation status
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'queued_human' }
    });

    // Create handoff event
    await this.prisma.handoffEvent.create({
      data: { tenantId, conversationId, reason, fromState: 'open_ai', toState: 'queued_human' }
    });

    // Publish handoff event
    this.eventService.publishHandoff(conversationId, reason);

    // Save system message
    const systemMessage = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        role: 'system',
        content: `会话已转接人工坐席。原因：${reason}`
      }
    });

    // Save AI run
    await this.prisma.aiRun.create({
      data: { tenantId, conversationId, model: 'none', status: 'handoff' }
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: 'system',
        action: 'conversation.handoff',
        resourceType: 'conversation',
        resourceId: conversationId,
        metadata: { reason }
      }
    });

    return {
      messageId: systemMessage.id,
      content: '正在为您转接人工客服，请稍候...',
      handoff: true,
      reason
    };
  }
}
