'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageList } from '@/components/MessageList';
import { Composer } from '@/components/Composer';
import { CitationDrawer } from '@/components/CitationDrawer';
import { HandoffBanner } from '@/components/HandoffBanner';
import { apiClient } from '@/lib/api-client';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorToken, setVisitorToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [citations, setCitations] = useState<any[]>([]);
  const [handoff, setHandoff] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    createConversation();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const createConversation = async () => {
    try {
      const result = await apiClient.createConversation('default', {
        name: 'Visitor',
        email: 'visitor@example.com',
      });
      if (result.ok && result.data) {
        setConversationId(result.data.conversationId);
        setVisitorToken(result.data.visitorToken);
        connectSSE(result.data.conversationId, result.data.visitorToken);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const connectSSE = (convId: string, token: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const url = `${API_BASE}/public/conversations/${convId}/events`;
    
    const eventSource = new EventSource(url, {
      headers: { 'x-visitor-token': token },
    } as any);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message.token':
            // Update last AI message with new token
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.role === 'assistant' && lastMsg.streaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, content: lastMsg.content + data.data.token }
                ];
              }
              return [...prev, { role: 'assistant', content: data.data.token, streaming: true }];
            });
            break;

          case 'message.citation':
            setCitations(data.data.citations);
            break;

          case 'message.done':
            setMessages(prev => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.streaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, streaming: false }
                ];
              }
              return prev;
            });
            setLoading(false);
            break;

          case 'conversation.handoff':
            setHandoff(true);
            setLoading(false);
            break;

          case 'agent.reply':
            setMessages(prev => [...prev, { role: 'agent', content: data.data.content }]);
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    eventSourceRef.current = eventSource;
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !visitorToken || loading) return;

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'visitor', content }]);

    try {
      await apiClient.sendMessage(visitorToken, conversationId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
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
        open={showCitations || citations.length > 0}
        onClose={() => { setShowCitations(false); setCitations([]); }}
        citations={citations}
      />
    </div>
  );
}
