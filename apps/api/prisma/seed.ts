import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据...');

  // 创建租户
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: '默认租户',
      slug: 'default',
      plan: 'free',
      status: 'active',
    },
  });
  console.log('租户创建完成:', tenant.id);

  // Create admin
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: process.env.ADMIN_EMAIL || 'admin@example.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@example.com',
      name: '管理员',
      passwordHash: adminPasswordHash,
      roles: ['admin'],
      status: 'active',
    },
  });
  console.log('管理员创建完成:', admin.id);

  // Create agent
  const agentPassword = process.env.AGENT_PASSWORD;
  if (!agentPassword) {
    throw new Error('AGENT_PASSWORD environment variable is required');
  }
  const agentPasswordHash = await bcrypt.hash(agentPassword, 10);
  const agent = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: process.env.AGENT_EMAIL || 'agent@example.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'agent@example.com',
      name: '客服坐席',
      passwordHash: agentPasswordHash,
      roles: ['agent'],
      status: 'active',
    },
  });
  console.log('坐席创建完成:', agent.id);

  // 创建 Bot 配置
  const botConfig = await prisma.botConfig.upsert({
    where: { id: 'default-bot-config' },
    update: {},
    create: {
      id: 'default-bot-config',
      tenantId: tenant.id,
      provider: 'mock',
      model: 'mock-gpt-4',
      handoffThreshold: 0.3,
      safetyRules: {
        handoffKeywords: ['人工', '转人工', '客服', '投诉'],
        maxConfidenceThreshold: 0.3,
      },
    },
  });
  console.log('Bot 配置创建完成:', botConfig.id);

  // 创建 FAQ 文档
  const faqContent = `# 常见问题解答

## 退款政策

我们支持 30 天无理由退款。请在购买后 30 天内联系客服申请退款。

退款流程：
1. 联系客服说明退款原因
2. 提供订单号和购买凭证
3. 客服审核退款申请
4. 审核通过后，退款将在 3-5 个工作日内处理完成

## 发货时间

一般订单会在 24 小时内发货。物流信息将在发货后更新。

您可以通过以下方式查看物流状态：
- 登录账户，进入"我的订单"
- 查看订单详情中的物流信息
- 使用物流单号在物流公司官网查询

## 账号问题

### 忘记密码

如果您忘记了密码，可以：
1. 点击登录页面的"忘记密码"链接
2. 输入注册邮箱
3. 查收重置密码邮件
4. 点击链接设置新密码

### 修改账号信息

如需修改账号信息：
1. 登录后进入"个人中心"
2. 点击"编辑资料"
3. 修改需要更新的信息
4. 保存更改

## 联系方式

- 客服热线：400-xxx-xxxx
- 服务时间：周一至周五 9:00-18:00
- 邮箱：support@example.com
`;

  const faqDoc = await prisma.knowledgeDocument.upsert({
    where: { id: 'faq-document' },
    update: {},
    create: {
      id: 'faq-document',
      tenantId: tenant.id,
      title: '常见问题解答',
      sourceType: 'markdown',
      content: faqContent,
      status: 'indexed',
      version: 1,
    },
  });
  console.log('FAQ 文档创建完成:', faqDoc.id);

  // 创建知识块
  const chunks = faqContent.split('\n\n').filter(chunk => chunk.trim());
  for (let i = 0; i < chunks.length; i++) {
    await prisma.knowledgeChunk.create({
      data: {
        tenantId: tenant.id,
        documentId: faqDoc.id,
        content: chunks[i].trim(),
        tokenCount: Math.ceil(chunks[i].length / 4),
        metadata: {
          chunkIndex: i,
          totalChunks: chunks.length,
        },
      },
    });
  }
  console.log('知识块创建完成:', chunks.length, '个');

  console.log('种子数据完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
