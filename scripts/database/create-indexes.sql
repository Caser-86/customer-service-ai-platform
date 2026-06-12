-- 数据库索引优化脚本

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 访客表索引
CREATE INDEX IF NOT EXISTS idx_visitors_tenant_id ON visitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);
CREATE INDEX IF NOT EXISTS idx_visitors_external_id ON visitors(external_id);

-- 对话表索引
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_visitor_id ON conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- 消息表索引
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 知识库文档索引
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant_id ON knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source_type ON knowledge_documents(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);

-- 知识库分块索引
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_tenant_id ON knowledge_chunks(tenant_id);

-- AI 运行记录索引
CREATE INDEX IF NOT EXISTS idx_ai_runs_conversation_id ON ai_runs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_tenant_id ON ai_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created_at ON ai_runs(created_at);

-- 转接事件索引
CREATE INDEX IF NOT EXISTS idx_handoff_events_conversation_id ON handoff_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_handoff_events_tenant_id ON handoff_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_handoff_events_created_at ON handoff_events(created_at);

-- 工单表索引
CREATE INDEX IF NOT EXISTS idx_tickets_conversation_id ON tickets(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- QA 评分索引
CREATE INDEX IF NOT EXISTS idx_qa_scores_conversation_id ON qa_scores(conversation_id);
CREATE INDEX IF NOT EXISTS idx_qa_scores_tenant_id ON qa_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qa_scores_created_at ON qa_scores(created_at);

-- 审计日志索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 复合索引
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status ON conversations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_created ON conversations(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action ON audit_logs(tenant_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);

-- 全文搜索索引（如果需要）
-- CREATE INDEX IF NOT EXISTS idx_messages_content_fts ON messages USING gin(to_tsvector('english', content));
-- CREATE INDEX IF NOT EXISTS idx_knowledge_documents_content_fts ON knowledge_documents USING gin(to_tsvector('english', content));
