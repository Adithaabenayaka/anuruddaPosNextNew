import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (item: T) => string | number;
  pageSize?: number;
}

export default function GenericTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data available',
  rowKey,
  pageSize,
}: GenericTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    if (!pageSize) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / (pageSize || data.length));

  // Reset to first page if data changes or filters applied
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 font-bold text-[10px] text-gray-600 uppercase tracking-widest ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading && paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="max-w-xs mx-auto">
                    <p className="text-gray-400 font-medium text-lg">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={rowKey(item)} className="hover:bg-gray-50/80 transition-all group">
                  {columns.map((column, index) => (
                    <td key={index} className={`px-4 py-2 text-xs ${column.className || ''}`}>
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageSize && data.length > pageSize && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * pageSize, data.length)}</span> of <span className="text-gray-900">{data.length}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                // Simple logic to show pages around current page if total pages > 5
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-black transition-all ${currentPage === pageNum
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="text-gray-300 px-1">...</span>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
