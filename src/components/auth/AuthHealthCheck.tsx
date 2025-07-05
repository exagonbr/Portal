'use client';

import { useEffect, useState } from 'react';
import { runAuthDiagnostics, autoRepairAuth, type AuthDiagnosticResult } from '@/utils/auth-diagnostic';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface AuthHealthCheckProps {
  children: React.ReactNode;
  autoRepair?: boolean;
  showDebugInfo?: boolean;
}

export function AuthHealthCheck({ 
  children, 
  autoRepair = true, 
  showDebugInfo = false 
}: AuthHealthCheckProps) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy' | 'repairing'>('checking');
  const [diagnostics, setDiagnostics] = useState<AuthDiagnosticResult | null>(null);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkAuthHealth();
  }, []);

  const checkAuthHealth = async () => {
    try {
      setHealthStatus('checking');
      const result = await runAuthDiagnostics();
      setDiagnostics(result);

      // Determinar status baseado no diagnóstico
      if (result.errors.length === 0 && result.tokenValid) {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('unhealthy');
        
        // Tentar reparo automático se habilitado
        if (autoRepair && repairAttempts < 3) {
          await attemptAutoRepair();
        }
      }
    } catch (error) {
      console.error('Erro durante verificação de saúde da auth:', error);
      setHealthStatus('unhealthy');
    }
  };

  const attemptAutoRepair = async () => {
    try {
      setHealthStatus('repairing');
      setRepairAttempts(prev => prev + 1);
      
      const repairResult = await autoRepairAuth();
      
      if (repairResult.success) {
        toast.success('Problemas de autenticação corrigidos automaticamente');
        
        // Verificar novamente após reparo
        setTimeout(() => {
          checkAuthHealth();
        }, 1000);
      } else {
        toast.error('Não foi possível corrigir automaticamente. Redirecionando para login...');
        setTimeout(() => {
          router.push('/auth/login?reason=auth_repair_failed');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro durante reparo automático:', error);
      toast.error('Erro durante reparo automático');
      setHealthStatus('unhealthy');
    }
  };

  // Componente de debug (apenas em desenvolvimento)
  const DebugInfo = () => {
    if (!showDebugInfo || !diagnostics) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
        <div className="font-bold mb-2">🔍 Auth Debug Info</div>
        <div>Status: {healthStatus}</div>
        <div>Token: {diagnostics.hasToken ? '✅' : '❌'}</div>
        <div>Válido: {diagnostics.tokenValid ? '✅' : '❌'}</div>
        <div>Expirado: {diagnostics.tokenExpired ? '❌' : '✅'}</div>
        <div>Formato: {diagnostics.tokenFormat}</div>
        <div>Tentativas de reparo: {repairAttempts}</div>
        
        {diagnostics.errors.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold text-red-400">Erros:</div>
            {diagnostics.errors.slice(0, 2).map((error, i) => (
              <div key={i} className="text-red-300 truncate">{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente de loading durante verificação
  const LoadingOverlay = () => {
    if (healthStatus !== 'checking' && healthStatus !== 'repairing') return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              {healthStatus === 'checking' ? 'Verificando autenticação...' : 'Corrigindo problemas...'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {children}
      <LoadingOverlay />
      <DebugInfo />
    </>
  );
}

// Hook para usar o diagnóstico de auth em qualquer componente
export function useAuthDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<AuthDiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const result = await runAuthDiagnostics();
      setDiagnostics(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const runRepair = async () => {
    setIsLoading(true);
    try {
      const result = await autoRepairAuth();
      
      // Executar diagnóstico novamente após reparo
      await runDiagnostics();
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    diagnostics,
    isLoading,
    runDiagnostics,
    runRepair
  };
} 