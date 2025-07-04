// src/components/admin/analytics/SystemUsageChart.tsx
'use client';

import React from 'react';
import { SystemUsageData } from '@/types/analytics';

interface SystemUsageChartProps {
  data: SystemUsageData;
  loading: boolean;
}

/**
 * Um componente para exibir um gráfico de uso do sistema.
 * Este é um placeholder e deve ser integrado com uma biblioteca de gráficos (ex: Recharts, Chart.js).
 */
const SystemUsageChart: React.FC<SystemUsageChartProps> = ({ data, loading }) => {
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
        <p className="text-gray-500">Não há dados de uso do sistema para exibir.</p>
      </div>
    );
  }

  // Placeholder para a implementação real do gráfico
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">Uso do Sistema ao Longo do Tempo</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300">
          [Implementação do Gráfico Aqui]
        </p>
        {/*
          Exemplo com Recharts:
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" label={{ value: 'Uso (%)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Usuários', angle: -90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cpuUsagePercent" stroke="#8884d8" name="CPU" />
              <Line yAxisId="left" type="monotone" dataKey="memoryUsageMb" stroke="#82ca9d" name="Memória (MB)" />
              <Line yAxisId="right" type="monotone" dataKey="activeUsers" stroke="#ffc658" name="Usuários Ativos" />
            </LineChart>
          </ResponsiveContainer>
        */}
      </div>
    </div>
  );
};

export default SystemUsageChart;