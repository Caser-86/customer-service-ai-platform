'use client';

interface Document {
  id: string;
  title: string;
  status: string;
  version: number;
  createdAt: string;
}

interface KnowledgeTableProps {
  documents: Document[];
  loading: boolean;
}

export function KnowledgeTable({ documents, loading }: KnowledgeTableProps) {
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
            <th className="text-left p-4 text-sm font-medium text-dark-400">标题</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">状态</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">版本</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-dark-800 last:border-0">
              <td className="p-4 text-sm text-white">{doc.title}</td>
              <td className="p-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'indexed'
                      ? 'bg-green-500/20 text-green-400'
                      : doc.status === 'indexing'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-dark-700 text-dark-400'
                  }`}
                >
                  {doc.status}
                </span>
              </td>
              <td className="p-4 text-sm text-dark-400">v{doc.version}</td>
              <td className="p-4 text-sm text-dark-400">
                {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
              </td>
            </tr>
          ))}
          {documents.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-dark-500">
                暂无文档
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
