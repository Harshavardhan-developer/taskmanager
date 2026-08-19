'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store';

export default function HomePage() {
  const router = useRouter();
  const { user, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(user ? '/dashboard' : '/login');
  }, [hydrated, user, router]);

  return <div className="flex h-screen items-center justify-center text-gray-400">Loading...</div>;
}
