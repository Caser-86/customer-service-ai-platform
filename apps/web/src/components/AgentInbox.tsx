'use client';

interface Conversation {
  id: string;
  status: string;
  visitor: { name?: string; email?: string };
  messages: any[];
  assignedAgent?: { name: string };
  lastMessageAt: string;
}

interface AgentInboxProps {
  conversations: Conversation[];
  onSelect: (conversation: Conversation) => void;
  selectedId?: string;
  loading: boolean;
}

export function AgentInbox({ conversations, onSelect, selectedId, loading }: AgentInboxProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-dark-500">加载中...</div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-dark-500">暂无待处理会话</div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={`p-4 border-b border-dark-800 cursor-pointer hover:bg-dark-800 transition-colors ${
            selectedId === conv.id ? 'bg-dark-800' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-white">
              {conv.visitor?.name || '访客'}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                conv.status === 'queued_human'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {conv.status === 'queued_human' ? '等待中' : '已分配'}
            </span>
          </div>

          <div className="text-sm text-dark-400 truncate mb-2">
            {conv.messages?.[0]?.content || '暂无消息'}
          </div>

          <div className="flex items-center justify-between text-xs text-dark-500">
            <span>{conv.visitor?.email || '-'}</span>
            <span>{new Date(conv.lastMessageAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
