'use client';

import { ReactNode, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

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
  const { theme } = useTheme();
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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.text.tertiary }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <motion.svg 
          initial={{ rotate: 0 }}
          animate={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ color: theme.colors.primary.DEFAULT }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </motion.svg>
      );
    }

    return (
      <motion.svg 
        initial={{ rotate: 180 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.3 }}
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        style={{ color: theme.colors.primary.DEFAULT }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
      </motion.svg>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { current, pageSize, total, onChange } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div 
        className="px-6 py-4 flex items-center justify-between border-t"
        style={{ 
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light
        }}
      >
        <div className="flex-1 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
              Mostrando <span className="font-bold" style={{ color: theme.colors.text.primary }}>{startItem}</span> a{' '}
              <span className="font-bold" style={{ color: theme.colors.text.primary }}>{endItem}</span> de{' '}
              <span className="font-bold" style={{ color: theme.colors.text.primary }}>{total}</span> resultados
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(current - 1, pageSize)}
              disabled={current <= 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                backgroundColor: theme.colors.background.card,
                color: theme.colors.text.primary,
                borderColor: theme.colors.border.DEFAULT
              }}
              onMouseEnter={(e) => {
                if (current > 1) {
                  e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                  e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.card;
                e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
              }}
            >
              Anterior
            </motion.button>
            
            {/* Páginas numeradas */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= current - 1 && page <= current + 1)
              ) {
                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChange(page, pageSize)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 shadow-sm"
                    style={{
                      backgroundColor: page === current ? theme.colors.primary.DEFAULT : theme.colors.background.card,
                      color: page === current ? theme.colors.primary.contrast : theme.colors.text.primary,
                      borderColor: page === current ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT,
                      boxShadow: page === current ? theme.shadows.md : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (page !== current) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                        e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== current) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.card;
                        e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
                      }
                    }}
                  >
                    {page}
                  </motion.button>
                );
              } else if (page === current - 2 || page === current + 2) {
                return <span key={page} className="px-2 font-medium" style={{ color: theme.colors.text.tertiary }}>...</span>;
              }
              return null;
            })}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(current + 1, pageSize)}
              disabled={current >= totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                backgroundColor: theme.colors.background.card,
                color: theme.colors.text.primary,
                borderColor: theme.colors.border.DEFAULT
              }}
              onMouseEnter={(e) => {
                if (current < totalPages) {
                  e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                  e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.card;
                e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
              }}
            >
              Próximo
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="shadow-lg rounded-2xl border"
        style={{ 
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.DEFAULT
        }}
      >
        <div className="p-8 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-10 w-10 border-4"
            style={{ 
              borderColor: theme.colors.primary.DEFAULT,
              borderTopColor: 'transparent'
            }}
          />
          <span className="ml-3 font-medium" style={{ color: theme.colors.text.secondary }}>Carregando dados...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="shadow-lg rounded-2xl overflow-hidden border"
      style={{ 
        backgroundColor: theme.colors.background.card,
        borderColor: theme.colors.border.DEFAULT,
        boxShadow: theme.shadows.lg
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: theme.colors.border.light }}>
          <thead style={{ backgroundColor: theme.colors.background.secondary }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer transition-colors duration-200' : ''
                  }`}
                  style={{ 
                    color: theme.colors.text.secondary,
                    width: column.width || 'auto'
                  }}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  onMouseEnter={(e) => {
                    if (column.sortable) {
                      e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th 
                  scope="col" 
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {actions.title}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: theme.colors.border.light }}>
            {sortedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`${
                  onRowClick ? 'cursor-pointer' : ''
                } transition-colors duration-200`}
                style={{ backgroundColor: theme.colors.background.card }}
                onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}05`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.card;
                }}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {actions.render(row, index)}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center"
        >
          <svg 
            className="mx-auto h-16 w-16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: theme.colors.text.tertiary }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold" style={{ color: theme.colors.text.primary }}>Nenhum dado encontrado</h3>
          <p className="mt-2 text-sm" style={{ color: theme.colors.text.secondary }}>Tente ajustar os filtros ou adicionar novos registros.</p>
        </motion.div>
      )}

      {renderPagination()}
    </motion.div>
  );
};

export default StandardTable; 