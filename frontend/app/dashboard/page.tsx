'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { Navbar } from '../../components/Navbar';
import { FilterBar } from '../../components/FilterBar';
import { TaskCard } from '../../components/TaskCard';
import { Pagination } from '../../components/Pagination';
import { TaskFormModal } from '../../components/TaskFormModal';
import { useDeleteTask, useTasks } from '../../hooks/useTasks';
import { Task, TaskFilters } from '../../lib/types';

export default function DashboardPage() {
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 9 });
  const [modalTask, setModalTask] = useState<Task | null | undefined>(undefined); // undefined = closed
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const { data, isLoading, isError, error } = useTasks(filters);
  const deleteTask = useDeleteTask();

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    await deleteTask.mutateAsync(taskToDelete._id);
    setTaskToDelete(null);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Your Tasks</h1>
          <button
            onClick={() => setModalTask(null)}
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        <FilterBar filters={filters} onChange={setFilters} />

        {isLoading && (
          <div className="py-16 text-center text-gray-400">Loading tasks...</div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Failed to load tasks: {(error as any)?.response?.data?.message || 'Please try again.'}
          </div>
        )}

        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
            No tasks match your filters yet. Create one to get started.
          </div>
        )}

        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => setModalTask(t)}
                  onDelete={(t) => setTaskToDelete(t)}
                />
              ))}
            </div>
            <Pagination
              page={data.meta.page}
              lastPage={data.meta.lastPage}
              total={data.meta.total}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </>
        )}
      </main>

      {modalTask !== undefined && (
        <TaskFormModal task={modalTask} onClose={() => setModalTask(undefined)} />
      )}

      {taskToDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Delete task?</h2>
            <p className="mb-5 text-sm text-gray-500">
              This will permanently delete &quot;{taskToDelete.title}&quot;. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteTask.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteTask.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
