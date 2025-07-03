'use client';

import React from 'react';
import { useMenuPermissions, useMenuSectionPermissions } from '@/hooks/useMenuPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';

// Exemplo de itens de menu
const exampleMenuItems = [
  { href: '/admin/users', label: 'Gerenciar Usuários', permission: 'canManageGlobalUsers' },
  { href: '/admin/system', label: 'Sistema', permission: 'canManageSystem' },
  { href: '/teacher/classes', label: 'Minhas Turmas', permission: 'canManageClasses' },
  { href: '/student/courses', label: 'Meus Cursos', permission: 'canAccessLearningMaterials' },
  { href: '/profile', label: 'Perfil' }, // Sem permissão específica
];

// Exemplo de seções de menu
const exampleMenuSections = [
  {
    section: 'Administração',
    items: [
      { href: '/admin/users', label: 'Usuários', permission: 'canManageGlobalUsers' },
      { href: '/admin/institutions', label: 'Instituições', permission: 'canManageInstitutions' },
      { href: '/admin/security', label: 'Segurança', permission: 'canManageSecurityPolicies' },
    ]
  },
  {
    section: 'Ensino',
    items: [
      { href: '/teacher/classes', label: 'Turmas', permission: 'canManageClasses' },
      { href: '/teacher/grades', label: 'Notas', permission: 'canManageGrades' },
      { href: '/teacher/lessons', label: 'Aulas', permission: 'canManageLessonPlans' },
    ]
  },
  {
    section: 'Estudante',
    items: [
      { href: '/student/courses', label: 'Cursos', permission: 'canAccessLearningMaterials' },
      { href: '/student/assignments', label: 'Atividades', permission: 'canSubmitAssignments' },
      { href: '/student/grades', label: 'Notas', permission: 'canViewOwnGrades' },
    ]
  }
];

export function MenuPermissionExample() {
  const { user } = useAuth();

  // Exemplo 1: Hook básico de permissões de menu
  const {
    permissions,
    filteredMenuItems,
    isLoading,
    error,
    userRole,
    hasMenuPermission,
    checkPermission,
    revalidate,
    stats
  } = useMenuPermissions(exampleMenuItems, {
    autoRevalidate: true,
    onPermissionsUpdate: (permissions) => {
      console.log('🔐 Permissões atualizadas:', permissions);
    }
  });

  // Exemplo 2: Hook de seções de menu
  const {
    filteredSections,
    sectionStats
  } = useMenuSectionPermissions(exampleMenuSections, {
    autoRevalidate: true,
    onPermissionsUpdate: (permissions) => {
      console.log('🔐 Permissões de seções atualizadas:', permissions);
    }
  });

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Faça login para ver o exemplo de permissões de menu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          🔐 Exemplo: Sistema de Permissões de Menu (SEM CACHE)
        </h2>
        <p className="text-blue-700 mb-4">
          Este sistema utiliza o hook <code>useSmartCache</code> modificado que automaticamente 
          desabilita o cache para dados sensíveis de menu, roles e permissões, garantindo que 
          mudanças sejam refletidas imediatamente.
        </p>
      </div>

      {/* Informações do Usuário */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">👤 Usuário Atual</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Nome:</strong> {user.name}
          </div>
          <div>
            <strong>Role:</strong> {userRole}
          </div>
          <div>
            <strong>Loading:</strong> {isLoading ? '⏳ Sim' : '✅ Não'}
          </div>
          <div>
            <strong>Erro:</strong> {error ? '❌ Sim' : '✅ Não'}
          </div>
        </div>
      </div>

      {/* Exemplo 1: Menu Items Individuais */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Exemplo 1: Itens de Menu Individuais</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Estatísticas:</h4>
          <div className="grid grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded">
            <div><strong>Total:</strong> {stats.total}</div>
            <div><strong>Permitidos:</strong> {stats.allowed}</div>
            <div><strong>Negados:</strong> {stats.denied}</div>
            <div><strong>Percentual:</strong> {stats.percentage}%</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Todos os Itens:</h4>
          {exampleMenuItems.map((item) => {
            const hasAccess = hasMenuPermission(item.href);
            return (
              <div
                key={item.href}
                className={`flex items-center justify-between p-2 rounded ${
                  hasAccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div>
                  <span className="font-medium">{item.label}</span>
                  {item.permission && (
                    <span className="text-xs text-gray-500 ml-2">({item.permission})</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${hasAccess ? 'text-green-600' : 'text-red-600'}`}>
                  {hasAccess ? '✅ Permitido' : '❌ Negado'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Itens Filtrados (apenas permitidos):</h4>
          <div className="space-y-1">
            {filteredMenuItems.map((item) => (
              <div key={item.href} className="bg-green-50 border border-green-200 p-2 rounded">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-500 ml-2">({item.href})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exemplo 2: Seções de Menu */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 Exemplo 2: Seções de Menu</h3>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Estatísticas por Seção:</h4>
          <div className="space-y-2">
            {sectionStats.map((stat) => (
              <div key={stat.section} className="bg-gray-50 p-3 rounded">
                <div className="font-medium">{stat.section}</div>
                <div className="text-sm text-gray-600">
                  {stat.allowed}/{stat.total} itens permitidos
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Seções Filtradas:</h4>
          {filteredSections.map((section) => (
            <div key={section.section} className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-800 mb-2">{section.section}</h5>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div key={item.href} className="bg-green-50 border border-green-200 p-2 rounded text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-gray-500 ml-2">({item.href})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exemplo 3: Verificações Individuais */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Exemplo 3: Verificações Individuais</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span>Pode gerenciar sistema?</span>
            <span className={checkPermission('canManageSystem') ? 'text-green-600' : 'text-red-600'}>
              {checkPermission('canManageSystem') ? '✅ Sim' : '❌ Não'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span>Pode gerenciar usuários globais?</span>
            <span className={checkPermission('canManageGlobalUsers') ? 'text-green-600' : 'text-red-600'}>
              {checkPermission('canManageGlobalUsers') ? '✅ Sim' : '❌ Não'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span>Pode acessar materiais de aprendizado?</span>
            <span className={checkPermission('canAccessLearningMaterials') ? 'text-green-600' : 'text-red-600'}>
              {checkPermission('canAccessLearningMaterials') ? '✅ Sim' : '❌ Não'}
            </span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎛️ Controles</h3>
        <div className="space-x-4">
          <button
            onClick={() => revalidate()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Revalidar Permissões
          </button>
          <button
            onClick={() => {
              console.log('📊 Permissões atuais:', permissions);
              console.log('📈 Estatísticas:', stats);
              console.log('👤 Role do usuário:', userRole);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            📊 Log no Console
          </button>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚡ Informações Técnicas</h3>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• <strong>Cache Desabilitado:</strong> Dados de menu/permissões sempre buscam informações frescas</li>
          <li>• <strong>Revalidação Automática:</strong> Permissões são recalculadas quando a role do usuário muda</li>
          <li>• <strong>Detecção Inteligente:</strong> Sistema detecta automaticamente chaves sensíveis (menu, role, permission, etc.)</li>
          <li>• <strong>Performance:</strong> Apenas dados sensíveis não usam cache, outros dados continuam otimizados</li>
          <li>• <strong>Segurança:</strong> Mudanças de permissão são refletidas imediatamente na interface</li>
        </ul>
      </div>
    </div>
  );
}

export default MenuPermissionExample;