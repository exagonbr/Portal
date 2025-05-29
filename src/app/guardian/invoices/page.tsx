'use client'

import { useState } from 'react'

export default function GuardianInvoicesPage() {
  const [invoices] = useState([
    {
      id: 'INV-2025-001',
      description: 'Mensalidade - Junho 2025',
      amount: 850.00,
      issueDate: '2025-06-01',
      dueDate: '2025-06-10',
      status: 'issued',
      student: 'Ana Silva',
      downloadUrl: '#'
    },
    {
      id: 'INV-2025-002',
      description: 'Mensalidade - Maio 2025',
      amount: 850.00,
      issueDate: '2025-05-01',
      dueDate: '2025-05-10',
      status: 'paid',
      paidDate: '2025-05-08',
      student: 'Ana Silva',
      downloadUrl: '#'
    },
    {
      id: 'INV-2025-003',
      description: 'Material Didático 2025',
      amount: 320.00,
      issueDate: '2025-03-01',
      dueDate: '2025-03-15',
      status: 'paid',
      paidDate: '2025-03-12',
      student: 'Ana Silva',
      downloadUrl: '#'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success'
      case 'issued': return 'bg-warning/10 text-warning'
      case 'overdue': return 'bg-error/10 text-error'
      default: return 'bg-accent-blue/10 text-accent-blue'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'issued': return 'Emitido'
      case 'overdue': return 'Vencido'
      default: return 'Pendente'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Faturas</h1>
        <div className="flex space-x-2">
          <button className="bg-background-primary border border-border text-text-primary px-4 py-2 rounded-lg hover:bg-background-secondary transition-colors">
            Filtrar
          </button>
          <button className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors">
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background-primary rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-text-secondary">Total de Faturas</h3>
          <p className="text-2xl font-bold text-text-primary mt-1">{invoices.length}</p>
        </div>
        <div className="bg-background-primary rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-text-secondary">Valor Total</h3>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
          </p>
        </div>
        <div className="bg-background-primary rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-text-secondary">Pagas</h3>
          <p className="text-2xl font-bold text-success mt-1">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </div>
        <div className="bg-background-primary rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-text-secondary">Pendentes</h3>
          <p className="text-2xl font-bold text-warning mt-1">
            {invoices.filter(inv => inv.status === 'issued').length}
          </p>
        </div>
      </div>

      {/* Lista de Faturas */}
      <div className="bg-background-primary rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Histórico de Faturas</h2>
        </div>
        
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6 hover:bg-background-secondary transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-text-primary">{invoice.id}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  
                  <p className="text-text-secondary mt-1">{invoice.description}</p>
                  <p className="text-sm text-text-secondary">Aluno: {invoice.student}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                    <div className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      <span>Emitida: {new Date(invoice.issueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>Vencimento: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {invoice.paidDate && (
                      <div className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Pago: {new Date(invoice.paidDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-text-primary">{formatCurrency(invoice.amount)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-tertiary transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                    <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-tertiary transition-colors">
                      <span className="material-symbols-outlined">print</span>
                    </button>
                    <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-tertiary transition-colors">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}