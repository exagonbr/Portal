'use client';

import React from 'react';
import { 
  PermissionGuard, 
  SystemAdminOnly, 
  InstitutionManagerOnly, 
  CoordinatorOnly, 
  TeacherOnly, 
  StudentOnly, 
  GuardianOnly,
  AdminRolesOnly,
  EducationalRolesOnly,
  usePermissionGuard 
} from '@/components/auth/PermissionGuard';
import { useMenuPermissions, usePermissionCheck } from '@/hooks/useMenuPermissions';
import { UserRole } from '@/types/roles';

/**
 * Componente de exemplo demonstrando como usar os guards de permissão
 */
export function PermissionExamples() {
  const { userRole } = useMenuPermissions();
  const permissions = usePermissionCheck();
  const { canAccess, isSystemAdmin, isTeacher } = usePermissionGuard();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Exemplos de Controle de Permissões</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
        <p><strong>Role atual:</strong> {userRole}</p>
        <p><strong>É System Admin:</strong> {isSystemAdmin ? 'Sim' : 'Não'}</p>
        <p><strong>É Professor:</strong> {isTeacher ? 'Sim' : 'Não'}</p>
      </div>

      {/* Exemplo 1: Guards por Role */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">1. Guards por Role Específica</h2>
        
        <SystemAdminOnly>
          <div className="bg-red-100 p-4 rounded border-l-4 border-red-500">
            <h3 className="font-semibold text-red-800">Área do System Admin</h3>
            <p className="text-red-700">Este conteúdo só é visível para System Admins</p>
          </div>
        </SystemAdminOnly>

        <InstitutionManagerOnly>
          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-800">Área do Gestor Institucional</h3>
            <p className="text-blue-700">Este conteúdo só é visível para Gestores Institucionais</p>
          </div>
        </InstitutionManagerOnly>

        <TeacherOnly>
          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <h3 className="font-semibold text-green-800">Área do Professor</h3>
            <p className="text-green-700">Este conteúdo só é visível para Professores</p>
          </div>
        </TeacherOnly>

        <StudentOnly>
          <div className="bg-purple-100 p-4 rounded border-l-4 border-purple-500">
            <h3 className="font-semibold text-purple-800">Área do Estudante</h3>
            <p className="text-purple-700">Este conteúdo só é visível para Estudantes</p>
          </div>
        </StudentOnly>
      </div>

      {/* Exemplo 2: Guards por Grupos de Roles */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">2. Guards por Grupos de Roles</h2>
        
        <AdminRolesOnly>
          <div className="bg-orange-100 p-4 rounded border-l-4 border-orange-500">
            <h3 className="font-semibold text-orange-800">Área Administrativa</h3>
            <p className="text-orange-700">Visível para System Admin, Institution Manager e Coordinator</p>
          </div>
        </AdminRolesOnly>

        <EducationalRolesOnly>
          <div className="bg-teal-100 p-4 rounded border-l-4 border-teal-500">
            <h3 className="font-semibold text-teal-800">Área Educacional</h3>
            <p className="text-teal-700">Visível para Professores e Estudantes</p>
          </div>
        </EducationalRolesOnly>
      </div>

      {/* Exemplo 3: Guards por Permissões Específicas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">3. Guards por Permissões Específicas</h2>
        
        <PermissionGuard permission="canManageSystem">
          <div className="bg-red-100 p-4 rounded border-l-4 border-red-500">
            <h3 className="font-semibold text-red-800">Gestão do Sistema</h3>
            <p className="text-red-700">Visível apenas para quem pode gerenciar o sistema</p>
          </div>
        </PermissionGuard>

        <PermissionGuard permission="canManageGrades">
          <div className="bg-blue-100 p-4 rounded border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-800">Gestão de Notas</h3>
            <p className="text-blue-700">Visível apenas para quem pode gerenciar notas</p>
          </div>
        </PermissionGuard>

        <PermissionGuard permission="canViewOwnGrades">
          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <h3 className="font-semibold text-green-800">Visualizar Próprias Notas</h3>
            <p className="text-green-700">Visível para quem pode ver suas próprias notas</p>
          </div>
        </PermissionGuard>
      </div>

      {/* Exemplo 4: Guards com Múltiplas Permissões */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">4. Guards com Múltiplas Permissões</h2>
        
        <PermissionGuard 
          permissions={['canManageGrades', 'canManageAttendance']} 
          requireAll={false}
        >
          <div className="bg-yellow-100 p-4 rounded border-l-4 border-yellow-500">
            <h3 className="font-semibold text-yellow-800">Gestão Acadêmica (Qualquer)</h3>
            <p className="text-yellow-700">Visível para quem pode gerenciar notas OU frequência</p>
          </div>
        </PermissionGuard>

        <PermissionGuard 
          permissions={['canManageGrades', 'canManageAttendance']} 
          requireAll={true}
        >
          <div className="bg-indigo-100 p-4 rounded border-l-4 border-indigo-500">
            <h3 className="font-semibold text-indigo-800">Gestão Acadêmica Completa (Todas)</h3>
            <p className="text-indigo-700">Visível para quem pode gerenciar notas E frequência</p>
          </div>
        </PermissionGuard>
      </div>

      {/* Exemplo 5: Guards com Fallback */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">5. Guards com Conteúdo Alternativo</h2>
        
        <PermissionGuard 
          permission="canManageSystem"
          showFallback={true}
          fallback={
            <div className="bg-gray-100 p-4 rounded border-l-4 border-gray-500">
              <h3 className="font-semibold text-gray-800">Acesso Restrito</h3>
              <p className="text-gray-700">Você não tem permissão para gerenciar o sistema</p>
            </div>
          }
        >
          <div className="bg-green-100 p-4 rounded border-l-4 border-green-500">
            <h3 className="font-semibold text-green-800">Painel de Administração</h3>
            <p className="text-green-700">Bem-vindo ao painel de administração do sistema!</p>
          </div>
        </PermissionGuard>
      </div>

      {/* Exemplo 6: Uso Programático */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">6. Verificações Programáticas</h2>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Permissões do Usuário Atual:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Gerenciar Sistema: {permissions.canManageSystem ? '✅' : '❌'}</div>
            <div>Gerenciar Notas: {permissions.canManageGrades ? '✅' : '❌'}</div>
            <div>Ver Próprias Notas: {permissions.canViewOwnGrades ? '✅' : '❌'}</div>
            <div>Gerenciar Frequência: {permissions.canManageAttendance ? '✅' : '❌'}</div>
            <div>Comunicar com Estudantes: {permissions.canCommunicateWithStudents ? '✅' : '❌'}</div>
            <div>Ver Relatórios: {permissions.canViewPortalReports ? '✅' : '❌'}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Verificações Condicionais:</h3>
          <div className="space-y-2 text-sm">
            {canAccess(undefined, undefined, [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER]) && (
              <p>✅ Você tem acesso administrativo</p>
            )}
            {canAccess('canManageGrades') && (
              <p>✅ Você pode gerenciar notas</p>
            )}
            {canAccess(undefined, ['canManageGrades', 'canManageAttendance'], undefined, false) && (
              <p>✅ Você pode gerenciar aspectos acadêmicos</p>
            )}
            {!canAccess('canManageSystem') && (
              <p>❌ Você não pode gerenciar o sistema</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Exemplo de menu dinâmico baseado em permissões
 */
export function DynamicMenuExample() {
  const { filterMenuItems, userRole } = useMenuPermissions();

  const menuItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/admin/users', icon: 'people', label: 'Gerenciar Usuários', permission: 'canManageGlobalUsers' as const },
    { href: '/admin/system', icon: 'settings', label: 'Configurações do Sistema', permission: 'canManageSystem' as const },
    { href: '/teacher/grades', icon: 'grade', label: 'Gerenciar Notas', permission: 'canManageGrades' as const },
    { href: '/student/grades', icon: 'school', label: 'Minhas Notas', permission: 'canViewOwnGrades' as const },
    { href: '/reports', icon: 'analytics', label: 'Relatórios', permission: 'canViewPortalReports' as const },
  ];

  const filteredItems = filterMenuItems(menuItems);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Menu Dinâmico para {userRole}</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Itens de Menu Disponíveis:</h3>
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.href} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <span className="material-symbols-outlined text-gray-600">{item.icon}</span>
              <span>{item.label}</span>
              {item.permission && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.permission}
                </span>
              )}
            </div>
          ))}
        </div>
        {filteredItems.length === 0 && (
          <p className="text-gray-500 italic">Nenhum item de menu disponível para sua role.</p>
        )}
      </div>
    </div>
  );
}