// src/components/admin/analytics/ResourceDistributionChart.tsx
'use client';

import React from 'react';
import { ResourceDistribution } from '@/types/analytics';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { useTheme } from '@/contexts/ThemeContext';

// Registrando os componentes necessários do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

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
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500">Carregando dados do gráfico...</p>
      </div>
    );
  }

  // Verifica se data é um array válido
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500">Não há dados de distribuição para exibir.</p>
      </div>
    );
  }

  // Cores para o gráfico baseadas no tema
  const backgroundColors = [
    theme.colors.primary.DEFAULT,
    theme.colors.secondary.DEFAULT,
    theme.colors.accent.DEFAULT,
    theme.colors.status.success,
    theme.colors.status.info,
    theme.colors.status.warning,
    theme.colors.primary.light,
    theme.colors.secondary.light,
    theme.colors.accent.light,
    theme.colors.primary.dark,
  ].map(color => `${color}CC`); // Adiciona transparência

  const borderColors = [
    theme.colors.primary.DEFAULT,
    theme.colors.secondary.DEFAULT,
    theme.colors.accent.DEFAULT,
    theme.colors.status.success,
    theme.colors.status.info,
    theme.colors.status.warning,
    theme.colors.primary.light,
    theme.colors.secondary.light,
    theme.colors.accent.light,
    theme.colors.primary.dark,
  ];

  // Formatação dos dados para o gráfico
  const chartData = {
    labels: data.map(item => item.resourceName),
    datasets: [
      {
        data: data.map(item => item.percentage * 100), // Convertendo para percentual
        backgroundColor: backgroundColors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            size: 11,
          },
          color: theme.colors.text.primary,
        }
      },
      tooltip: {
        backgroundColor: theme.colors.background.card,
        titleColor: theme.colors.text.primary,
        bodyColor: theme.colors.text.secondary,
        borderColor: theme.colors.border.DEFAULT,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = value.toFixed(1);
            return `${label}: ${percentage}%`;
          }
        }
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ResourceDistributionChart;