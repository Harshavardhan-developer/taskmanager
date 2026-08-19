'use client';

import Link from 'next/link';
import { Calendar, Paperclip, Pencil, Trash2 } from 'lucide-react';
import { Task } from '../lib/types';
import { WeatherBadge } from './WeatherBadge';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link href={`/tasks/${task._id}`} className="font-semibold text-gray-800 hover:text-brand-600">
          {task.title}
        </Link>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{task.description}</p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <WeatherBadge weather={task.weather} />
        {task.fileUrl && (
          <a
            href={task.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:underline"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attachment
          </a>
        )}
      </div>
    </div>
  );
}
