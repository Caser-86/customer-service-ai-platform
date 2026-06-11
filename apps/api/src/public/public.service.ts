import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiOrchestratorService } from '../ai/ai-orchestrator.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PublicService {
  private readonly visitorTokenSecret: string;

  constructor(
    private prisma: PrismaService,
    private aiOrchestrator: AiOrchestratorService,
    private configService: ConfigService
  ) {
    this.visitorTokenSecret =
      this.configService.get<string>('VISITOR_TOKEN_SECRET') ||
      'visitor-secret-change-me';
  }

  async createConversation(
    tenantSlug: string,
    data: { name?: string; email?: string; metadata?: any }
  ) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { slug: tenantSlug, status: 'active' }
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const visitor = await this.prisma.visitor.create({
      data: {
        tenantId: tenant.id,
        externalId: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        metadata: data.metadata
      }
    });

    const conversation = await this.prisma.conversation.create({
      data: {
        tenantId: tenant.id,
        visitorId: visitor.id,
        channel: 'web',
        status: 'open_ai'
      }
    });

    const visitorToken = this.generateVisitorToken(
      visitor.id,
      conversation.id,
      tenant.id
    );

    return {
      conversationId: conversation.id,
      visitorToken,
      visitor: {
        id: visitor.id,
        name: visitor.name,
        email: visitor.email
      }
    };
  }

  async sendMessage(
    visitorToken: string,
    conversationId: string,
    content: string
  ) {
    const tokenData = this.verifyVisitorToken(visitorToken);
    if (tokenData.conversationId !== conversationId) {
      throw new UnauthorizedException('Invalid token for this conversation');
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        tenantId: tokenData.tenantId,
        visitorId: tokenData.visitorId
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const aiResponse = await this.aiOrchestrator.handleVisitorMessage(
      tokenData.tenantId,
      conversationId,
      content
    );

    return {
      streamUrl: `/api/public/conversations/${conversationId}/events`,
      aiResponse
    };
  }

  async getConversationEvents(visitorToken: string, conversationId: string) {
    const tokenData = this.verifyVisitorToken(visitorToken);
    if (tokenData.conversationId !== conversationId) {
      throw new UnauthorizedException('Invalid token for this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        tenantId: tokenData.tenantId,
        conversationId
      },
      orderBy: { createdAt: 'asc' }
    });

    return messages;
  }

  private generateVisitorToken(
    visitorId: string,
    conversationId: string,
    tenantId: string
  ): string {
    const payload = JSON.stringify({ visitorId, conversationId, tenantId });
    const signature = crypto
      .createHmac('sha256', this.visitorTokenSecret)
      .update(payload)
      .digest('hex');
    const tokenData = JSON.stringify({ payload, signature });
    return Buffer.from(tokenData).toString('base64');
  }

  verifyVisitorTokenPublic(token: string, conversationId: string): void {
    const tokenData = this.verifyVisitorToken(token);
    if (tokenData.conversationId !== conversationId) {
      throw new UnauthorizedException('Invalid token for this conversation');
    }
  }

  private verifyVisitorToken(token: string): {
    visitorId: string;
    conversationId: string;
    tenantId: string;
  } {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const expectedSignature = crypto
        .createHmac('sha256', this.visitorTokenSecret)
        .update(decoded.payload)
        .digest('hex');

      if (decoded.signature !== expectedSignature) {
        throw new UnauthorizedException('Invalid visitor token');
      }

      return JSON.parse(decoded.payload);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid visitor token');
    }
  }
}
