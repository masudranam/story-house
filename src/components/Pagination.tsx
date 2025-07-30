import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  loading?: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, loading = false, setPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1 || loading}
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm font-medium text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || loading}
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
