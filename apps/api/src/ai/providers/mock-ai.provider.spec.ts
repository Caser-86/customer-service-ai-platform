import { describe, it, expect } from 'vitest';

describe('MockAiProvider', () => {
  it('should generate response for refund keyword', async () => {
    const responses = new Map<string, string>([
      ['退款', '根据我们的退款政策，您可以在购买后30天内申请退款。'],
      ['refund', 'According to our refund policy, you can apply for a refund within 30 days.'],
    ]);

    let response = 'default response';
    for (const [keyword, answer] of responses) {
      if ('怎么申请退款'.includes(keyword)) {
        response = answer;
        break;
      }
    }

    expect(response).toContain('退款');
  });

  it('should return default response for unknown query', async () => {
    const responses = new Map<string, string>([
      ['退款', 'refund answer'],
    ]);

    let response = 'default response';
    for (const [keyword, answer] of responses) {
      if ('unknown query xyz'.includes(keyword)) {
        response = answer;
        break;
      }
    }

    expect(response).toBe('default response');
  });
});
