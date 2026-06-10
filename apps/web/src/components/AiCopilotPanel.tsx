'use client';

interface AiCopilotPanelProps {
  conversation: any;
}

export function AiCopilotPanel({ conversation }: AiCopilotPanelProps) {
  if (!conversation) {
    return (
      <div className="p-4 text-center text-dark-500">
        选择会话查看 AI 建议
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">AI 助手</h3>

      <div className="space-y-4">
        <div className="p-3 bg-dark-800 rounded-lg">
          <h4 className="text-sm font-medium text-dark-300 mb-2">会话摘要</h4>
          <p className="text-sm text-dark-400">
            访客正在咨询相关问题，AI 已尝试回答但需要人工介入。
          </p>
        </div>

        <div className="p-3 bg-dark-800 rounded-lg">
          <h4 className="text-sm font-medium text-dark-300 mb-2">建议回复</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-2 bg-dark-700 hover:bg-dark-600 rounded text-sm text-dark-300">
              您好，我是人工客服，请问有什么可以帮您？
            </button>
            <button className="w-full text-left p-2 bg-dark-700 hover:bg-dark-600 rounded text-sm text-dark-300">
              感谢您的耐心等待，我来为您处理这个问题。
            </button>
          </div>
        </div>

        <div className="p-3 bg-dark-800 rounded-lg">
          <h4 className="text-sm font-medium text-dark-300 mb-2">访客信息</h4>
          <div className="text-sm text-dark-400 space-y-1">
            <p>名称: {conversation.visitor?.name || '-'}</p>
            <p>邮箱: {conversation.visitor?.email || '-'}</p>
            <p>渠道: Web Chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
