'use client'

import React from 'react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

export default function UsageReportsPage() {
  return (
    <DashboardPageLayout
      title="Relatórios de Uso"
      description="Análise detalhada do uso da plataforma pelos usuários"
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Relatórios de Uso
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Esta página está em desenvolvimento. Em breve você poderá visualizar relatórios detalhados sobre o uso da plataforma.
          </p>
        </div>
      </div>
    </DashboardPageLayout>
  )
} 