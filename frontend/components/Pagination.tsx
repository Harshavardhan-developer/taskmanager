import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, lastPage, total, onPageChange }: Props) {
  if (total === 0) return null;

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
      <span>
        Page {page} of {lastPage} · {total} task{total === 1 ? '' : 's'}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
