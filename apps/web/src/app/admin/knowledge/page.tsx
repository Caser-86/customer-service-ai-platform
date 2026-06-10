'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DocumentUploader } from '@/components/DocumentUploader';
import { KnowledgeTable } from '@/components/KnowledgeTable';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function KnowledgePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const result = await apiClient.getDocuments();
      if (result.ok) {
        setDocuments(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (title: string, content: string) => {
    try {
      await apiClient.uploadDocument(title, content, 'markdown');
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const handleReindex = async () => {
    try {
      await apiClient.reindexKnowledge();
      fetchDocuments();
    } catch (error) {
      console.error('Failed to reindex:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar activePage="knowledge" />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">知识库管理</h1>
            <p className="text-dark-400">管理 AI 回复所使用的知识文档</p>
          </div>
          <button
            onClick={handleReindex}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg"
          >
            重建索引
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DocumentUploader onUpload={handleUpload} />
          </div>
          <div className="lg:col-span-2">
            <KnowledgeTable documents={documents} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
