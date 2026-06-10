'use client';

import { useState } from 'react';
import { MessageList } from './MessageList';
import { Composer } from './Composer';

interface ConversationWorkspaceProps {
  conversation: any;
  onClaim: (id: string) => void;
  onReply: (id: string, content: string) => void;
  onClose: (id: string) => void;
}

export function ConversationWorkspace({
  conversation,
  onClaim,
  onReply,
  onClose,
}: ConversationWorkspaceProps) {
  const [loading, setLoading] = useState(false);

  const handleReply = async (content: string) => {
    setLoading(true);
    await onReply(conversation.id, content);
    setLoading(false);
  };

  const handleCreateTicket = async () => {
    const title = prompt('请输入工单标题');
    if (title) {
      const token = localStorage.getItem('token');
      await fetch(`/api/agent/conversations/${conversation.id}/tickets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, priority: 'medium' }),
      });
      alert('工单已创建');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-dark-800 bg-dark-900 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">
            {conversation.visitor?.name || '访客'}
          </h2>
          <p className="text-sm text-dark-400">
            {conversation.visitor?.email || '-'} | {conversation.status}
          </p>
        </div>

        <div className="flex space-x-2">
          {conversation.status === 'queued_human' && (
            <button
              onClick={() => onClaim(conversation.id)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
            >
              接管会话
            </button>
          )}
          <button
            onClick={handleCreateTicket}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded-lg"
          >
            创建工单
          </button>
          <button
            onClick={() => onClose(conversation.id)}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white text-sm rounded-lg"
          >
            关闭
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList messages={conversation.messages || []} loading={loading} />
      </div>

      <Composer
        onSend={handleReply}
        disabled={loading || conversation.status === 'closed'}
      />
    </div>
  );
}
