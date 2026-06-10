export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'deleted';
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'agent' | 'supervisor' | 'viewer';

export interface Visitor {
  id: string;
  tenantId: string;
  externalId?: string;
  name?: string;
  email?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  tenantId: string;
  visitorId: string;
  status: ConversationStatus;
  channel: string;
  assignedAgentId?: string;
  priority: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationStatus = 'open_ai' | 'queued_human' | 'assigned_human' | 'resolved' | 'closed';

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  citations?: Citation[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type MessageRole = 'visitor' | 'assistant' | 'agent' | 'system';

export interface Citation {
  documentId: string;
  content: string;
  score: number;
}

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  sourceType: string;
  content: string;
  status: KnowledgeStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type KnowledgeStatus = 'uploaded' | 'indexing' | 'indexed' | 'failed';

export interface KnowledgeChunk {
  id: string;
  tenantId: string;
  documentId: string;
  content: string;
  tokenCount: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AiRun {
  id: string;
  tenantId: string;
  conversationId: string;
  model: string;
  confidence?: number;
  status: AiRunStatus;
  promptTokens?: number;
  completionTokens?: number;
  error?: string;
  createdAt: Date;
}

export type AiRunStatus = 'started' | 'completed' | 'handoff' | 'failed';

export interface HandoffEvent {
  id: string;
  tenantId: string;
  conversationId: string;
  reason: string;
  fromState: string;
  toState: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  tenantId: string;
  conversationId?: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  creatorId: string;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface QaScore {
  id: string;
  tenantId: string;
  conversationId: string;
  score: number;
  riskFlags?: Record<string, any>;
  reviewerId?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface BotConfig {
  id: string;
  tenantId: string;
  provider: string;
  model: string;
  handoffThreshold: number;
  safetyRules?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateConversationRequest {
  tenantId?: string;
  name?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface CreateConversationResponse {
  conversationId: string;
  visitorToken: string;
  visitor: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface SendMessageRequest {
  content: string;
  tenantId?: string;
}

export interface SendMessageResponse {
  messageId: string;
  streamUrl: string;
  aiResponse: {
    messageId: string;
    content: string;
    citations: Citation[];
    model: string;
    handoff?: boolean;
    reason?: string;
  };
}
