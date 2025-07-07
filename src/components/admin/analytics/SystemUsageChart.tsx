// src/components/admin/analytics/SystemUsageChart.tsx
'use client';

import React from 'react';
import { SystemUsageData } from '@/types/analytics';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { useTheme } from '@/contexts/ThemeContext';

// Registrando os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SystemUsageChartProps {
  data: SystemUsageData;
  loading: boolean;
}

/**
 * Um componente para exibir um gráfico de uso do sistema.
 * Este é um placeholder e deve ser integrado com uma biblioteca de gráficos (ex: Recharts, Chart.js).
 */
const SystemUsageChart: React.FC<SystemUsageChartProps> = ({ data, loading }) => {
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
        <p className="text-gray-500">Não há dados de uso do sistema para exibir.</p>
      </div>
    );
  }

  // Formatação dos dados para o gráfico
  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'CPU (%)',
        data: data.map(point => point.cpuUsagePercent),
        borderColor: theme.colors.primary.DEFAULT,
        backgroundColor: `${theme.colors.primary.DEFAULT}20`,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Memória (MB)',
        data: data.map(point => point.memoryUsageMb),
        borderColor: theme.colors.secondary.DEFAULT,
        backgroundColor: `${theme.colors.secondary.DEFAULT}20`,
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Usuários Ativos',
        data: data.map(point => point.activeUsers),
        borderColor: theme.colors.accent.DEFAULT,
        backgroundColor: `${theme.colors.accent.DEFAULT}20`,
        tension: 0.4,
        yAxisID: 'y2',
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme.colors.background.card,
        titleColor: theme.colors.text.primary,
        bodyColor: theme.colors.text.secondary,
        borderColor: theme.colors.border.DEFAULT,
        borderWidth: 1,
      },
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: theme.colors.text.primary,
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'CPU (%)',
          color: theme.colors.text.secondary,
        },
        min: 0,
        max: 100,
        grid: {
          color: `${theme.colors.border.light}50`,
        },
        ticks: {
          color: theme.colors.text.secondary,
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Memória (MB)',
          color: theme.colors.text.secondary,
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
          color: `${theme.colors.border.light}50`,
        },
        ticks: {
          color: theme.colors.text.secondary,
        }
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Usuários',
          color: theme.colors.text.secondary,
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
          color: `${theme.colors.border.light}50`,
        },
        ticks: {
          color: theme.colors.text.secondary,
        }
      },
      x: {
        grid: {
          color: `${theme.colors.border.light}50`,
        },
        ticks: {
          color: theme.colors.text.secondary,
        }
      }
    },
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">Uso do Sistema ao Longo do Tempo</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SystemUsageChart;