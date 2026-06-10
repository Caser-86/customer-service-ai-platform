'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { MessageList } from '@/components/MessageList';
import { Composer } from '@/components/Composer';
import { CitationDrawer } from '@/components/CitationDrawer';
import { HandoffBanner } from '@/components/HandoffBanner';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorToken, setVisitorToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const [handoff, setHandoff] = useState(false);

  useEffect(() => {
    createConversation();
  }, []);

  const createConversation = async () => {
    try {
      const response = await fetch('/api/public/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'default-tenant' }),
      });
      const data = await response.json();
      if (data.ok) {
        setConversationId(data.data.conversationId);
        setVisitorToken(data.data.visitorToken);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || loading) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'visitor', content }]);

    try {
      const response = await fetch(`/api/public/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tenantId: 'default-tenant' }),
      });
      const data = await response.json();

      if (data.ok) {
        const aiResponse = data.data.aiResponse;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse.content,
            citations: aiResponse.citations,
          },
        ]);

        if (aiResponse.citations?.length > 0) {
          setCitations(aiResponse.citations);
        }

        if (aiResponse.handoff) {
          setHandoff(true);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-dark-800 bg-dark-900">
          <h1 className="text-xl font-semibold text-white">在线客服</h1>
          <p className="text-sm text-dark-400">有问题？我们随时为您服务</p>
        </div>

        {handoff && <HandoffBanner />}

        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} loading={loading} />
        </div>

        <Composer onSend={sendMessage} disabled={loading || handoff} />
      </div>

      <CitationDrawer
        open={showCitations}
        onClose={() => setShowCitations(false)}
        citations={citations}
      />
    </div>
  );
}
