'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Paperclip, Pencil } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { Navbar } from '../../../components/Navbar';
import { WeatherBadge } from '../../../components/WeatherBadge';
import { TaskFormModal } from '../../../components/TaskFormModal';
import { useTask } from '../../../hooks/useTasks';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: task, isLoading, isError } = useTask(params.id);
  const [editing, setEditing] = useState(false);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        {isLoading && <div className="py-16 text-center text-gray-400">Loading task...</div>}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Could not load this task. It may have been deleted, or you may not have access.
          </div>
        )}

        {task && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <h1 className="text-xl font-semibold text-gray-800">{task.title}</h1>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>

            {task.description && <p className="mb-4 text-gray-600">{task.description}</p>}

            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                Priority: {task.priority}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5" />
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.location && (
                <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5" />
                  {task.location}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <WeatherBadge weather={task.weather} />
              {task.fileUrl && (
                <a
                  href={task.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:underline"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  View attachment
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {editing && task && <TaskFormModal task={task} onClose={() => setEditing(false)} />}
    </ProtectedRoute>
  );
}
