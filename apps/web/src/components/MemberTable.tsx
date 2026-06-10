'use client';

interface Member {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
  createdAt: string;
}

interface MemberTableProps {
  members: Member[];
  loading: boolean;
}

export function MemberTable({ members, loading }: MemberTableProps) {
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
            <th className="text-left p-4 text-sm font-medium text-dark-400">姓名</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">邮箱</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">角色</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">状态</th>
            <th className="text-left p-4 text-sm font-medium text-dark-400">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-dark-800 last:border-0">
              <td className="p-4 text-sm text-white">{member.name}</td>
              <td className="p-4 text-sm text-dark-400">{member.email}</td>
              <td className="p-4">
                <div className="flex gap-1">
                  {member.roles.map((role: string) => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    member.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-dark-700 text-dark-400'
                  }`}
                >
                  {member.status}
                </span>
              </td>
              <td className="p-4 text-sm text-dark-400">
                {new Date(member.createdAt).toLocaleDateString('zh-CN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
