'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ModelSettings } from '@/components/ModelSettings';
import { HandoffRules } from '@/components/HandoffRules';

export default function BotSettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/bot/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.ok) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updates: any) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/bot/config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      fetchConfig();
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar activePage="bot" />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">机器人配置</h1>
          <p className="text-dark-400">配置 AI 模型和转人工规则</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModelSettings config={config} onSave={handleSave} loading={loading} />
          <HandoffRules config={config} onSave={handleSave} loading={loading} />
        </div>
      </div>
    </div>
  );
}
