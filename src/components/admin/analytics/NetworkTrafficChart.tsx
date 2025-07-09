'use client';

import React from 'react';
import { SystemAnalytics } from '../../../services/awsService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface NetworkTrafficChartProps {
  data: SystemAnalytics | null;
  loading: boolean;
}

const NetworkTrafficChart: React.FC<NetworkTrafficChartProps> = ({ data, loading }) => {
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500">Carregando dados do gráfico...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500">Não há dados de tráfego de rede para exibir.</p>
      </div>
    );
  }

  // Formatação dos dados para o gráfico
  const chartData = {
    labels: ['Tráfego de Rede'],
    datasets: [
      {
        label: 'Entrada (MB/s)',
        data: [(data.networkIn / 1024 / 1024).toFixed(2)],
        backgroundColor: `${theme.colors.primary.DEFAULT}CC`,
        borderColor: theme.colors.primary.DEFAULT,
        borderWidth: 1,
      },
      {
        label: 'Saída (MB/s)',
        data: [(data.networkOut / 1024 / 1024).toFixed(2)],
        backgroundColor: `${theme.colors.accent.DEFAULT}CC`,
        borderColor: theme.colors.accent.DEFAULT,
        borderWidth: 1,
      }
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
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
            const label = context.dataset.label || '';
            const value = context.parsed.x;
            return `${label}: ${value} MB/s`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'MB/s',
          color: theme.colors.text.secondary,
        },
        grid: {
          color: `${theme.colors.border.light}50`,
        },
        ticks: {
          color: theme.colors.text.secondary,
        }
      },
      y: {
        grid: {
          color: `${theme.colors.border.light}50`,
        },
        ticks: {
          color: theme.colors.text.secondary,
        }
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">Tráfego de Rede</h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default NetworkTrafficChart; 