'use client';

import { useEffect, useRef } from 'react';

interface Message {
  role: string;
  content: string;
  citations?: any[];
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'visitor' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.role === 'visitor'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-100'
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            {message.citations && message.citations.length > 0 && (
              <div className="mt-2 pt-2 border-t border-dark-700 text-xs text-dark-400">
                引用了 {message.citations.length} 条知识库内容
              </div>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-dark-800 text-dark-100 rounded-lg px-4 py-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-dark-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
