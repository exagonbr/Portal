/**
 * Exemplo de uso do sistema de Logout Ultra-Completo
 * Demonstra diferentes formas de implementar o logout que limpa TUDO
 */

import React from 'react';
import { UltraLogoutButton, EmergencyLogoutButton, SilentLogoutButton } from '../ui/UltraLogoutButton';
import { useUltraLogout } from '../../hooks/useUltraLogout';

export function UltraLogoutExample() {
  const { logout, logoutWithoutConfirmation, emergencyLogout } = useUltraLogout();

  const handleCustomLogout = async () => {
    const confirmed = window.confirm(
      'Esta é uma demonstração do logout personalizado. Continuar?'
    );
    
    if (confirmed) {
      await logoutWithoutConfirmation();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🚨 Sistema de Logout Ultra-Completo
      </h2>
      
      <div className="space-y-6">
        {/* Descrição */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            ✨ O que o Ultra Logout faz:
          </h3>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            <li>🗂️ Limpa completamente localStorage e sessionStorage</li>
            <li>🍪 Remove TODOS os cookies (todas as variações possíveis)</li>
            <li>💾 Limpa caches do navegador</li>
            <li>🗄️ Remove databases IndexedDB</li>
            <li>⚙️ Limpa cache do Service Worker</li>
            <li>🧠 Limpa memória de componentes React</li>
            <li>📜 Limpa histórico e estado do navegador</li>
            <li>📡 Notifica backend sobre logout</li>
            <li>🎯 Redireciona forçadamente para login</li>
          </ul>
        </div>

        {/* Botões de exemplo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Logout padrão com confirmação */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Logout Padrão</h4>
            <p className="text-sm text-gray-600 mb-3">
              Com confirmação do usuário
            </p>
            <UltraLogoutButton>
              Sair do Sistema
            </UltraLogoutButton>
          </div>

          {/* Logout silencioso */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Logout Silencioso</h4>
            <p className="text-sm text-gray-600 mb-3">
              Sem confirmação, direto
            </p>
            <SilentLogoutButton>
              Sair Silenciosamente
            </SilentLogoutButton>
          </div>

          {/* Logout de emergência */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Logout de Emergência</h4>
            <p className="text-sm text-red-600 mb-3">
              Limpeza imediata e radical
            </p>
            <EmergencyLogoutButton>
              🚨 Emergência
            </EmergencyLogoutButton>
          </div>
        </div>

        {/* Exemplo de uso programático */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            💻 Uso Programático (Hook)
          </h3>
          <p className="text-yellow-700 mb-3">
            Você também pode usar o hook `useUltraLogout` diretamente:
          </p>
          <div className="bg-yellow-100 p-3 rounded font-mono text-sm text-yellow-800 mb-3">
            {`const { logout, logoutWithoutConfirmation, emergencyLogout } = useUltraLogout();`}
          </div>
          <button
            onClick={handleCustomLogout}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            Teste Hook Personalizado
          </button>
        </div>

        {/* Diferentes tamanhos */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            📏 Diferentes Tamanhos
          </h3>
          <div className="flex items-center space-x-4">
            <UltraLogoutButton size="sm" showConfirmation={false}>
              Pequeno
            </UltraLogoutButton>
            <UltraLogoutButton size="md" showConfirmation={false}>
              Médio
            </UltraLogoutButton>
            <UltraLogoutButton size="lg" showConfirmation={false}>
              Grande
            </UltraLogoutButton>
          </div>
        </div>

        {/* Como usar em componentes existentes */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            🔧 Como Integrar nos Componentes Existentes
          </h3>
          <div className="space-y-2 text-purple-700">
            <p><strong>1. Substituir botões existentes:</strong></p>
            <div className="bg-purple-100 p-2 rounded font-mono text-sm">
              {`import { UltraLogoutButton } from '@/components/ui/UltraLogoutButton';`}
            </div>
            
            <p><strong>2. Usar no AuthContext:</strong></p>
            <div className="bg-purple-100 p-2 rounded font-mono text-sm">
              {`const { performUltraLogout } = await import('@/services/ultraLogoutService');`}
            </div>
            
            <p><strong>3. Em sidebars e headers:</strong></p>
            <div className="bg-purple-100 p-2 rounded font-mono text-sm">
              {`<UltraLogoutButton className="w-full" variant="silent" />`}
            </div>
          </div>
        </div>

        {/* Aviso importante */}
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ Importante
          </h3>
          <p className="text-red-700">
            O Ultra Logout limpa <strong>TODOS OS DADOS</strong> do navegador relacionados à aplicação.
            Use com cuidado em produção e sempre teste antes de implementar.
          </p>
        </div>
      </div>
    </div>
  );
} 