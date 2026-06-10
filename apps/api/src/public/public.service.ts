import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiOrchestratorService } from '../ai/ai-orchestrator.service';
import * as crypto from 'crypto';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private aiOrchestrator: AiOrchestratorService
  ) {}

  async createConversation(
    tenantId: string,
    data: { name?: string; email?: string; metadata?: any }
  ) {
    let tenant = await this.prisma.tenant.findFirst({
      where: { slug: tenantId }
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId }
      });
    }

    if (!tenant) {
      tenant = await this.prisma.tenant.findFirst({
        where: { status: 'active' }
      });
    }

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

    const visitorToken = this.generateVisitorToken(visitor.id, conversation.id);

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

  async sendMessage(tenantId: string, conversationId: string, content: string) {
    let tenant = await this.prisma.tenant.findFirst({
      where: { slug: tenantId }
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId }
      });
    }

    if (!tenant) {
      tenant = await this.prisma.tenant.findFirst({
        where: { status: 'active' }
      });
    }

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId: tenant.id }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const visitorMessage = await this.prisma.message.create({
      data: {
        tenantId: tenant.id,
        conversationId,
        role: 'visitor',
        content
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    const aiResponse = await this.aiOrchestrator.handleVisitorMessage(
      tenant.id,
      conversationId,
      content
    );

    return {
      messageId: visitorMessage.id,
      streamUrl: `/api/public/conversations/${conversationId}/events`,
      aiResponse
    };
  }

  async getConversationEvents(tenantId: string, conversationId: string) {
    const messages = await this.prisma.message.findMany({
      where: { tenantId, conversationId },
      orderBy: { createdAt: 'asc' }
    });

    return messages;
  }

  private generateVisitorToken(
    visitorId: string,
    conversationId: string
  ): string {
    const payload = { visitorId, conversationId };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}
