'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MetricStrip } from '@/components/MetricStrip';
import { AutomationChart } from '@/components/AutomationChart';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const result = await apiClient.getAnalytics();
      if (result.ok) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar activePage="analytics" />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">报表分析</h1>
          <p className="text-dark-400">查看运营数据和服务质量</p>
        </div>

        <MetricStrip analytics={analytics} loading={loading} />

        <div className="mt-6">
          <AutomationChart analytics={analytics} loading={loading} />
        </div>
      </div>
    </div>
  );
}
