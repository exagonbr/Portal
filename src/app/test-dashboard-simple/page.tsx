'use client';

import React from 'react';

export default function TestDashboardSimple() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Portal Educacional Sabercon</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JC</span>
                </div>
                <span className="text-sm text-gray-700">Julia Costa</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">JC</span>
              </div>
              <div>
                <p className="text-white font-medium">Julia Costa</p>
                <p className="text-gray-400 text-sm">Aluno</p>
              </div>
            </div>

            <nav className="space-y-2">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-3">Principal</div>
              <a href="#" className="flex items-center space-x-3 text-white bg-blue-600 px-3 py-2 rounded-md">
                <span>📊</span>
                <span>Painel Principal</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">
                <span>💬</span>
                <span>Mensagens</span>
              </a>

              <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 mt-6">Área Acadêmica</div>
              <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">
                <span>📚</span>
                <span>Meus Cursos</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">
                <span>📝</span>
                <span>Atividades</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">
                <span>🎥</span>
                <span>Aulas ao Vivo</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">
                <span>📖</span>
                <span>Aulas</span>
              </a>
              <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md">
                <span>💭</span>
                <span>Fórum</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Dashboard do Estudante - Teste Simples
            </h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Média Geral</h3>
                <p className="text-3xl font-bold text-blue-600">8.5</p>
                <p className="text-sm text-gray-500">de 10.0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tarefas</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-500">3 pendentes</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Frequência</h3>
                <p className="text-3xl font-bold text-purple-600">95%</p>
                <p className="text-sm text-gray-500">de presença</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ranking</h3>
                <p className="text-3xl font-bold text-orange-600">5º</p>
                <p className="text-sm text-gray-500">na turma</p>
              </div>
            </div>
            
            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximas Tarefas</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">Exercícios de Matemática</h3>
                      <p className="text-sm text-gray-500">Vence em 2 dias</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pendente</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">Redação sobre Meio Ambiente</h3>
                      <p className="text-sm text-gray-500">Vence hoje</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Enviada</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">Projeto de Ciências</h3>
                      <p className="text-sm text-gray-500">Vence em 5 dias</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Concluída</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas Recentes</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">Matemática - Prova Mensal</h3>
                      <p className="text-sm text-gray-500">25/01/2025</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">8.5</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">Português - Trabalho em Grupo</h3>
                      <p className="text-sm text-gray-500">23/01/2025</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">9.0</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">História - Seminário</h3>
                      <p className="text-sm text-gray-500">20/01/2025</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600">7.8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Content */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progresso dos Cursos</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Matemática</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Português</span>
                    <span className="text-sm text-gray-500">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">História</span>
                    <span className="text-sm text-gray-500">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}