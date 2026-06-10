'use client';

interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  actor: { name: string; email: string };
  metadata?: any;
  createdAt: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  pagination: { page: number; total: number; pages: number };
  onPageChange: (page: number) => void;
}

export function AuditLogTable({ logs, loading, pagination, onPageChange }: AuditLogTableProps) {
  if (loading) {
    return (
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 text-center text-dark-500">
        加载中...
      </div>
    );
  }

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-800">
            <th className="text-left p-4 text-sm font-medium text-dark-400">操作</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">资源</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">执行者</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">时间</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-dark-800 last:border-0">
              <td className="p-4">
                <span className="px-2 py-1 bg-dark-800 rounded text-xs text-dark-300">
                  {log.action}
                </span>
              </td>
              <td className="p-4 text-sm text-dark-400">
                {log.resourceType}
                {log.resourceId && (
                  <span className="ml-2 text-dark-500">
                    ({log.resourceId.substring(0, 8)}...)
                  </span>
                )}
              </td>
              <td className="p-4 text-sm text-white">
                {log.actor?.name || log.actor?.email || '系统'}
              </td>
              <td className="p-4 text-sm text-dark-400">
                {new Date(log.createdAt).toLocaleString('zh-CN')}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-dark-500">
                暂无日志
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination.pages > 1 && (
        <div className="p-4 border-t border-dark-800 flex items-center justify-between">
          <span className="text-sm text-dark-500">
            共 {pagination.total} 条记录
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-dark-800 hover:bg-dark-700 disabled:bg-dark-800 disabled:text-dark-600 rounded text-sm text-white"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm text-dark-400">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-dark-800 hover:bg-dark-700 disabled:bg-dark-800 disabled:text-dark-600 rounded text-sm text-white"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
