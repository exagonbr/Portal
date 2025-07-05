'use client';

import React, { useState, useEffect } from 'react';
import { debugToken, cleanupTokens, checkAllTokenSources } from '@/utils/token-debug';
import { isDevelopment } from '@/utils/env';

interface TokenInfo {
  exists: boolean;
  length?: number;
  preview?: string;
  isValid?: boolean;
  parts?: number;
  error?: string;
}

const TokenDebugger: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({ exists: false });
  const [debugOutput, setDebugOutput] = useState<string>('');

  const checkToken = () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setTokenInfo({ exists: false });
      return;
    }

    try {
      const parts = token.split('.');
      const isValid = parts.length === 3;
      
      setTokenInfo({
        exists: true,
        length: token.length,
        preview: token.substring(0, 50) + '...',
        isValid,
        parts: parts.length
      });
    } catch (error) {
      setTokenInfo({
        exists: true,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  const runDebugToken = () => {
    const token = localStorage.getItem('accessToken');
    
    // Capturar console.log para mostrar no componente
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalGroup = console.group;
    const originalGroupEnd = console.groupEnd;
    
    let output = '';
    
    const captureLog = (...args: any[]) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    const captureWarn = (...args: any[]) => {
      output += '⚠️ ' + args.join(' ') + '\n';
      originalWarn(...args);
    };
    
    const captureError = (...args: any[]) => {
      output += '❌ ' + args.join(' ') + '\n';
      originalError(...args);
    };
    
    const captureGroup = (...args: any[]) => {
      output += '\n=== ' + args.join(' ') + ' ===\n';
      originalGroup(...args);
    };
    
    const captureGroupEnd = () => {
      output += '=== FIM ===\n\n';
      originalGroupEnd();
    };
    
    console.log = captureLog;
    console.warn = captureWarn;
    console.error = captureError;
    console.group = captureGroup;
    console.groupEnd = captureGroupEnd;
    
    try {
      debugToken(token);
      setDebugOutput(output);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
    }
  };

  const clearTokens = () => {
    cleanupTokens();
    checkToken();
    setDebugOutput('Tokens limpos. Verifique o console para detalhes.');
  };

  const checkAllSources = () => {
    checkAllTokenSources();
    setDebugOutput('Verificação de todas as fontes concluída. Verifique o console.');
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (!isDevelopment()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="text-lg font-bold mb-2">🔍 Token Debugger</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-1">Status do Token:</h4>
        {tokenInfo.exists ? (
          <div className="text-sm">
            <p>✅ Token existe</p>
            <p>📏 Tamanho: {tokenInfo.length}</p>
            <p>🔧 Partes: {tokenInfo.parts}</p>
            <p>✅ Válido: {tokenInfo.isValid ? 'Sim' : 'Não'}</p>
            {tokenInfo.error && <p className="text-red-400">❌ Erro: {tokenInfo.error}</p>}
          </div>
        ) : (
          <p className="text-yellow-400">⚠️ Nenhum token encontrado</p>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={checkToken}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          🔄 Verificar Token
        </button>
        
        <button
          onClick={runDebugToken}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
        >
          🔍 Debug Detalhado
        </button>
        
        <button
          onClick={clearTokens}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          🧹 Limpar Tokens
        </button>
        
        <button
          onClick={checkAllSources}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
        >
          📋 Verificar Todas as Fontes
        </button>
      </div>

      {debugOutput && (
        <div className="bg-gray-800 p-2 rounded text-xs max-h-40 overflow-y-auto">
          <h4 className="font-semibold mb-1">Debug Output:</h4>
          <pre className="whitespace-pre-wrap">{debugOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default TokenDebugger;