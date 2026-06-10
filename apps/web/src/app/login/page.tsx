'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { apiClient } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await apiClient.login(email, password);

      if (result.ok && result.data) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('tenant', JSON.stringify(result.data.tenant));
        router.push('/agent');
      } else {
        setError(result.error?.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">智能客服系统</h1>
          <p className="text-dark-400">AI-Powered Customer Service Platform</p>
        </div>
        <LoginForm onSubmit={handleLogin} error={error} />
      </div>
    </div>
  );
}
