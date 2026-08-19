'use client';

import { useRouter } from 'next/navigation';
import { ListChecks, LogOut } from 'lucide-react';
import { useAuthStore } from '../lib/store';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-2 font-semibold text-brand-700">
        <ListChecks className="h-5 w-5" />
        <span>Task Manager</span>
      </div>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            Signed in as <span className="font-medium text-gray-800">{user.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
