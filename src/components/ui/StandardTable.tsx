'use client';

import { ReactNode, useState } from 'react';

interface Column {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, record: any, index: number) => ReactNode;
}

interface StandardTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (record: any, index: number) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  actions?: {
    title: string;
    render: (record: any, index: number) => ReactNode;
  };
}

const StandardTable = ({
  columns,
  data,
  loading = false,
  onRowClick,
  pagination,
  actions
}: StandardTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </svg>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600 font-medium">
              Mostrando <span className="font-bold text-slate-800">{startItem}</span> a{' '}
              <span className="font-bold text-slate-800">{endItem}</span> de{' '}
              <span className="font-bold text-slate-800">{total}</span> resultados
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onChange(current - 1, pageSize)}
              disabled={current <= 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Anterior
            </button>
            
            {/* Páginas numeradas */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= current - 1 && page <= current + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onChange(page, pageSize)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      page === current
                        ? 'bg-blue-600 text-white border border-blue-600 shadow-md'
                        : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === current - 2 || page === current + 2) {
                return <span key={page} className="px-2 text-slate-400 font-medium">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => onChange(current + 1, pageSize)}
              disabled={current >= totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-slate-600 font-medium">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors duration-200' : ''
                  }`}
                  style={column.width ? { width: column.width } : {}}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {actions.title}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''
                } transition-colors duration-200 hover:bg-slate-50`}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                    {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {actions.render(row, index)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-slate-600">Nenhum dado encontrado</h3>
          <p className="mt-2 text-sm text-slate-500">Tente ajustar os filtros ou adicionar novos registros.</p>
        </div>
      )}

      {renderPagination()}
    </div>
  );
};

export default StandardTable; 