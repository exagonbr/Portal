'use client';

import React from 'react';

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard de Teste - Funcionando!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Card 1</h2>
            <p className="text-gray-600">Este é um card de teste para verificar se o dashboard está renderizando corretamente.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Card 2</h2>
            <p className="text-gray-600">Se você está vendo este conteúdo, significa que o problema não está no CSS ou na estrutura básica.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Card 3</h2>
            <p className="text-gray-600">O problema provavelmente está na autenticação ou no componente RoleProtectedRoute.</p>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Informações de Debug</h3>
          <ul className="text-blue-800 space-y-1">
            <li>✅ CSS está carregando corretamente</li>
            <li>✅ Componentes React estão funcionando</li>
            <li>✅ Tailwind CSS está aplicado</li>
            <li>⚠️ Teste de autenticação necessário</li>
          </ul>
        </div>
      </div>
    </div>
  );
}