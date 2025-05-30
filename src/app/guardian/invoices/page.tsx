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
      case 'paid': return 'bg-accent-green/20 text-accent-green'
      case 'issued': return 'bg-accent-yellow/20 text-accent-yellow'
      case 'overdue': return 'bg-error/20 text-error'
      default: return 'bg-primary/20 text-primary'
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
        <h1 className="text-2xl font-bold text-primary">Faturas</h1>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-200 text-primary px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Filtrar
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Total de Faturas</h3>
          <p className="text-2xl font-bold text-primary mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Valor Total</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Pagas</h3>
          <p className="text-2xl font-bold text-accent-green mt-1">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Pendentes</h3>
          <p className="text-2xl font-bold text-accent-yellow mt-1">
            {invoices.filter(inv => inv.status === 'issued').length}
          </p>
        </div>
      </div>

      {/* Lista de Faturas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-primary">Histórico de Faturas</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-primary">{invoice.id}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mt-1">{invoice.description}</p>
                  <p className="text-sm text-gray-600">Aluno: {invoice.student}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
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
                    <p className="text-xl font-bold text-primary">{formatCurrency(invoice.amount)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="material-symbols-outlined">print</span>
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors">
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