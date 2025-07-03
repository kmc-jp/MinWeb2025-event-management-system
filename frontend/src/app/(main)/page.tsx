'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/events');
  }, [router]);

  return (
    <div className="min-h-screen bg-kmc-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kmc-500 mx-auto"></div>
        <p className="mt-4 text-kmc-gray-600">リダイレクト中...</p>
      </div>
    </div>
  );
} 