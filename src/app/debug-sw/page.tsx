import ServiceWorkerDebug from '@/components/ServiceWorkerDebug';

export default function DebugServiceWorkerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug do Service Worker</h1>
        <p className="text-gray-600">
          Use esta página para diagnosticar e resolver problemas com o Service Worker.
        </p>
      </div>
      
      <ServiceWorkerDebug />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">Instruções:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Clique em "Verificar Status" para ver o estado atual do Service Worker</li>
          <li>Se houver problemas, tente "Limpar Cache" para remover dados corrompidos</li>
          <li>Use "Recarregar Assets" para tentar carregar novamente recursos problemáticos</li>
          <li>Se nada funcionar, use "Recarregar Página" para um reset completo</li>
        </ol>
      </div>
    </div>
  );
} 