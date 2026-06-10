'use client';

import { useState, useEffect } from 'react';
import { AgentInbox } from '@/components/AgentInbox';
import { ConversationWorkspace } from '@/components/ConversationWorkspace';
import { AiCopilotPanel } from '@/components/AiCopilotPanel';
import { Sidebar } from '@/components/Sidebar';

export default function AgentPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agent/inbox', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.ok) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/agent/conversations/${conversationId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInbox();
    } catch (error) {
      console.error('Failed to claim conversation:', error);
    }
  };

  const handleReply = async (conversationId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/agent/conversations/${conversationId}/reply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const handleClose = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/agent/conversations/${conversationId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedConversation(null);
      fetchInbox();
    } catch (error) {
      console.error('Failed to close conversation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar activePage="agent" />

      <div className="flex-1 flex">
        <div className="w-80 border-r border-dark-800 bg-dark-900">
          <div className="p-4 border-b border-dark-800">
            <h1 className="text-lg font-semibold text-white">待处理会话</h1>
            <p className="text-sm text-dark-400">{conversations.length} 个会话</p>
          </div>
          <AgentInbox
            conversations={conversations}
            onSelect={setSelectedConversation}
            selectedId={selectedConversation?.id}
            loading={loading}
          />
        </div>

        <div className="flex-1 flex">
          <div className="flex-1">
            {selectedConversation ? (
              <ConversationWorkspace
                conversation={selectedConversation}
                onClaim={handleClaim}
                onReply={handleReply}
                onClose={handleClose}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500">
                选择一个会话开始处理
              </div>
            )}
          </div>

          <div className="w-80 border-l border-dark-800 bg-dark-900">
            <AiCopilotPanel conversation={selectedConversation} />
          </div>
        </div>
      </div>
    </div>
  );
}
