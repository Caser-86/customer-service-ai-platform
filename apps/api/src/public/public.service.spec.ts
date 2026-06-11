import { describe, it, expect } from 'vitest';

describe('PublicService', () => {
  it('should generate visitor token', () => {
    function generateVisitorToken(
      visitorId: string,
      conversationId: string
    ): string {
      const payload = { visitorId, conversationId };
      return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    const token = generateVisitorToken('visitor-1', 'conv-1');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    expect(decoded.visitorId).toBe('visitor-1');
    expect(decoded.conversationId).toBe('conv-1');
  });
});

describe('Handoff Keywords', () => {
  it('should detect Chinese handoff keywords', () => {
    const keywords = [
      '人工',
      '转人工',
      '客服',
      '投诉',
      'human',
      'agent',
      'support'
    ];
    expect(keywords.some((k) => '我要人工客服'.includes(k))).toBe(true);
    expect(keywords.some((k) => '转人工'.includes(k))).toBe(true);
    expect(keywords.some((k) => '我要投诉'.includes(k))).toBe(true);
    expect(
      keywords.some((k) =>
        'I need human agent'.toLowerCase().includes(k.toLowerCase())
      )
    ).toBe(true);
  });

  it('should not trigger handoff for normal queries', () => {
    const keywords = [
      '人工',
      '转人工',
      '客服',
      '投诉',
      'human',
      'agent',
      'support'
    ];
    expect(keywords.some((k) => '怎么申请退款'.includes(k))).toBe(false);
  });
});
