'use client';

import Link from 'next/link';

interface SidebarProps {
  activePage: string;
}

const menuItems = [
  { id: 'agent', label: '坐席工作台', href: '/agent', icon: '🎧' },
  { id: 'knowledge', label: '知识库', href: '/admin/knowledge', icon: '📚' },
  { id: 'bot', label: '机器人配置', href: '/admin/bot', icon: '🤖' },
  { id: 'team', label: '团队管理', href: '/admin/team', icon: '👥' },
  { id: 'analytics', label: '报表分析', href: '/admin/analytics', icon: '📊' },
  { id: 'audit', label: '审计日志', href: '/admin/audit', icon: '📋' },
];

export function Sidebar({ activePage }: SidebarProps) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
      <div className="p-4 border-b border-dark-800">
        <h1 className="text-lg font-bold text-white">智能客服</h1>
        <p className="text-xs text-dark-500">管理后台</p>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
              activePage === item.id
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-dark-400 hover:bg-dark-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-dark-400 hover:bg-dark-800 hover:text-white rounded-lg text-sm"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
