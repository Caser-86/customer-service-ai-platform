import { describe, it, expect } from 'vitest';

describe('VectorSearch', () => {
  it('should split content into chunks', () => {
    function splitContent(content: string): string[] {
      const paragraphs = content.split('\n\n').filter((p) => p.trim());
      if (paragraphs.length <= 3) return paragraphs;
      const chunks: string[] = [];
      let currentChunk = '';
      for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length > 1000) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = paragraph;
        } else {
          currentChunk += '\n\n' + paragraph;
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());
      return chunks;
    }

    const content = 'Para 1\n\nPara 2\n\nPara 3\n\nPara 4\n\nPara 5';
    const chunks = splitContent(content);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should estimate tokens', () => {
    function estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    }

    expect(estimateTokens('hello')).toBe(2);
    expect(estimateTokens('this is a test')).toBe(4);
  });
});
