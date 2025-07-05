'use client';

import React, { ReactNode } from 'react';
import StandardLayout from '@/components/StandardLayout';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveButton,
  ResponsiveInput,
  ResponsiveTable,
  ResponsiveSpinner,
  ResponsiveDivider,
  ResponsiveAlert
} from '@/components/ui/ResponsiveComponents';
import StatCard from '@/components/ui/StatCard';
import StandardTable from '@/components/ui/StandardTable';

interface FilterOption {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

interface TemplateProps {
  // Layout props
  title: string;
  subtitle?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  
  // Stats cards
  statsCards?: Array<{
    title: string;
    value: string | number;
    icon?: ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
    change?: {
      value: string | number;
      trend: 'up' | 'down' | 'neutral';
      period?: string;
    };
  }>;
  
  // Table props
  tableColumns?: any[];
  tableData?: any[];
  tableLoading?: boolean;
  tablePagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  tableActions?: {
    title: string;
    render: (record: any, index: number) => ReactNode;
  };
  
  // Filters
  showFilters?: boolean;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  onSearch?: (value: string) => void;
  onFilter?: (key: string, value: string) => void;
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  
  // Right sidebar
  rightSidebarContent?: ReactNode;
  
  // Custom content
  customContent?: ReactNode;
  showTable?: boolean;
}

const StandardPageTemplate: React.FC<TemplateProps> = ({
  title,
  subtitle,
  breadcrumbItems = [],
  statsCards = [],
  tableColumns = [],
  tableData = [],
  tableLoading = false,
  tablePagination,
  tableActions,
  showFilters = true,
  searchPlaceholder = "Buscar...",
  filterOptions = [],
  onSearch,
  onFilter,
  primaryAction,
  secondaryActions = [],
  rightSidebarContent,
  customContent,
  showTable = true
}) => {
  const defaultRightContent = (
    <div className="space-y-6">
      <div>
        <ResponsiveText variant="lg" className="font-semibold text-text-primary mb-4">
          Ações Rápidas
        </ResponsiveText>
        <div className="space-y-3">
          {primaryAction && (
            <ResponsiveButton
              variant="primary"
              onClick={primaryAction.onClick}
              className="w-full"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </ResponsiveButton>
          )}
          
          {secondaryActions.map((action, index) => (
            <ResponsiveButton
              key={index}
              variant={action.variant === 'danger' ? 'primary' : action.variant === 'primary' ? 'primary' : 'secondary'}
              onClick={action.onClick}
              className="w-full"
            >
              {action.label}
            </ResponsiveButton>
          ))}
        </div>
      </div>
      
      <div>
        <ResponsiveText variant="lg" className="font-semibold text-text-primary mb-4">
          Informações
        </ResponsiveText>
        <ResponsiveAlert variant="info">
          <ResponsiveText variant="sm" className="font-medium">
            Sistema Atualizado
          </ResponsiveText>
          <ResponsiveText variant="xs" className="mt-1">
            Estatísticas atualizadas em tempo real
          </ResponsiveText>
        </ResponsiveAlert>
      </div>
    </div>
  );

  return (
    <StandardLayout
      title={title}
      subtitle={subtitle}
      showBreadcrumb={breadcrumbItems.length > 0}
      breadcrumbItems={breadcrumbItems}
      rightContent={rightSidebarContent || defaultRightContent}
    >
      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Stats Cards */}
        {statsCards.length > 0 && (
          <ResponsiveGrid cols={{ default: 2, sm: 2, lg: 4 }} gap="gap-2 sm:gap-3 lg:gap-4">
            {statsCards.map((stat, index) => (
              <ResponsiveCard key={index}>
                <div className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {stat.icon && (
                      <div className={`p-1.5 sm:p-2 rounded-lg bg-${stat.color || 'primary'}/10`}>
                        {stat.icon}
                      </div>
                    )}
                    <div>
                      <ResponsiveText variant="xl" className="font-bold text-text-primary">
                        {stat.value}
                      </ResponsiveText>
                      <ResponsiveText variant="xs" className="text-text-secondary">
                        {stat.title}
                      </ResponsiveText>
                    </div>
                  </div>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        )}

        {/* Custom Content */}
        {customContent}

        {/* Filters and Actions */}
        {showFilters && (
          <ResponsiveCard>
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1">
                  <ResponsiveInput
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                  />
                </div>

                {/* Filters */}
                {filterOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter, index) => (
                      <select
                        key={index}
                        onChange={(e) => onFilter?.(filter.key, e.target.value)}
                        className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 text-sm sm:text-base bg-white"
                      >
                        <option value="">{filter.label}</option>
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResponsiveCard>
        )}

        {/* Table */}
        {showTable && (
          <ResponsiveCard>
            {tableLoading ? (
              <div className="flex items-center justify-center p-8">
                <ResponsiveSpinner />
              </div>
            ) : (
              <ResponsiveTable
                headers={tableColumns.map(col => col.title)}
                rows={tableData.map(row => 
                  tableColumns.map(col => 
                    col.render ? col.render(row, 0) : row[col.key]
                  )
                )}
              />
            )}

            {/* Pagination */}
            {tablePagination && (
              <div className="px-3 sm:px-4 lg:px-6 py-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <ResponsiveText variant="sm" className="text-text-secondary">
                    Mostrando {((tablePagination.current - 1) * tablePagination.pageSize) + 1} até{' '}
                    {Math.min(tablePagination.current * tablePagination.pageSize, tablePagination.total)} de{' '}
                    {tablePagination.total} resultados
                  </ResponsiveText>
                  <div className="flex gap-2">
                    <ResponsiveButton
                      variant="secondary"
                      size="sm"
                      onClick={() => tablePagination.onChange(tablePagination.current - 1, tablePagination.pageSize)}
                      disabled={tablePagination.current === 1}
                    >
                      Anterior
                    </ResponsiveButton>
                    <ResponsiveButton
                      variant="secondary"
                      size="sm"
                      onClick={() => tablePagination.onChange(tablePagination.current + 1, tablePagination.pageSize)}
                      disabled={tablePagination.current * tablePagination.pageSize >= tablePagination.total}
                    >
                      Próxima
                    </ResponsiveButton>
                  </div>
                </div>
              </div>
            )}
          </ResponsiveCard>
        )}
      </div>
    </StandardLayout>
  );
};

export default StandardPageTemplate;

// Hook auxiliar para usar com o template
export const useStandardPage = () => {
  const createStatsCard = (
    title: string,
    value: string | number,
    icon: ReactNode,
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' = 'blue',
    change?: { value: string | number; trend: 'up' | 'down' | 'neutral'; period?: string }
  ) => ({
    title,
    value,
    icon,
    color,
    change
  });

  const createTableColumn = (
    key: string,
    title: string,
    sortable: boolean = false,
    render?: (value: any, record: any, index: number) => ReactNode,
    width?: string
  ) => ({
    key,
    title,
    sortable,
    render,
    width
  });

  const createStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Ativo': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'Inativo': 'bg-red-100 text-red-800 border border-red-200',
      'Pendente': 'bg-amber-100 text-amber-800 border border-amber-200',
      'Concluído': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Em Progresso': 'bg-violet-100 text-violet-800 border border-violet-200',
      'Aprovado': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'Rejeitado': 'bg-red-100 text-red-800 border border-red-200',
      'Revisão': 'bg-amber-100 text-amber-800 border border-amber-200'
    };

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
        {status}
      </span>
    );
  };

  const createProgressBar = (progress: string) => (
    <div className="flex items-center space-x-3">
      <div className="flex-1 bg-slate-200 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: progress }}
        ></div>
      </div>
      <span className="text-sm text-slate-600 font-medium min-w-[3rem]">{progress}</span>
    </div>
  );

  const createActionButton = (
    label: string,
    onClick: () => void,
    variant: 'primary' | 'secondary' | 'danger' = 'primary',
    icon?: ReactNode
  ) => {
    const variants = {
      primary: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
      secondary: 'text-slate-600 hover:text-slate-800 hover:bg-slate-50',
      danger: 'text-red-600 hover:text-red-800 hover:bg-red-50'
    };

    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${variants[variant]}`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return {
    createStatsCard,
    createTableColumn,
    createStatusBadge,
    createProgressBar,
    createActionButton
  };
}; 