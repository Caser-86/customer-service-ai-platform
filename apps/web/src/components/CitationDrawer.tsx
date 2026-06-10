'use client';

interface CitationDrawerProps {
  open: boolean;
  onClose: () => void;
  citations: any[];
}

export function CitationDrawer({ open, onClose, citations }: CitationDrawerProps) {
  if (!open) return null;

  return (
    <div className="w-80 border-l border-dark-800 bg-dark-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">引用来源</h2>
        <button
          onClick={onClose}
          className="text-dark-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div
            key={index}
            className="p-3 bg-dark-800 rounded-lg border border-dark-700"
          >
            <div className="text-sm text-dark-300 mb-2">
              {citation.content?.substring(0, 100)}...
            </div>
            <div className="flex items-center justify-between text-xs text-dark-500">
              <span>文档 ID: {citation.documentId?.substring(0, 8)}</span>
              <span>相关度: {((citation.score || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
