'use client'

import { useState } from 'react'

export default function AdminPerformancePage() {
  const [metrics] = useState([
    { name: 'CPU Usage', value: '45%', status: 'good' },
    { name: 'Memory Usage', value: '67%', status: 'warning' },
    { name: 'Disk Usage', value: '23%', status: 'good' },
    { name: 'Network I/O', value: '12 MB/s', status: 'good' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Performance do Sistema</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-background-primary rounded-lg border border-border p-6">
            <h3 className="text-sm font-medium text-text-secondary">{metric.name}</h3>
            <p className="text-2xl font-bold text-text-primary mt-2">{metric.value}</p>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
              metric.status === 'good' ? 'bg-success/10 text-success' :
              metric.status === 'warning' ? 'bg-warning/10 text-warning' :
              'bg-error/10 text-error'
            }`}>
              {metric.status === 'good' ? 'Normal' : 
               metric.status === 'warning' ? 'Atenção' : 'Crítico'}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background-primary rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Gráfico de Performance</h2>
        <div className="h-64 flex items-center justify-center text-text-secondary">
          Gráfico de performance será implementado aqui
        </div>
      </div>
    </div>
  )
}