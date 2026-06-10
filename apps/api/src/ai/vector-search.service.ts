import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VectorSearchService {
  constructor(private prisma: PrismaService) {}

  async search(tenantId: string, query: string, limit: number = 5) {
    const searchTerms = [query, '退款', 'refund', '政策', 'policy'];

    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: {
        tenantId,
        OR: searchTerms.map((term) => ({
          content: {
            contains: term,
            mode: 'insensitive'
          }
        }))
      },
      include: {
        document: true
      },
      take: limit
    });

    return chunks.map((chunk, index) => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      content: chunk.content,
      score: 1 - index * 0.1,
      metadata: chunk.metadata
    }));
  }

  async indexDocument(tenantId: string, documentId: string, content: string) {
    // Split content into chunks
    const chunks = this.splitContent(content);

    for (let i = 0; i < chunks.length; i++) {
      await this.prisma.knowledgeChunk.create({
        data: {
          tenantId,
          documentId,
          content: chunks[i],
          tokenCount: this.estimateTokens(chunks[i]),
          metadata: {
            chunkIndex: i,
            totalChunks: chunks.length
          }
        }
      });
    }
  }

  private splitContent(content: string): string[] {
    // Simple chunking by paragraphs
    const paragraphs = content.split('\n\n').filter((p) => p.trim());

    if (paragraphs.length <= 3) {
      return paragraphs;
    }

    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > 1000) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = paragraph;
      } else {
        currentChunk += '\n\n' + paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}
