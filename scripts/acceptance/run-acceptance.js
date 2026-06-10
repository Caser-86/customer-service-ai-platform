#!/usr/bin/env node

const http = require('http');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const steps = [];
let passed = 0;
let failed = 0;
let adminToken = '';
let agentToken = '';
let conversationId = '';
let visitorToken = '';

function log(emoji, message) {
  console.log(emoji + ' ' + message);
}

async function request(method, path, body, headers) {
  headers = headers || {};
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: Object.assign({
        'Content-Type': 'application/json',
      }, headers),
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function step(name, fn) {
  try {
    await fn();
    log('PASS', name);
    passed++;
    steps.push({ name: name, status: 'passed' });
  } catch (error) {
    log('FAIL', name + ': ' + error.message);
    failed++;
    steps.push({ name: name, status: 'failed', error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n=== Acceptance Tests ===\n');

  // Step 1: Health check
  await step('1. Health ready', async () => {
    const res = await request('GET', '/api/health/ready');
    assert(res.status === 'ready', 'Expected ready, got ' + res.status);
  });

  // Step 2: Admin login
  await step('2. Admin login', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123',
    });
    assert(res.ok === true, 'Login failed');
    adminToken = res.data.token;
    assert(adminToken, 'No token');
  });

  // Step 3: Agent login
  await step('3. Agent login', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'agent@example.com',
      password: 'password123',
    });
    assert(res.ok === true, 'Login failed');
    agentToken = res.data.token;
    assert(agentToken, 'No token');
  });

  // Step 4: Upload FAQ
  await step('4. Upload FAQ', async () => {
    const res = await request('POST', '/api/admin/knowledge/documents', {
      title: 'Refund Policy',
      content: 'We support 30-day refund. Contact customer service within 30 days.',
      sourceType: 'markdown',
    }, {
      Authorization: 'Bearer ' + adminToken,
    });
    assert(res.ok === true, 'Upload failed');
  });

  // Step 5: Wait for indexing
  await step('5. Wait for indexing', async () => {
    await sleep(2000);
    const res = await request('GET', '/api/admin/knowledge/documents', null, {
      Authorization: 'Bearer ' + adminToken,
    });
    assert(res.ok === true, 'Get docs failed');
  });

  // Step 6: Create conversation
  await step('6. Create conversation', async () => {
    const res = await request('POST', '/api/public/conversations', {
      tenantId: 'default-tenant',
      name: 'Test User',
      email: 'test@example.com',
    });
    console.log('Create conversation response:', JSON.stringify(res));
    assert(res.ok === true, 'Create conversation failed: ' + JSON.stringify(res));
    conversationId = res.data.conversationId;
    visitorToken = res.data.visitorToken;
    assert(conversationId, 'No conversation ID');
  });

  // Step 7: Send question
  await step('7. Send refund question', async () => {
    const res = await request('POST', '/api/public/conversations/' + conversationId + '/messages', {
      content: 'How to apply for refund?',
      tenantId: 'default-tenant',
    });
    assert(res.ok === true, 'Send message failed');
    assert(res.data.aiResponse, 'No AI response');
  });

  // Step 8: Check AI response
  await step('8. AI returns answer', async () => {
    const res = await request('POST', '/api/public/conversations/' + conversationId + '/messages', {
      content: 'Refund process?',
      tenantId: 'default-tenant',
    });
    assert(res.ok === true, 'Get response failed');
    assert(res.data.aiResponse.content, 'AI returned no content');
  });

  // Step 9: Check citation
  await step('9. AI returns citation', async () => {
    const res = await request('POST', '/api/public/conversations/' + conversationId + '/messages', {
      content: 'Refund policy details',
      tenantId: 'default-tenant',
    });
    assert(res.ok === true, 'Get response failed');
    assert(res.data.aiResponse.citations, 'No citations');
  });

  // Step 10: Trigger handoff
  await step('10. Trigger handoff', async () => {
    const res = await request('POST', '/api/public/conversations/' + conversationId + '/messages', {
      content: 'I need human agent',
      tenantId: 'default-tenant',
    });
    assert(res.ok === true, 'Send message failed');
    assert(res.data.aiResponse.handoff === true, 'Handoff not triggered');
  });

  // Step 11: Check conversation status
  await step('11. Conversation status changed', async () => {
    await sleep(500);
    const res = await request('GET', '/api/agent/inbox', null, {
      Authorization: 'Bearer ' + agentToken,
    });
    assert(res.ok === true, 'Get inbox failed');
    const conv = res.data.find(c => c.id === conversationId);
    assert(conv, 'Conversation not found');
    assert(conv.status === 'queued_human', 'Status is ' + conv.status);
  });

  // Step 12: Agent claim
  await step('12. Agent claim conversation', async () => {
    const res = await request('POST', '/api/agent/conversations/' + conversationId + '/claim', null, {
      Authorization: 'Bearer ' + agentToken,
    });
    assert(res.ok === true, 'Claim failed');
  });

  // Step 13: Agent reply
  await step('13. Agent reply', async () => {
    const res = await request('POST', '/api/agent/conversations/' + conversationId + '/reply', {
      content: 'Hello, I am your human agent. How can I help you?',
    }, {
      Authorization: 'Bearer ' + agentToken,
    });
    assert(res.ok === true, 'Reply failed');
  });

  // Step 14: Create ticket
  await step('14. Create ticket', async () => {
    const res = await request('POST', '/api/agent/conversations/' + conversationId + '/tickets', {
      title: 'Refund Request Ticket',
      description: 'User requested refund',
      priority: 'medium',
    }, {
      Authorization: 'Bearer ' + agentToken,
    });
    assert(res.ok === true, 'Create ticket failed');
  });

  // Step 15: Check analytics
  await step('15. Analytics data', async () => {
    const res = await request('GET', '/api/admin/analytics/overview', null, {
      Authorization: 'Bearer ' + adminToken,
    });
    assert(res.ok === true, 'Get analytics failed');
    assert(res.data.totalConversations >= 0, 'No conversation data');
  });

  // Step 16: Check audit logs
  await step('16. Audit logs', async () => {
    const res = await request('GET', '/api/admin/audit', null, {
      Authorization: 'Bearer ' + adminToken,
    });
    assert(res.ok === true, 'Get audit logs failed');
    assert(res.data.logs.length > 0, 'No audit logs');
  });

  console.log('\n=== Results ===');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  console.log('Total: ' + (passed + failed));

  const result = {
    status: failed === 0 ? 'passed' : 'failed',
    mode: process.env.AI_MODE || 'mock',
    timestamp: new Date().toISOString(),
    steps: steps,
  };

  console.log('\n--- JSON Result ---');
  console.log(JSON.stringify(result, null, 2));

  if (failed > 0) {
    console.log('\nAcceptance FAILED');
    process.exit(1);
  } else {
    console.log('\nAcceptance PASSED');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
