'use client'

import { useState } from 'react'

export default function GuardianPaymentsPage() {
  const [payments] = useState([
    {
      id: '1',
      description: 'Mensalidade - Junho 2025',
      amount: 850.00,
      dueDate: '2025-06-10',
      status: 'pending',
      student: 'Ana Silva'
    },
    {
      id: '2',
      description: 'Mensalidade - Maio 2025',
      amount: 850.00,
      dueDate: '2025-05-10',
      status: 'paid',
      paidDate: '2025-05-08',
      student: 'Ana Silva'
    },
    {
      id: '3',
      description: 'Material Didático',
      amount: 320.00,
      dueDate: '2025-03-15',
      status: 'paid',
      paidDate: '2025-03-12',
      student: 'Ana Silva'
    },
    {
      id: '4',
      description: 'Uniforme Escolar',
      amount: 180.00,
      dueDate: '2025-02-20',
      status: 'overdue',
      student: 'Ana Silva'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-accent-green/20 text-accent-green'
      case 'pending': return 'bg-accent-yellow/20 text-accent-yellow'
      case 'overdue': return 'bg-error/20 text-error'
      default: return 'bg-primary/20 text-primary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'pending': return 'Pendente'
      case 'overdue': return 'Vencido'
      default: return 'Aguardando'
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
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Pagamentos</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Gerar Boleto
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Pendente</h3>
          <p className="text-2xl font-bold text-accent-yellow mt-1">
            {formatCurrency(payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Pago este Mês</h3>
          <p className="text-2xl font-bold text-accent-green mt-1">
            {formatCurrency(payments.filter(p => p.status === 'paid' && p.paidDate?.includes('2025-06')).reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600">Próximo Vencimento</h3>
          <p className="text-lg font-semibold text-primary mt-1">10/06/2025</p>
        </div>
      </div>

      {/* Lista de Pagamentos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-primary">Histórico de Pagamentos</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-primary">{payment.description}</h3>
                  <p className="text-sm text-gray-600 mt-1">Aluno: {payment.student}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      <span>Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {payment.paidDate && (
                      <div className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Pago em: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{formatCurrency(payment.amount)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  
                  {payment.status === 'pending' && (
                    <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}