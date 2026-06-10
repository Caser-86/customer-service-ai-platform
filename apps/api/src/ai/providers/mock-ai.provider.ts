import { Injectable } from '@nestjs/common';

@Injectable()
export class MockAiProvider {
  private readonly responses = new Map<string, string>([
    [
      '退款',
      '根据我们的退款政策，您可以在购买后30天内申请退款。请提供您的订单号，我将为您处理退款申请。'
    ],
    [
      '退货',
      '我们支持7天无理由退货。请确保商品保持原包装状态，我们将安排快递上门取件。'
    ],
    [
      '发货',
      '一般订单会在24小时内发货，物流信息将在发货后更新。您可以通过订单详情页查看物流状态。'
    ],
    [
      '密码',
      '如果您忘记了密码，可以点击登录页面的"忘记密码"链接，通过邮箱重置密码。'
    ],
    [
      '账号',
      '如需修改账号信息，请登录后进入"个人中心"进行编辑。如遇问题请联系客服。'
    ],
    [
      'refund',
      'According to our refund policy, you can apply for a refund within 30 days of purchase. Please provide your order number.'
    ],
    ['human', 'I will transfer you to a human agent. Please wait a moment.']
  ]);

  private readonly defaultResponse =
    '感谢您的咨询。您的问题已记录，我们将尽快为您处理。如需紧急帮助，请拨打客服热线 400-xxx-xxxx。';

  async generate(
    query: string,
    citations: any[]
  ): Promise<{ content: string; model: string }> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    let response = this.defaultResponse;

    for (const [keyword, answer] of this.responses) {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        response = answer;
        break;
      }
    }

    if (citations.length > 0) {
      response +=
        '\n\n参考来源：' +
        citations.map((c) => c.content.substring(0, 50)).join('；');
    }

    return {
      content: response,
      model: 'mock-gpt-4'
    };
  }
}
