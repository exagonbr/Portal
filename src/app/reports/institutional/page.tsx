'use client'

import { useState } from 'react'

export default function InstitutionalReportsPage() {
  const [reports] = useState([
    {
      id: '1',
      title: 'Relatório de Matrículas',
      description: 'Análise completa das matrículas por período',
      type: 'enrollment',
      period: '2025-1',
      generatedAt: '2025-06-10',
      status: 'ready'
    },
    {
      id: '2',
      title: 'Relatório de Evasão',
      description: 'Índices de evasão escolar por turma e série',
      type: 'dropout',
      period: '2025-1',
      generatedAt: '2025-06-08',
      status: 'ready'
    },
    {
      id: '3',
      title: 'Relatório de Performance Docente',
      description: 'Avaliação de desempenho dos professores',
      type: 'teacher_performance',
      period: '2025-1',
      generatedAt: '2025-06-05',
      status: 'ready'
    },
    {
      id: '4',
      title: 'Relatório de Infraestrutura',
      description: 'Estado das instalações e equipamentos',
      type: 'infrastructure',
      period: '2025-1',
      generatedAt: null,
      status: 'generating'
    }
  ])

  const [metrics] = useState([
    { label: 'Total de Alunos', value: '1,247', change: '+5.2%', trend: 'up' },
    { label: 'Taxa de Aprovação', value: '94.8%', change: '+2.1%', trend: 'up' },
    { label: 'Taxa de Evasão', value: '3.2%', change: '-1.5%', trend: 'down' },
    { label: 'Satisfação Geral', value: '4.6/5', change: '+0.3', trend: 'up' }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-success/10 text-success'
      case 'generating': return 'bg-warning/10 text-warning'
      case 'error': return 'bg-error/10 text-error'
      default: return 'bg-accent-blue/10 text-accent-blue'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Pronto'
      case 'generating': return 'Gerando'
      case 'error': return 'Erro'
      default: return 'Pendente'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return 'person_add'
      case 'dropout': return 'person_remove'
      case 'teacher_performance': return 'school'
      case 'infrastructure': return 'business'
      default: return 'description'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Relatórios Institucionais</h1>
        <button className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors">
          Gerar Novo Relatório
        </button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-background-primary rounded-lg border border-border p-6">
            <h3 className="text-sm font-medium text-text-secondary">{metric.label}</h3>
            <div className="flex items-end justify-between mt-2">
              <p className="text-2xl font-bold text-text-primary">{metric.value}</p>
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                <span className="material-symbols-outlined text-[16px] mr-1">
                  {metric.trend === 'up' ? 'trending_up' : 'trending_down'}
                </span>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Relatórios */}
      <div className="bg-background-primary rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Relatórios Disponíveis</h2>
        </div>
        
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-background-secondary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent-blue">
                      {getTypeIcon(report.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-text-primary">{report.title}</h3>
                    <p className="text-text-secondary mt-1">{report.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                      <span>Período: {report.period}</span>
                      {report.generatedAt && (
                        <span>Gerado em: {new Date(report.generatedAt).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusText(report.status)}
                  </span>
                  
                  {report.status === 'ready' && (
                    <div className="flex space-x-2">
                      <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-tertiary transition-colors">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-tertiary transition-colors">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                      <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-tertiary transition-colors">
                        <span className="material-symbols-outlined">share</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos de Tendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-primary rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Evolução de Matrículas</h3>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            Gráfico de evolução de matrículas será implementado aqui
          </div>
        </div>
        
        <div className="bg-background-primary rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Performance por Área</h3>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            Gráfico de performance por área será implementado aqui
          </div>
        </div>
      </div>
    </div>
  )
}