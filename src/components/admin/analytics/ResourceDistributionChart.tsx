// src/components/admin/analytics/ResourceDistributionChart.tsx
'use client';

import React from 'react';
import { ResourceDistribution } from '@/types/analytics';

interface ResourceDistributionChartProps {
  data: ResourceDistribution[];
  loading: boolean;
  title: string;
}

/**
 * Um componente para exibir um gráfico de distribuição de recursos.
 * Este é um placeholder e deve ser integrado com uma biblioteca de gráficos (ex: Recharts).
 */
const ResourceDistributionChart: React.FC<ResourceDistributionChartProps> = ({ data, loading, title }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500">Carregando dados do gráfico...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500">Não há dados de distribuição para exibir.</p>
      </div>
    );
  }

  // Placeholder para a implementação real do gráfico
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300">
          [Implementação do Gráfico de Pizza/Barras Aqui]
        </p>
        {/* 
          Exemplo com Recharts (Gráfico de Pizza):
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="resourceName"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        */}
      </div>
    </div>
  );
};

export default ResourceDistributionChart;