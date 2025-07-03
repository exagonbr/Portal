import { useRouter } from 'next/navigation'

export default function PermissionDenied() {
  const router = useRouter()

  return (
    <div className="container-responsive spacing-y-responsive">
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">block</span>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Acesso Negado</h3>
        <p className="text-gray-500 mb-6">Você não tem permissão para enviar comunicações.</p>
        <button
          onClick={() => router.push('/notifications')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para Notificações
        </button>
      </div>
    </div>
  )
}