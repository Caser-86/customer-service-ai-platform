import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OpenAiCompatibleProvider {
  private readonly logger = new Logger(OpenAiCompatibleProvider.name);

  async generate(
    query: string,
    citations: any[]
  ): Promise<{ content: string; model: string }> {
    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://api.openai.com/v1';
    const model = process.env.LLM_MODEL || 'gpt-4';

    if (!apiKey) {
      throw new Error('LLM_API_KEY not configured');
    }

    const systemPrompt = `你是一个专业的客服助手。请根据以下知识库内容回答问题。
如果知识库中没有相关信息，请如实告知用户。

知识库内容：
${citations.map((c, i) => `${i + 1}. ${c.content}`).join('\n')}`;

    try {
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content =
        data.choices[0]?.message?.content || '抱歉，暂时无法处理您的请求。';

      return { content, model };
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`);
      throw error;
    }
  }
}
