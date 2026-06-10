'use client';

interface MetricStripProps {
  analytics: any;
  loading: boolean;
}

export function MetricStrip({ analytics, loading }: MetricStripProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-dark-900 rounded-lg border border-dark-800 p-4 animate-pulse">
            <div className="h-4 bg-dark-800 rounded w-20 mb-2" />
            <div className="h-8 bg-dark-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    { label: '总会话数', value: analytics?.totalConversations || 0, icon: '💬' },
    { label: '自动解决率', value: `${analytics?.autoResolveRate || 0}%`, icon: '🤖' },
    { label: '转人工率', value: `${analytics?.handoffRate || 0}%`, icon: '👤' },
    { label: '工单数量', value: analytics?.totalTickets || 0, icon: '📋' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-dark-900 rounded-lg border border-dark-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">{metric.label}</span>
            <span className="text-lg">{metric.icon}</span>
          </div>
          <div className="text-2xl font-bold text-white">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
