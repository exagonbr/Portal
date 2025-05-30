'use client'

import React from 'react';
import Link from 'next/link';

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Cursos</h1>
          <p className="text-gray-600">
            Sistema completo para gerenciamento de cursos educacionais
          </p>
        </div>

        {/* Status de Desenvolvimento */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">🚧</span>
            <h2 className="text-xl font-semibold text-yellow-800">Em Desenvolvimento</h2>
          </div>
          <p className="text-yellow-700 mb-4">
            Esta página está sendo desenvolvida. Enquanto isso, você pode testar as funcionalidades 
            de CRUD de cursos através dos modais de demonstração.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/admin/demo-modals"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🎭 Testar Modais de Curso
            </Link>
            <Link 
              href="/dashboard/admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 Voltar ao Dashboard
            </Link>
          </div>
        </div>

        {/* Funcionalidades Planejadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Funcionalidades Planejadas</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Listagem completa de cursos</li>
              <li>• Filtros avançados por categoria, nível, status</li>
              <li>• Busca por nome, código ou professor</li>
              <li>• Visualização em cards ou tabela</li>
              <li>• Exportação de dados</li>
              <li>• Relatórios de desempenho</li>
              <li>• Gestão de matrículas</li>
              <li>• Calendário de aulas</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Modais Disponíveis</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <strong>CourseEditModal:</strong> Edição com 5 tabs</li>
              <li>• <strong>CourseAddModal:</strong> Wizard de criação</li>
              <li>• Informações gerais do curso</li>
              <li>• Conteúdo programático</li>
              <li>• Gestão de participantes</li>
              <li>• Sistema de avaliações</li>
              <li>• Configurações financeiras</li>
              <li>• Validações em tempo real</li>
            </ul>
          </div>
        </div>

        {/* Demonstração Visual */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-8 text-white">
          <h3 className="text-xl font-semibold mb-4">🎬 Demonstração Interativa</h3>
          <p className="mb-6">
            Experimente os modais de curso totalmente funcionais com dados de exemplo. 
            Teste todas as funcionalidades de criação e edição.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">📝 Criar Novo Curso</h4>
              <p className="text-sm mb-3">Wizard de 4 etapas para criação completa</p>
              <Link 
                href="/admin/demo-modals"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Testar Criação
              </Link>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">✏️ Editar Curso</h4>
              <p className="text-sm mb-3">Interface com 5 tabs para edição completa</p>
              <Link 
                href="/admin/demo-modals"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Testar Edição
              </Link>
            </div>
          </div>
        </div>

        {/* Links de Navegação */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/admin/system-nav"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🗺️ Mapa do Sistema
            </Link>
            <Link 
              href="/admin/users"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              👥 Gestão de Usuários
            </Link>
            <Link 
              href="/admin/roles"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              🔐 Gestão de Funções
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
