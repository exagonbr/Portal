'use client'

import { useState } from 'react'

export default function FinancialReportsPage() {
  const [financialData] = useState([
    {
      id: '1',
      title: 'Receitas do Mês',
      value: 425000.00,
      change: '+12.5%',
      trend: 'up',
      icon: 'trending_up'
    },
    {
      id: '2',
      title: 'Despesas do Mês',
      value: 298000.00,
      change: '+3.2%',
      trend: 'up',
      icon: 'trending_down'
    },
    {
      id: '3',
      title: 'Lucro Líquido',
      value: 127000.00,
      change: '+28.7%',
      trend: 'up',
      icon: 'account_balance'
    },
    {
      id: '4',
      title: 'Inadimplência',
      value: 15600.00,
      change: '-5.1%',
      trend: 'down',
      icon: 'warning'
    }
  ])

  const [reports] = useState([
    {
      id: '1',
      title: 'Demonstrativo de Resultados',
      description: 'DRE mensal com receitas, despesas e lucros',
      period: 'Junho 2025',
      type: 'dre',
      status: 'ready',
      generatedAt: '2025-06-10'
    },
    {
      id: '2',
      title: 'Fluxo de Caixa',
      description: 'Movimentação financeira detalhada',
      period: 'Junho 2025',
      type: 'cashflow',
      status: 'ready',
      generatedAt: '2025-06-10'
    },
    {
      id: '3',
      title: 'Relatório de Inadimplência',
      description: 'Análise de pagamentos em atraso',
      period: 'Junho 2025',
      type: 'defaulters',
      status: 'ready',
      generatedAt: '2025-06-09'
    },
    {
      id: '4',
      title: 'Balanço Patrimonial',
      description: 'Posição patrimonial da instituição',
      period: 'Maio 2025',
      type: 'balance',
      status: 'generating',
      generatedAt: null
    }
  ])

  const [transactions] = useState([
    {
      id: '1',
      description: 'Mensalidades Recebidas',
      amount: 85000.00,
      type: 'income',
      date: '2025-06-10',
      category: 'Mensalidades'
    },
    {
      id: '2',
      description: 'Salários Professores',
      amount: -45000.00,
      type: 'expense',
      date: '2025-06-05',
      category: 'Folha de Pagamento'
    },
    {
      id: '3',
      description: 'Material Didático',
      amount: -12000.00,
      type: 'expense',
      date: '2025-06-03',
      category: 'Material'
    },
    {
      id: '4',
      description: 'Taxas de Matrícula',
      amount: 15000.00,
      type: 'income',
      date: '2025-06-01',
      category: 'Matrículas'
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount))
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Relatórios Financeiros</h1>
        <div className="flex space-x-2">
          <button className="bg-background-primary border border-border text-text-primary px-4 py-2 rounded-lg hover:bg-background-secondary transition-colors">
            Filtrar Período
          </button>
          <button className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors">
            Exportar Dados
          </button>
        </div>
      </div>

      {/* Indicadores Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialData.map((item) => (
          <div key={item.id} className="bg-background-primary rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-secondary">{item.title}</h3>
                <p className="text-2xl font-bold text-text-primary mt-2">
                  {formatCurrency(item.value)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                item.trend === 'up' ? 'bg-success/10' : 'bg-error/10'
              }`}>
                <span className={`material-symbols-outlined ${
                  item.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  {item.icon}
                </span>
              </div>
            </div>
            <div className={`flex items-center mt-3 text-sm ${
              item.trend === 'up' ? 'text-success' : 'text-error'
            }`}>
              <span className="material-symbols-outlined text-[16px] mr-1">
                {item.trend === 'up' ? 'trending_up' : 'trending_down'}
              </span>
              {item.change} vs mês anterior
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatórios Disponíveis */}
        <div className="bg-background-primary rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Relatórios Disponíveis</h2>
          </div>
          
          <div className="divide-y divide-border">
            {reports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-background-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{report.title}</h3>
                    <p className="text-sm text-text-secondary mt-1">{report.description}</p>
                    <p className="text-xs text-text-tertiary mt-1">{report.period}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                    {report.status === 'ready' && (
                      <button className="p-1 text-text-secondary hover:text-text-primary">
                        <span className="material-symbols-outlined text-[16px]">download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-background-primary rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Transações Recentes</h2>
          </div>
          
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-background-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-success/10' : 'bg-error/10'
                    }`}>
                      <span className={`material-symbols-outlined text-[14px] ${
                        transaction.type === 'income' ? 'text-success' : 'text-error'
                      }`}>
                        {transaction.type === 'income' ? 'add' : 'remove'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{transaction.description}</p>
                      <p className="text-xs text-text-secondary">{transaction.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-success' : 'text-error'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-primary rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Receitas vs Despesas</h3>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            Gráfico de receitas vs despesas será implementado aqui
          </div>
        </div>
        
        <div className="bg-background-primary rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Evolução do Fluxo de Caixa</h3>
          <div className="h-64 flex items-center justify-center text-text-secondary">
            Gráfico de fluxo de caixa será implementado aqui
          </div>
        </div>
      </div>
    </div>
  )
}