'use client';

import React, { ReactNode } from 'react';
import StandardLayout from '@/components/StandardLayout';
import StatCard from '@/components/ui/StatCard';
import StandardTable from '@/components/ui/StandardTable';

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
  filterOptions?: Array<{
    label: string;
    options: string[];
  }>;
  onSearch?: (value: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  
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
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
        <div className="space-y-3">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 text-center flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
          
          {secondaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`w-full px-4 py-3 rounded-xl transition-all duration-200 text-center font-medium ${
                action.variant === 'danger' 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                  : action.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800 font-medium">
              Sistema Atualizado
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Estatísticas atualizadas em tempo real
            </p>
          </div>
        </div>
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
      <div className="space-y-6">
        {/* Stats Cards */}
        {statsCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color || 'blue'}
                change={stat.change}
              />
            ))}
          </div>
        )}

        {/* Custom Content */}
        {customContent}

        {/* Filters and Actions */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Filter Options */}
                {filterOptions.map((filter, index) => (
                  <select
                    key={index}
                    onChange={(e) => onFilter?.({ [filter.label.toLowerCase()]: e.target.value })}
                    className="border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-200"
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map((option, optIndex) => (
                      <option key={optIndex} value={option}>{option}</option>
                    ))}
                  </select>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-4 py-2.5 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium">
                  Exportar
                </button>
                {primaryAction && (
                  <button
                    onClick={primaryAction.onClick}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm"
                  >
                    {primaryAction.icon}
                    {primaryAction.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {showTable && tableColumns.length > 0 && (
          <StandardTable
            columns={tableColumns}
            data={tableData}
            loading={tableLoading}
            pagination={tablePagination}
            actions={tableActions}
          />
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