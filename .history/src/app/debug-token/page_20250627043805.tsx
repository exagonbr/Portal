'use client';

import React from 'react';
import TokenDebugger from '@/components/debug/TokenDebugger';

export default function DebugTokenPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Debug de Autenticação
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600">
              Esta página é para diagnosticar problemas de autenticação e tokens JWT.
              Use-a para verificar se seus tokens estão válidos e funcionando corretamente.
            </p>
          </div>

          <TokenDebugger />

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Instruções de Uso
            </h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• <strong>Token presente:</strong> Verifica se existe um token no localStorage/cookies</li>
              <li>• <strong>Token válido:</strong> Verifica se o token é um JWT válido e não expirado</li>
              <li>• <strong>Precisa refresh:</strong> Indica se o token expira em menos de 5 minutos</li>
              <li>• <strong>Teste da API:</strong> Testa se o token funciona com uma requisição real</li>
              <li>• <strong>Sincronizar Token:</strong> Força a sincronização do token com o apiClient</li>
              <li>• <strong>Limpar Tokens:</strong> Remove todos os tokens armazenados</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Voltar ao Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 