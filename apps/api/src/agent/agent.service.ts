import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationEventService } from '../events/conversation-event.service';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private eventService: ConversationEventService
  ) {}

  async getInbox(tenantId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        tenantId,
        status: { in: ['queued_human', 'assigned_human'] }
      },
      include: {
        visitor: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        assignedAgent: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return conversations;
  }

  async claimConversation(
    tenantId: string,
    conversationId: string,
    agentId: string
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.status !== 'queued_human') {
      throw new ForbiddenException(
        'Conversation is not available for claiming'
      );
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'assigned_human',
        assignedAgentId: agentId
      }
    });

    await this.prisma.handoffEvent.create({
      data: {
        tenantId,
        conversationId,
        reason: 'agent_claimed',
        fromState: 'queued_human',
        toState: 'assigned_human'
      }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: agentId,
        action: 'conversation.claim',
        resourceType: 'conversation',
        resourceId: conversationId
      }
    });

    return updated;
  }

  async replyToConversation(
    tenantId: string,
    conversationId: string,
    agentId: string,
    content: string
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId, assignedAgentId: agentId }
    });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found or not assigned to you'
      );
    }

    const message = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId,
        role: 'agent',
        content
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: agentId,
        action: 'conversation.reply',
        resourceType: 'conversation',
        resourceId: conversationId,
        metadata: { messageId: message.id }
      }
    });

    // Publish agent reply event for real-time updates
    this.eventService.publishAgentReply(conversationId, message.id, content);

    return message;
  }

  async closeConversation(
    tenantId: string,
    conversationId: string,
    agentId: string
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId, assignedAgentId: agentId }
    });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found or not assigned to you'
      );
    }

    const updated = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'closed' }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: agentId,
        action: 'conversation.close',
        resourceType: 'conversation',
        resourceId: conversationId
      }
    });

    return updated;
  }

  async createTicket(
    tenantId: string,
    conversationId: string,
    agentId: string,
    data: { title: string; description?: string; priority?: string }
  ) {
    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        conversationId,
        title: data.title,
        description: data.description,
        priority: (data.priority as any) || 'medium',
        creatorId: agentId,
        status: 'open'
      }
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: agentId,
        action: 'ticket.create',
        resourceType: 'ticket',
        resourceId: ticket.id,
        metadata: { conversationId }
      }
    });

    return ticket;
  }
}
