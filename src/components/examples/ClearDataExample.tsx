/**
 * Componente de exemplo mostrando como usar a limpeza de dados
 * Este arquivo serve como documentação e exemplo de uso
 */

import { useRedirectWithClearData } from '@/hooks/useRedirectWithClearData';
import { clearAllDataForUnauthorized, clearAuthDataOnly } from '@/utils/clearAllData';

export const ClearDataExample = () => {
  const { redirectToLoginWithClearData, redirectWithAuthClear, redirectWithFullClear } = useRedirectWithClearData();

  const handleUnauthorizedAccess = async () => {
    // Exemplo 1: Usar o hook para redirecionamento com limpeza
    await redirectToLoginWithClearData('unauthorized');
  };

  const handleSessionExpired = async () => {
    // Exemplo 2: Usar o hook para sessão expirada
    await redirectToLoginWithClearData('session_expired');
  };

  const handleLogout = async () => {
    // Exemplo 3: Usar limpeza completa diretamente
    await clearAllDataForUnauthorized();
    window.location.href = '/login';
  };

  const handleQuickAuthClear = () => {
    // Exemplo 4: Limpeza rápida apenas de dados de autenticação
    clearAuthDataOnly();
    window.location.href = '/login';
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Exemplos de Limpeza de Dados</h2>
      
      <div className="space-y-2">
        <button 
          onClick={handleUnauthorizedAccess}
          className="block w-full p-2 bg-red-500 text-white rounded"
        >
          Simular Acesso Não Autorizado
        </button>
        
        <button 
          onClick={handleSessionExpired}
          className="block w-full p-2 bg-orange-500 text-white rounded"
        >
          Simular Sessão Expirada
        </button>
        
        <button 
          onClick={handleLogout}
          className="block w-full p-2 bg-blue-500 text-white rounded"
        >
          Logout com Limpeza Completa
        </button>
        
        <button 
          onClick={handleQuickAuthClear}
          className="block w-full p-2 bg-gray-500 text-white rounded"
        >
          Limpeza Rápida de Autenticação
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Como usar:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>clearAllDataForUnauthorized():</strong> Limpa localStorage, sessionStorage, cookies, IndexedDB e cache</li>
          <li><strong>clearAuthDataOnly():</strong> Limpa apenas dados de autenticação</li>
          <li><strong>useRedirectWithClearData():</strong> Hook para redirecionamentos com limpeza automática</li>
        </ul>
      </div>
    </div>
  );
}; 