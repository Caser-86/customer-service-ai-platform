import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VectorSearchService } from '../ai/vector-search.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private vectorSearch: VectorSearchService
  ) {}

  async uploadDocument(
    tenantId: string,
    data: { title: string; content: string; sourceType?: string }
  ) {
    const document = await this.prisma.knowledgeDocument.create({
      data: {
        tenantId,
        title: data.title,
        content: data.content,
        sourceType: data.sourceType || 'markdown',
        status: 'uploaded'
      }
    });

    // Start indexing asynchronously
    this.indexDocument(tenantId, document.id, data.content).catch(
      console.error
    );

    return document;
  }

  private async indexDocument(
    tenantId: string,
    documentId: string,
    content: string
  ) {
    await this.prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: 'indexing' }
    });

    try {
      await this.vectorSearch.indexDocument(tenantId, documentId, content);

      await this.prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'indexed' }
      });

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          actorId: 'system',
          action: 'knowledge.index',
          resourceType: 'document',
          resourceId: documentId
        }
      });
    } catch (error) {
      await this.prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'failed' }
      });
      throw error;
    }
  }

  async reindexAll(tenantId: string) {
    const documents = await this.prisma.knowledgeDocument.findMany({
      where: { tenantId }
    });

    for (const doc of documents) {
      await this.prisma.knowledgeChunk.deleteMany({
        where: { documentId: doc.id }
      });

      await this.indexDocument(tenantId, doc.id, doc.content);
    }

    return { reindexed: documents.length };
  }

  async getDocuments(tenantId: string) {
    return this.prisma.knowledgeDocument.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAnalytics(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalConversations = await this.prisma.conversation.count({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } }
    });

    const aiResolved = await this.prisma.conversation.count({
      where: {
        tenantId,
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['resolved', 'closed'] },
        assignedAgentId: null
      }
    });

    const handoffs = await this.prisma.handoffEvent.count({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } }
    });

    const totalTickets = await this.prisma.ticket.count({
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } }
    });

    await this.prisma.message.aggregate({
      where: {
        tenantId,
        role: 'assistant',
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: true
    });

    return {
      totalConversations,
      aiResolved,
      handoffs,
      autoResolveRate:
        totalConversations > 0
          ? ((aiResolved / totalConversations) * 100).toFixed(1)
          : 0,
      handoffRate:
        totalConversations > 0
          ? ((handoffs / totalConversations) * 100).toFixed(1)
          : 0,
      totalTickets,
      avgResponseTime: '2.3s' // Simplified
    };
  }

  async getAuditLogs(tenantId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        include: {
          actor: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.auditLog.count({
        where: { tenantId }
      })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateBotConfig(
    tenantId: string,
    data: { provider?: string; model?: string; handoffThreshold?: number }
  ) {
    const existing = await this.prisma.botConfig.findFirst({
      where: { tenantId }
    });

    if (existing) {
      return this.prisma.botConfig.update({
        where: { id: existing.id },
        data
      });
    }

    return this.prisma.botConfig.create({
      data: {
        tenantId,
        provider: data.provider || 'mock',
        model: data.model || 'gpt-4',
        handoffThreshold: data.handoffThreshold || 0.3
      }
    });
  }

  async getTeamMembers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        status: true,
        createdAt: true
      }
    });
  }
}
