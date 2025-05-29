'use client';

import React from 'react';

export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Teste Simples
        </h1>
        <p className="text-gray-600">
          Esta é uma página de teste simples para verificar se o Next.js está funcionando corretamente.
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Página de teste funcionando corretamente!
          </p>
        </div>
      </div>
    </div>
  );
}