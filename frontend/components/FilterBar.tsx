'use client';

import { Search } from 'lucide-react';
import { TaskFilters } from '../lib/types';

interface Props {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const update = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={filters.search || ''}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search title or description..."
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <select
        value={filters.status || ''}
        onChange={(e) => update({ status: e.target.value as TaskFilters['status'] })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) => update({ priority: e.target.value as TaskFilters['priority'] })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <input
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => update({ startDate: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        aria-label="Due after"
      />
      <span className="text-sm text-gray-400">to</span>
      <input
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => update({ endDate: e.target.value })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        aria-label="Due before"
      />

      {(filters.status || filters.priority || filters.search || filters.startDate || filters.endDate) && (
        <button
          onClick={() => onChange({ page: 1, limit: filters.limit })}
          className="text-sm text-brand-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
