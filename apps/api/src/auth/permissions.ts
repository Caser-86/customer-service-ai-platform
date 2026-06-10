export enum Permission {
  // Auth
  LOGIN = 'auth.login',
  
  // Knowledge
  KNOWLEDGE_READ = 'knowledge.read',
  KNOWLEDGE_WRITE = 'knowledge.write',
  KNOWLEDGE_DELETE = 'knowledge.delete',
  
  // Bot
  BOT_READ = 'bot.read',
  BOT_WRITE = 'bot.write',
  
  // Team
  TEAM_READ = 'team.read',
  TEAM_WRITE = 'team.write',
  
  // Conversation
  CONVERSATION_READ = 'conversation.read',
  CONVERSATION_CLAIM = 'conversation.claim',
  CONVERSATION_REPLY = 'conversation.reply',
  CONVERSATION_CLOSE = 'conversation.close',
  
  // Ticket
  TICKET_READ = 'ticket.read',
  TICKET_CREATE = 'ticket.create',
  TICKET_UPDATE = 'ticket.update',
  
  // Analytics
  ANALYTICS_READ = 'analytics.read',
  
  // Audit
  AUDIT_READ = 'audit.read',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    Permission.LOGIN,
    Permission.KNOWLEDGE_READ,
    Permission.KNOWLEDGE_WRITE,
    Permission.KNOWLEDGE_DELETE,
    Permission.BOT_READ,
    Permission.BOT_WRITE,
    Permission.TEAM_READ,
    Permission.TEAM_WRITE,
    Permission.CONVERSATION_READ,
    Permission.CONVERSATION_CLAIM,
    Permission.CONVERSATION_REPLY,
    Permission.CONVERSATION_CLOSE,
    Permission.TICKET_READ,
    Permission.TICKET_CREATE,
    Permission.TICKET_UPDATE,
    Permission.ANALYTICS_READ,
    Permission.AUDIT_READ,
  ],
  agent: [
    Permission.LOGIN,
    Permission.CONVERSATION_READ,
    Permission.CONVERSATION_CLAIM,
    Permission.CONVERSATION_REPLY,
    Permission.CONVERSATION_CLOSE,
    Permission.TICKET_READ,
    Permission.TICKET_CREATE,
    Permission.TICKET_UPDATE,
  ],
  supervisor: [
    Permission.LOGIN,
    Permission.CONVERSATION_READ,
    Permission.CONVERSATION_CLAIM,
    Permission.CONVERSATION_REPLY,
    Permission.CONVERSATION_CLOSE,
    Permission.TICKET_READ,
    Permission.TICKET_CREATE,
    Permission.TICKET_UPDATE,
    Permission.ANALYTICS_READ,
    Permission.AUDIT_READ,
  ],
  viewer: [
    Permission.LOGIN,
    Permission.CONVERSATION_READ,
    Permission.TICKET_READ,
    Permission.ANALYTICS_READ,
  ],
};

export function hasPermission(roles: string[], permission: Permission): boolean {
  return roles.some(role => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions?.includes(permission);
  });
}
