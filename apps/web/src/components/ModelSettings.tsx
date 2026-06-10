'use client';

import { useState, useEffect } from 'react';

interface ModelSettingsProps {
  config: any;
  onSave: (updates: any) => void;
  loading: boolean;
}

export function ModelSettings({ config, onSave, loading }: ModelSettingsProps) {
  const [provider, setProvider] = useState('mock');
  const [model, setModel] = useState('gpt-4');

  useEffect(() => {
    if (config) {
      setProvider(config.provider || 'mock');
      setModel(config.model || 'gpt-4');
    }
  }, [config]);

  const handleSave = () => {
    onSave({ provider, model });
  };

  if (loading) {
    return (
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 text-center text-dark-500">
        加载中...
      </div>
    );
  }

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-800 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">模型设置</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-dark-400 mb-2">AI 提供商</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
          >
            <option value="mock">Mock (测试)</option>
            <option value="openai-compatible">OpenAI Compatible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-dark-400 mb-2">模型名称</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm"
            placeholder="gpt-4"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
        >
          保存设置
        </button>
      </div>
    </div>
  );
}
