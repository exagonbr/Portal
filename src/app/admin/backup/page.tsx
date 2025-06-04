'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useCallback, FormEvent } from 'react'
import { apiClient, ApiClientError } from '@/services/apiClient'
import { PaginatedResponseDto } from '@/types/api' // Assuming backups might be paginated

interface Backup {
  id: number | string;
  name: string;
  type: 'Completo' | 'Incremental' | 'Diferencial' | string; // Allow string for flexibility
  date: string; // Or Date, if conversion is handled
  size: string;
  status: 'success' | 'failed' | 'in_progress' | string; // Allow string for flexibility
  duration?: string; // Optional
}

interface BackupSummaryStats {
  lastBackupDate?: string;
  lastBackupStatus?: 'success' | 'failed' | string;
  nextBackupDate?: string;
  nextBackupTime?: string;
  usedSpace?: string;
  totalSpace?: string;
}

// MOCK_BACKUPS will be replaced by API data

export default function AdminBackupPage() {
  const { user } = useAuth()
  const [backups, setBackups] = useState<Backup[]>([])
  const [summaryStats, setSummaryStats] = useState<BackupSummaryStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [newBackupType, setNewBackupType] = useState<'Completo' | 'Incremental' | 'Diferencial'>('Completo');
  const [newBackupDescription, setNewBackupDescription] = useState('');


  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Adjust API endpoint as necessary
      // This might be one endpoint for list and summary, or two separate ones.
      const response = await apiClient.get<{ items: Backup[], summary: BackupSummaryStats } | PaginatedResponseDto<Backup>>('/api/admin/backups')
      
      if (response.success && response.data) {
        if ('items' in response.data && 'summary' in response.data) { // Custom combined response
            setBackups(response.data.items || [])
            setSummaryStats(response.data.summary || {})
        } else if ('items' in response.data) { // Paginated response for backups, summary might be separate
            setBackups(response.data.items || [])
            // Fetch summary stats separately if needed
            // const summaryResponse = await apiClient.get<BackupSummaryStats>('/api/admin/backups/summary');
            // if (summaryResponse.success) setSummaryStats(summaryResponse.data || {});
        } else { // Fallback if structure is just Backup[]
             setBackups(response.data as Backup[] || [])
        }
      } else {
        setError(response.message || 'Falha ao buscar backups.')
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('Ocorreu um erro desconhecido ao buscar backups.')
      }
      console.error("Erro ao buscar backups:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBackups()
  }, [fetchBackups])

  const handleCreateBackup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingBackup(true);
    setError(null);
    try {
      // TODO: Adjust API endpoint and payload for creating backup
      const response = await apiClient.post('/api/admin/backups', {
        type: newBackupType,
        description: newBackupDescription,
      });

      if (response.success) {
        setShowCreateModal(false);
        setNewBackupDescription(''); // Reset form
        fetchBackups(); // Refresh the list
        // Optionally show a success toast/message
      } else {
        setError(response.message || 'Falha ao criar backup.');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao criar backup.');
      }
      console.error("Erro ao criar backup:", err);
    } finally {
      setIsCreatingBackup(false);
    }
  };
  
  const handleDeleteBackup = async (backupId: string | number) => {
    if (!confirm(`Tem certeza que deseja excluir o backup ${backupId}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setError(null);
    try {
      // TODO: Adjust API endpoint for deleting backup
      const response = await apiClient.delete(`/api/admin/backups/${backupId}`);
      if (response.success) {
        fetchBackups(); // Refresh list
        // Optionally show success toast
      } else {
        setError(response.message || `Falha ao excluir backup ${backupId}.`);
      }
    } catch (err) {
       if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError(`Ocorreu um erro desconhecido ao excluir backup ${backupId}.`);
      }
      console.error(`Erro ao excluir backup ${backupId}:`, err);
    }
  };


  if (loading && backups.length === 0) { // Show main loader only on initial load
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Carregando informações de backup...</p>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Backup</h1>
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

        {error && !showCreateModal && ( // Don't show main page error if modal error is shown
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
            <strong>Erro:</strong> {error}
            <button onClick={fetchBackups} className="ml-4 text-sm underline">Tentar novamente</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Último Backup</div>
            <div className="text-lg font-bold text-primary">{summaryStats.lastBackupDate || 'N/A'}</div>
            <div className={`text-sm mt-1 ${summaryStats.lastBackupStatus === 'success' ? 'text-accent-green' : summaryStats.lastBackupStatus === 'failed' ? 'text-error' : 'text-gray-500'}`}>
              {summaryStats.lastBackupStatus ? (summaryStats.lastBackupStatus === 'success' ? 'Sucesso' : 'Falha') : 'N/A'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Próximo Backup Agendado</div>
            <div className="text-lg font-bold text-primary">{summaryStats.nextBackupDate || 'N/A'}</div>
            <div className="text-sm text-primary mt-1">{summaryStats.nextBackupTime || ''}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Espaço Usado (Backups)</div>
            <div className="text-lg font-bold text-primary">{summaryStats.usedSpace || 'N/A'}</div>
            {summaryStats.totalSpace && <div className="text-sm text-gray-600 mt-1">de {summaryStats.totalSpace}</div>}
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
            {loading && backups.length > 0 && (
                <tr><td colSpan={6} className="text-center py-4">Atualizando lista...</td></tr>
            )}
            {!loading && backups.length === 0 && !error && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Nenhum backup encontrado.</td></tr>
            )}
            {backups.map((backup) => (
              <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-primary-dark">{backup.name}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backup.type === 'Completo' ? 'bg-primary/20 text-primary' :
                    backup.type === 'Incremental' ? 'bg-accent-blue/20 text-accent-blue' : // Example color
                    'bg-accent-green/20 text-accent-green'
                  }`}>
                    {backup.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-600">{new Date(backup.date).toLocaleString('pt-BR')}</td>
                <td className="py-4 px-6 text-gray-600">{backup.size}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    backup.status === 'success' ? 'bg-accent-green/20 text-accent-green' :
                    backup.status === 'failed' ? 'bg-error/20 text-error' :
                    backup.status === 'in_progress' ? 'bg-accent-yellow/20 text-accent-yellow' : // Example for in_progress
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {backup.status === 'success' ? 'Sucesso' : backup.status === 'failed' ? 'Falha' : backup.status === 'in_progress' ? 'Em Progresso' : backup.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    {backup.status === 'success' && (
                      <>
                        <button title="Download" className="text-primary hover:text-primary-dark transition-colors">
                          <span className="material-symbols-outlined text-sm">download</span>
                        </button>
                        <button title="Restaurar" className="text-accent-green hover:text-accent-green/80 transition-colors">
                          <span className="material-symbols-outlined text-sm">restore</span>
                        </button>
                      </>
                    )}
                     <button title="Excluir" onClick={() => handleDeleteBackup(backup.id)} className="text-error hover:text-error/80 transition-colors">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Criar Novo Backup</h3>
              <button
                onClick={() => { setShowCreateModal(false); setError(null); }} // Clear modal-specific error on close
                className="text-gray-400 hover:text-gray-600"
                disabled={isCreatingBackup}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {error && showCreateModal && ( // Show error inside modal if it occurred during creation
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-300 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label htmlFor="backupType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Backup</label>
                <select
                  id="backupType"
                  value={newBackupType}
                  onChange={(e) => setNewBackupType(e.target.value as 'Completo' | 'Incremental' | 'Diferencial')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isCreatingBackup}
                >
                  <option value="Completo">Completo</option>
                  <option value="Incremental">Incremental</option>
                  <option value="Diferencial">Diferencial</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="backupDescription" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  id="backupDescription"
                  type="text"
                  value={newBackupDescription}
                  onChange={(e) => setNewBackupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descrição opcional"
                  disabled={isCreatingBackup}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setError(null); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isCreatingBackup}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
                  disabled={isCreatingBackup}
                >
                  {isCreatingBackup ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-sm mr-2">progress_activity</span>
                      Criando...
                    </>
                  ) : (
                    'Criar Backup'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}