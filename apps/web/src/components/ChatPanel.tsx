'use client';

interface ChatPanelProps {
  children: React.ReactNode;
}

export function ChatPanel({ children }: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-lg border border-dark-800 overflow-hidden">
      {children}
    </div>
  );
}
