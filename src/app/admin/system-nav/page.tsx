'use client'

import React from 'react';
import Link from 'next/link';

export default function SystemNavigationPage() {
  const navigationSections = [
    {
      title: '🏠 Dashboards',
      description: 'Painéis principais do sistema por perfil de usuário',
      links: [
        { name: 'Dashboard Principal', url: '/dashboard', description: 'Redirecionamento automático baseado no perfil' },
        { name: 'Dashboard Admin', url: '/dashboard/admin', description: 'Painel administrativo completo' },
        { name: 'Dashboard Professor', url: '/dashboard/teacher', description: 'Painel para professores' },
        { name: 'Dashboard Aluno', url: '/dashboard/student', description: 'Painel para estudantes' },
        { name: 'Dashboard Coordenador', url: '/dashboard/coordinator', description: 'Painel de coordenação' },
        { name: 'Dashboard Responsável', url: '/dashboard/guardian', description: 'Painel para responsáveis' },
      ]
    },
    {
      title: '⚙️ Administração do Sistema',
      description: 'Funcionalidades administrativas e de configuração',
      links: [
        { name: 'Gestão de Usuários', url: '/admin/users', description: 'CRUD completo de usuários do sistema' },
        { name: 'Gerenciar Permissões', url: '/admin/roles', description: 'Funções, grupos e permissões contextuais' },
        { name: 'Gestão de Unidades', url: '/admin/units', description: 'Gerenciamento de unidades educacionais' },
        { name: 'Configurações do Sistema', url: '/admin/settings', description: 'Configurações gerais da aplicação' },
        { name: 'Monitoramento', url: '/admin/monitoring', description: 'Monitoramento de performance e recursos' },
        { name: 'Logs do Sistema', url: '/admin/logs', description: 'Visualização de logs e auditoria' },
        { name: 'Análise de Segurança', url: '/admin/security', description: 'Análise e configurações de segurança' },
        { name: 'Backup e Restauração', url: '/admin/backup', description: 'Gestão de backups do sistema' },
        { name: 'Auditoria', url: '/admin/audit', description: 'Auditoria de ações dos usuários' },
        { name: 'Sessões Ativas', url: '/admin/sessions', description: 'Gerenciamento de sessões dos usuários' },
        { name: 'Análise de Performance', url: '/admin/performance', description: 'Métricas de performance do sistema' },
        { name: 'Gestão de Conteúdo', url: '/admin/content', description: 'Gerenciamento de conteúdo da plataforma' },
      ]
    },
    {
      title: '🏛️ Gestão Institucional',
      description: 'Gerenciamento de instituições e estrutura organizacional',
      links: [
        { name: 'Gestão de Instituições', url: '/admin/institutions', description: 'CRUD de instituições educacionais' },
        { name: 'Gerenciar Instituição', url: '/institution/manage', description: 'Painel de gestão institucional' },
        { name: 'Escolas da Instituição', url: '/institution/schools', description: 'Gestão de escolas por instituição' },
        { name: 'Portal Institucional', url: '/portal', description: 'Portal público da instituição' },
      ]
    },
    {
      title: '📚 Gestão Acadêmica',
      description: 'Funcionalidades relacionadas ao ensino e aprendizagem',
      links: [
        { name: 'Gestão de Cursos', url: '/courses', description: 'CRUD completo de cursos' },
        { name: 'Gestão de Aulas', url: '/lessons', description: 'Criação e gerenciamento de aulas' },
        { name: 'Gestão de Atividades', url: '/assignments', description: 'Criação e acompanhamento de atividades' },
        { name: 'Aulas ao Vivo', url: '/live', description: 'Transmissões ao vivo e webinars' },
        { name: 'Coordenação Acadêmica', url: '/coordinator', description: 'Painel de coordenação acadêmica' },
        { name: 'Área do Professor', url: '/teacher', description: 'Ferramentas específicas para professores' },
      ]
    },
    {
      title: '👥 Comunicação e Colaboração',
      description: 'Ferramentas de comunicação e colaboração',
      links: [
        { name: 'Chat do Sistema', url: '/chat', description: 'Sistema de mensagens integrado' },
        { name: 'Fórum de Discussões', url: '/forum', description: 'Fóruns temáticos e discussões' },
        { name: 'Notificações', url: '/notifications', description: 'Central de notificações' },
        { name: 'Área do Responsável', url: '/guardian', description: 'Portal para pais e responsáveis' },
      ]
    },
    {
      title: '📊 Relatórios e Analytics',
      description: 'Relatórios, métricas e análises do sistema',
      links: [
        { name: 'Central de Relatórios', url: '/reports', description: 'Geração de relatórios diversos' },
        { name: 'Analytics do Sistema', url: '/admin/analytics', description: 'Análise de dados e métricas' },
      ]
    },
    {
      title: '🔧 Demonstrações e Testes',
      description: 'Páginas para teste e demonstração de funcionalidades',
      links: [
        { name: 'Demo de Modais', url: '/admin/demo-modals', description: 'Demonstração de todos os modais CRUD criados' },
        { name: 'Debug de Autenticação', url: '/debug-auth', description: 'Página para debug de autenticação' },
        { name: 'Modo Offline', url: '/offline', description: 'Funcionalidades offline do sistema' },
      ]
    },
    {
      title: '🔐 Autenticação e Segurança',
      description: 'Páginas relacionadas à autenticação e segurança',
      links: [
        { name: 'Login', url: '/login', description: 'Página de login do sistema' },
        { name: 'Registro', url: '/register', description: 'Página de cadastro de novos usuários' },
        { name: 'Página Inicial', url: '/', description: 'Landing page com formulário de login' },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-600 mb-2">Navegação do Sistema</h1>
        <p className="text-gray-600">
          Mapa completo de todas as páginas e funcionalidades disponíveis no sistema educacional.
          Use esta página para navegar rapidamente entre as diferentes seções.
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {navigationSections.reduce((total, section) => total + section.links.length, 0)}
          </div>
          <div className="text-sm text-blue-600">Total de Páginas</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{navigationSections.length}</div>
          <div className="text-sm text-green-600">Categorias</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">7</div>
          <div className="text-sm text-purple-600">Modais CRUD</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">6</div>
          <div className="text-sm text-orange-600">Dashboards</div>
        </div>
      </div>

      {/* Seções de Navegação */}
      <div className="space-y-8">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">{section.title}</h2>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.links.map((link, linkIndex) => (
                <Link 
                  key={linkIndex}
                  href={link.url}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="font-medium text-gray-600 mb-1">{link.name}</div>
                  <div className="text-sm text-gray-600">{link.description}</div>
                  <div className="text-xs text-blue-600 mt-2">{link.url}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Informações Adicionais */}
      <div className="mt-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <h3 className="text-2xl font-semibold mb-4">🚀 Status do Desenvolvimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">✅ Funcionalidades Implementadas</h4>
            <ul className="space-y-2 text-sm">
              <li>• Sistema de autenticação completo</li>
              <li>• Dashboards por perfil de usuário</li>
              <li>• Modais CRUD com tabs e wizards</li>
              <li>• Gestão de usuários e permissões</li>
              <li>• Interface responsiva e moderna</li>
              <li>• Sistema de navegação intuitivo</li>
              <li>• Validações e feedback visual</li>
              <li>• Internacionalização (português)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">🔧 Próximas Implementações</h4>
            <ul className="space-y-2 text-sm">
              <li>• Integração com APIs backend</li>
              <li>• Sistema de chat em tempo real</li>
              <li>• Geração avançada de relatórios</li>
              <li>• Notificações push</li>
              <li>• Upload de arquivos e mídias</li>
              <li>• Sistema de avaliações online</li>
              <li>• Calendário integrado</li>
              <li>• Analytics avançados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões de Ação Rápida */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link 
          href="/admin/demo-modals"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          🎭 Testar Modais CRUD
        </Link>
        <Link 
          href="/dashboard/admin"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🏠 Dashboard Admin
        </Link>
        <Link 
          href="/admin/users"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          👥 Gestão de Usuários
        </Link>
        <Link 
          href="/"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          🏡 Página Inicial
        </Link>
      </div>
    </div>
  );
} 