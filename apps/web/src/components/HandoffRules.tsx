'use client';

import { useState, useEffect } from 'react';

interface HandoffRulesProps {
  config: any;
  onSave: (updates: any) => void;
  loading: boolean;
}

export function HandoffRules({ config, onSave, loading }: HandoffRulesProps) {
  const [threshold, setThreshold] = useState(0.3);

  useEffect(() => {
    if (config) {
      setThreshold(config.handoffThreshold || 0.3);
    }
  }, [config]);

  const handleSave = () => {
    onSave({ handoffThreshold: threshold });
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
      <h3 className="text-lg font-semibold text-white mb-4">转人工规则</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-dark-400 mb-2">
            置信度阈值: {threshold}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-dark-500 mt-1">
            <span>低 (更易转人工)</span>
            <span>高 (AI 更自信)</span>
          </div>
        </div>

        <div className="p-3 bg-dark-800 rounded-lg">
          <h4 className="text-sm font-medium text-dark-300 mb-2">转人工触发词</h4>
          <div className="flex flex-wrap gap-2">
            {['人工', '转人工', '客服', '投诉'].map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300"
              >
                {keyword}
              </span>
            ))}
          </div>
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
