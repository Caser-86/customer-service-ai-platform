#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`✗ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    failed++;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath));
}

function dirExists(dirPath) {
  return fs.existsSync(path.resolve(dirPath)) && 
         fs.statSync(path.resolve(dirPath)).isDirectory();
}

function fileContains(filePath, content) {
  if (!fileExists(filePath)) return false;
  const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return fileContent.includes(content);
}

console.log('\n=== 自检开始 ===\n');

// Critical files check
console.log('--- 关键文件检查 ---');
check('package.json 存在', () => fileExists('package.json'));
check('pnpm-workspace.yaml 存在', () => fileExists('pnpm-workspace.yaml'));
check('turbo.json 存在', () => fileExists('turbo.json'));

// API app check
console.log('\n--- API 应用检查 ---');
check('apps/api/package.json 存在', () => fileExists('apps/api/package.json'));
check('apps/api/tsconfig.json 存在', () => fileExists('apps/api/tsconfig.json'));
check('apps/api/prisma/schema.prisma 存在', () => fileExists('apps/api/prisma/schema.prisma'));
check('apps/api/src/main.ts 存在', () => fileExists('apps/api/src/main.ts'));
check('apps/api/src/app.module.ts 存在', () => fileExists('apps/api/src/app.module.ts'));

// Web app check
console.log('\n--- Web 应用检查 ---');
check('apps/web/package.json 存在', () => fileExists('apps/web/package.json'));
check('apps/web/tsconfig.json 存在', () => fileExists('apps/web/tsconfig.json'));
check('apps/web/next.config.js 存在', () => fileExists('apps/web/next.config.js'));
check('apps/web/tailwind.config.js 存在', () => fileExists('apps/web/tailwind.config.js'));
check('apps/web/src/app/layout.tsx 存在', () => fileExists('apps/web/src/app/layout.tsx'));

// Shared package check
console.log('\n--- Shared 包检查 ---');
check('packages/shared/package.json 存在', () => fileExists('packages/shared/package.json'));
check('packages/shared/src/index.ts 存在', () => fileExists('packages/shared/src/index.ts'));
check('packages/shared/src/types.ts 存在', () => fileExists('packages/shared/src/types.ts'));

// Infrastructure check
console.log('\n--- 基础设施检查 ---');
check('infra/docker/docker-compose.yml 存在', () => fileExists('infra/docker/docker-compose.yml'));
check('infra/nginx/nginx.conf 存在', () => fileExists('infra/nginx/nginx.conf'));

// Scripts check
console.log('\n--- 脚本检查 ---');
check('scripts/self-check/run-self-check.js 存在', () => fileExists('scripts/self-check/run-self-check.js'));
check('scripts/acceptance/run-acceptance.js 存在', () => fileExists('scripts/acceptance/run-acceptance.js'));

// Docker files check
console.log('\n--- Docker 文件检查 ---');
check('apps/api/Dockerfile 存在', () => fileExists('apps/api/Dockerfile'));
check('apps/web/Dockerfile 存在', () => fileExists('apps/web/Dockerfile'));

// Content checks
console.log('\n--- 内容检查 ---');
check('Prisma schema 包含 Tenant 模型', () => fileContains('apps/api/prisma/schema.prisma', 'model Tenant'));
check('Prisma schema 包含 User 模型', () => fileContains('apps/api/prisma/schema.prisma', 'model User'));
check('Prisma schema 包含 Conversation 模型', () => fileContains('apps/api/prisma/schema.prisma', 'model Conversation'));
check('Prisma schema 包含 Message 模型', () => fileContains('apps/api/prisma/schema.prisma', 'model Message'));
check('Prisma schema 包含 KnowledgeDocument 模型', () => fileContains('apps/api/prisma/schema.prisma', 'model KnowledgeDocument'));

// No TODO/TBD check
console.log('\n--- 占位符检查 ---');
const srcFiles = [
  'apps/api/src/main.ts',
  'apps/api/src/app.module.ts',
  'apps/web/src/app/page.tsx',
];
const hasPlaceholders = srcFiles.some(file => {
  if (!fileExists(file)) return false;
  const content = fs.readFileSync(path.resolve(file), 'utf-8');
  return content.includes('TODO') || content.includes('TBD');
});
check('无 TODO/TBD 占位符', () => !hasPlaceholders);

console.log('\n=== 自检结果 ===');
console.log(`通过: ${passed}`);
console.log(`失败: ${failed}`);
console.log(`总计: ${passed + failed}`);

if (failed > 0) {
  console.log('\n❌ 自检未通过');
  process.exit(1);
} else {
  console.log('\n✅ 自检通过');
  process.exit(0);
}
