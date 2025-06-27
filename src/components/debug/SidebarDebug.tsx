'use client'

import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/roles'
import { getSystemAdminMenuItems } from '@/components/admin/SystemAdminMenu'

export default function SidebarDebug() {
  const { user } = useAuth()
  
  if (!user) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
        <strong>Debug:</strong> Usuário não autenticado
      </div>
    )
  }

  const userRole = user.role as UserRole
  const isSystemAdmin = userRole === UserRole.SYSTEM_ADMIN
  
  let adminMenu: any[] = []
  let gestaoConteudo: any = null
  let adminCollections: any = null
  
  if (isSystemAdmin) {
    try {
      adminMenu = getSystemAdminMenuItems()
      gestaoConteudo = adminMenu.find(section => section.section === 'Gestão de Conteúdo')
      if (gestaoConteudo) {
        adminCollections = gestaoConteudo.items.find(item => item.href === '/portal/collections/admin')
      }
    } catch (error) {
      console.error('Erro ao carregar menu:', error)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded max-w-md text-xs">
      <strong>Debug Sidebar:</strong>
      <div className="mt-2 space-y-1">
        <div><strong>Usuário:</strong> {user.name}</div>
        <div><strong>Role:</strong> {userRole}</div>
        <div><strong>É SYSTEM_ADMIN:</strong> {isSystemAdmin ? 'SIM' : 'NÃO'}</div>
        <div><strong>Menu carregado:</strong> {adminMenu.length} seções</div>
        <div><strong>Seção Gestão de Conteúdo:</strong> {gestaoConteudo ? 'ENCONTRADA' : 'NÃO ENCONTRADA'}</div>
        {gestaoConteudo && (
          <div className="mt-2 p-2 bg-yellow-100 rounded">
            <div><strong>Itens na seção:</strong> {gestaoConteudo.items.length}</div>
            {gestaoConteudo.items.map((item: any, idx: number) => (
              <div key={idx} className="text-xs">
                {idx + 1}. {item.label} → {item.href}
              </div>
            ))}
          </div>
        )}
        <div><strong>Item Admin de Coleções:</strong> {adminCollections ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}</div>
        {adminCollections && (
          <div className="mt-2 p-2 bg-green-100 rounded">
            <div><strong>URL:</strong> {adminCollections.href}</div>
            <div><strong>Label:</strong> {adminCollections.label}</div>
            <div><strong>Permissão:</strong> {adminCollections.permission}</div>
          </div>
        )}
      </div>
    </div>
  )
} 