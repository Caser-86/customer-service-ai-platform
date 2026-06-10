export const CONVERSATION_STATUS = {
  OPEN_AI: 'open_ai',
  QUEUED_HUMAN: 'queued_human',
  ASSIGNED_HUMAN: 'assigned_human',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const MESSAGE_ROLE = {
  VISITOR: 'visitor',
  ASSISTANT: 'assistant',
  AGENT: 'agent',
  SYSTEM: 'system',
} as const;

export const TICKET_STATUS = {
  OPEN: 'open',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const KNOWLEDGE_STATUS = {
  UPLOADED: 'uploaded',
  INDEXING: 'indexing',
  INDEXED: 'indexed',
  FAILED: 'failed',
} as const;

export const AI_RUN_STATUS = {
  STARTED: 'started',
  COMPLETED: 'completed',
  HANDOFF: 'handoff',
  FAILED: 'failed',
} as const;

export const HANDOFF_KEYWORDS = ['人工', '转人工', '客服', '投诉'];

export const DEFAULT_HANDOFF_THRESHOLD = 0.3;

export const API_PREFIX = '/api';

export const SSE_EVENT_TYPES = {
  TOKEN: 'token',
  CITATION: 'citation',
  HANDOFF: 'handoff',
  DONE: 'done',
} as const;
