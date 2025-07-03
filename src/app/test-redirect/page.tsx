'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debugAuthState, validateAuthFlow } from '@/utils/debugAuth';
import { getDashboardPath, isValidRole, convertBackendRole, getAllValidRoles } from '@/utils/roleRedirect';

export default function TestRedirectPage() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (!loading) {
      console.log('🔍 Página de teste carregada');
      
      // Obter informações de debug
      const debug = debugAuthState();
      setDebugInfo(debug);
      
      // Validar fluxo de autenticação
      const validation = validateAuthFlow();
      setValidationResult(validation);
      
      console.log('🔍 Debug Info:', debug);
      console.log('🔍 Validation Result:', validation);
    }
  }, [loading]);

  const testRoleConversion = (role: string) => {
    const converted = convertBackendRole(role);
    const isValid = isValidRole(role);
    const dashboard = getDashboardPath(converted);
    
    return {
      original: role,
      converted,
      isValid,
      dashboard
    };
  };

  const testRoles = [
    'aluno',
    'Aluno', 
    'ALUNO',
    'professor',
    'Professor',
    'PROFESSOR',
    'administrador',
    'student',
    'teacher',
    'admin',
    'invalid_role'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Teste de Redirecionamento e Debug de Autenticação
        </h1>

        {/* Estado do Usuário */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Estado do Usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Dados do AuthContext:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Estado de Loading:</h3>
              <p className={`font-medium ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
                {loading ? 'Carregando...' : 'Carregado'}
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Informações de Debug</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Estado Geral:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Válido:</span> 
                    <span className={debugInfo.isValid ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.isValid ? 'Sim' : 'Não'}
                    </span>
                  </p>
                  <p><span className="font-medium">Role Original:</span> {debugInfo.userRole || 'N/A'}</p>
                  <p><span className="font-medium">Role Normalizada:</span> {debugInfo.normalizedRole || 'N/A'}</p>
                  <p><span className="font-medium">Dashboard Path:</span> {debugInfo.dashboardPath || 'N/A'}</p>
                  <p><span className="font-medium">Timestamp:</span> {debugInfo.timestamp}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Cookies:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.cookies, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">✅ Resultado da Validação</h2>
            <div className={`p-4 rounded-lg ${validationResult.hasIssues ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={`font-medium ${validationResult.hasIssues ? 'text-red-800' : 'text-green-800'}`}>
                {validationResult.hasIssues ? '❌ Problemas Detectados' : '✅ Tudo OK'}
              </p>
              {validationResult.hasIssues && (
                <ul className="mt-2 text-red-700 text-sm list-disc list-inside">
                  {validationResult.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Teste de Conversão de Roles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔄 Teste de Conversão de Roles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role Original</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role Convertida</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">É Válida?</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Dashboard Path</th>
                </tr>
              </thead>
              <tbody>
                {testRoles.map((role, index) => {
                  const result = testRoleConversion(role);
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 text-sm font-mono">{result.original}</td>
                      <td className="px-4 py-2 text-sm font-mono">{result.converted || 'null'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>
                          {result.isValid ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm font-mono">{result.dashboard || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Válidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Todas as Roles Válidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {getAllValidRoles().map((role, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                {role}
              </div>
            ))}
          </div>
        </div>

        {/* Ações de Teste */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧪 Ações de Teste</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                console.log('🧪 Teste manual: Revalidando autenticação');
                const newValidation = validateAuthFlow();
                setValidationResult(newValidation);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Revalidar Autenticação
            </button>
            <button
              onClick={() => {
                console.log('🧪 Teste manual: Atualizando debug info');
                const newDebug = debugAuthState();
                setDebugInfo(newDebug);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Atualizar Debug Info
            </button>
            <button
              onClick={() => {
                console.log('🧪 Teste manual: Limpando cache de debug');
                setDebugInfo(null);
                setValidationResult(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Limpar Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 