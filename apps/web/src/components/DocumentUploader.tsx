'use client';

import { useState } from 'react';

interface DocumentUploaderProps {
  onUpload: (title: string, content: string) => void;
}

export function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    await onUpload(title, content);
    setTitle('');
    setContent('');
    setLoading(false);
  };

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-800 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">上传文档</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-dark-400 mb-2">文档标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
            placeholder="FAQ 文档"
          />
        </div>

        <div>
          <label className="block text-sm text-dark-400 mb-2">文档内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm h-48"
            placeholder="支持 Markdown 或纯文本格式..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title || !content}
          className="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white rounded-lg text-sm"
        >
          {loading ? '上传中...' : '上传并索引'}
        </button>
      </form>
    </div>
  );
}
