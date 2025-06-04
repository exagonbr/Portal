'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_BACKUPS = [
  {
    id: 1,
    name: 'backup_completo_20240320.sql',
    type: 'Completo',
    date: '2024-03-20 02:00:00',
    size: '2.8 GB',
    status: 'success',
    duration: '45 min'
  },
  {
    id: 2,
    name: 'backup_incremental_20240319.sql',
    type: 'Incremental',
    date: '2024-03-19 02:00:00',
    size: '156 MB',
    status: 'success',
    duration: '8 min'
  },
  {
    id: 3,
    name: 'backup_completo_20240318.sql',
    type: 'Completo',
    date: '2024-03-18 02:00:00',
    size: '2.7 GB',
    status: 'failed',
    duration: '0 min'
  }
]

export default function AdminBackupPage() {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Backup</h1>
            <p className="text-gray-600">Gerenciamento de backups do sistema</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors"
          >
            <span className="material-symbols-outlined">backup</span>
            <span>Novo Backup</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Último Backup</div>
            <div className="text-lg font-bold text-primary">20/03/2024</div>
            <div className="text-sm text-accent-green mt-1">Sucesso</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Próximo Backup</div>
            <div className="text-lg font-bold text-primary">21/03/2024</div>
            <div className="text-sm text-primary mt-1">02:00</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Espaço Usado</div>
            <div className="text-lg font-bold text-primary">8.4 GB</div>
            <div className="text-sm text-gray-600 mt-1">de 50 GB</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-primary">Nome</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Tipo</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Data</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Tamanho</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Status</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Ações</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_BACKUPS.map((backup) => (
              <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-primary-dark">{backup.name}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backup.type === 'Completo' ? 'bg-primary/20 text-primary' : 'bg-accent-green/20 text-accent-green'
                  }`}>
                    {backup.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">{backup.date}</td>
                <td className="py-4 px-6 text-gray-600">{backup.size}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backup.status === 'success' ? 'bg-accent-green/20 text-accent-green' : 'bg-error/20 text-error'
                  }`}>
                    {backup.status === 'success' ? 'Sucesso' : 'Falha'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    {backup.status === 'success' && (
                      <>
                        <button className="text-primary hover:text-primary-dark transition-colors">
                          <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                        <button className="text-accent-green hover:text-accent-green/80 transition-colors">
                          <span className="material-symbols-outlined text-sm">restore</span>
                        </button>
                      </>
                    )}
                    <button className="text-error hover:text-error/80 transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Criar Backup</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Backup</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Completo</option>
                  <option>Incremental</option>
                  <option>Diferencial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descrição opcional"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Criar Backup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}