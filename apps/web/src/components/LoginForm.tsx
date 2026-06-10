'use client';

import { useState } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  error?: string;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(email, password);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-900 rounded-lg p-8 shadow-xl border border-dark-800">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="admin@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? '登录中...' : '登录'}
      </button>

      <div className="mt-6 text-center text-sm text-dark-500">
        <p>测试账号：admin@example.com / agent@example.com</p>
        <p>密码：password123</p>
      </div>
    </form>
  );
}
