'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AuditLogTable } from '@/components/AuditLogTable';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function AuditPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    try {
      const result = await apiClient.getAuditLogs(pagination.page, 20);
      if (result.ok && result.data) {
        setLogs(result.data.logs || []);
        setPagination(result.data.pagination || { page: 1, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar activePage="audit" />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">审计日志</h1>
          <p className="text-dark-400">查看系统操作记录</p>
        </div>

        <AuditLogTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </div>
    </div>
  );
}
