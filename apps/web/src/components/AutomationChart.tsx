'use client';

interface AutomationChartProps {
  analytics: any;
  loading: boolean;
}

export function AutomationChart({ analytics, loading }: AutomationChartProps) {
  if (loading) {
    return (
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 animate-pulse">
        <div className="h-4 bg-dark-800 rounded w-32 mb-4" />
        <div className="h-48 bg-dark-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-800 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">自动化趋势</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-dark-800 rounded-lg">
          <h4 className="text-sm text-dark-400 mb-2">AI 处理会话</h4>
          <div className="text-3xl font-bold text-primary-400">
            {analytics?.aiResolved || 0}
          </div>
        </div>

        <div className="p-4 bg-dark-800 rounded-lg">
          <h4 className="text-sm text-dark-400 mb-2">转人工会话</h4>
          <div className="text-3xl font-bold text-yellow-400">
            {analytics?.handoffs || 0}
          </div>
        </div>

        <div className="p-4 bg-dark-800 rounded-lg">
          <h4 className="text-sm text-dark-400 mb-2">平均响应时间</h4>
          <div className="text-3xl font-bold text-green-400">
            {analytics?.avgResponseTime || '-'}
          </div>
        </div>

        <div className="p-4 bg-dark-800 rounded-lg">
          <h4 className="text-sm text-dark-400 mb-2">创建工单</h4>
          <div className="text-3xl font-bold text-blue-400">
            {analytics?.totalTickets || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
