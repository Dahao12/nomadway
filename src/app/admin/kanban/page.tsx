'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to new Kanban v2 with drag & drop
export default function KanbanPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/kanban-v2');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecionando para o novo Kanban...</p>
      </div>
    </div>
  );
}