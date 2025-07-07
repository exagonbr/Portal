'use client';

import React from 'react';
import { SystemAnalytics, S3StorageInfo } from '../../../services/awsService';
import { Doughnut } from 'react-chartjs-2';
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

interface MetricsCardsProps {
  analytics: SystemAnalytics | null;
  s3Info: S3StorageInfo | null;
  loading: boolean;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ analytics, s3Info, loading }) => {
  const { theme } = useTheme();

  // Configurações comuns para os gráficos de rosca
  const getChartOptions = (title: string, suffix: string = '%'): ChartOptions<'doughnut'> => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
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
            const value = context.parsed;
            return `${value}${suffix}`;
          }
        }
      }
    },
  });

  // Configuração para o gráfico de CPU
  const cpuChartData = {
    labels: ['Uso', 'Disponível'],
    datasets: [
      {
        data: [
          analytics?.cpuUsage || 0,
          100 - (analytics?.cpuUsage || 0)
        ],
        backgroundColor: [
          `${theme.colors.primary.DEFAULT}CC`, // CC para 80% de opacidade
          `${theme.colors.border.light}40` // 40 para 25% de opacidade
        ],
        borderColor: [
          theme.colors.primary.DEFAULT,
          theme.colors.border.light
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configuração para o gráfico de Memória
  const memoryChartData = {
    labels: ['Uso', 'Disponível'],
    datasets: [
      {
        data: [
          analytics?.memoryUsage || 0,
          100 - (analytics?.memoryUsage || 0)
        ],
        backgroundColor: [
          `${theme.colors.secondary.DEFAULT}CC`,
          `${theme.colors.border.light}40`
        ],
        borderColor: [
          theme.colors.secondary.DEFAULT,
          theme.colors.border.light
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configuração para o gráfico de Disco
  const diskChartData = {
    labels: ['Uso', 'Disponível'],
    datasets: [
      {
        data: [
          analytics?.diskUsage || 0,
          100 - (analytics?.diskUsage || 0)
        ],
        backgroundColor: [
          `${theme.colors.accent.DEFAULT}CC`,
          `${theme.colors.border.light}40`
        ],
        borderColor: [
          theme.colors.accent.DEFAULT,
          theme.colors.border.light
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configuração para o gráfico de S3
  const s3ChartData = {
    labels: ['Uso', 'Disponível'],
    datasets: [
      {
        data: [
          s3Info?.totalSizeMb || 0,
          s3Info ? Math.max(10240 - s3Info.totalSizeMb, 0) : 10240 // Assumindo 10GB como capacidade máxima
        ],
        backgroundColor: [
          `${theme.colors.status.info}CC`,
          `${theme.colors.border.light}40`
        ],
        borderColor: [
          theme.colors.status.info,
          theme.colors.border.light
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card de CPU */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uso de CPU</h4>
        {loading ? (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">...</p>
        ) : (
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4">
              <Doughnut data={cpuChartData} options={getChartOptions('CPU')} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(analytics?.cpuUsage ?? 0).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Card de Memória */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uso de Memória</h4>
        {loading ? (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">...</p>
        ) : (
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4">
              <Doughnut data={memoryChartData} options={getChartOptions('Memória')} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(analytics?.memoryUsage ?? 0).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Card de Armazenamento S3 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Armazenamento S3</h4>
        {loading ? (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">...</p>
        ) : (
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4">
              <Doughnut data={s3ChartData} options={getChartOptions('S3', ' GB')} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {((s3Info?.totalSizeMb ?? 0) / 1024).toFixed(2)} GB
            </p>
          </div>
        )}
      </div>

      {/* Card de Uso de Disco */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uso de Disco</h4>
        {loading ? (
          <p className="text-3xl font-bold text-gray-900 dark:text-white">...</p>
        ) : (
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4">
              <Doughnut data={diskChartData} options={getChartOptions('Disco')} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(analytics?.diskUsage ?? 0).toFixed(1)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCards; 