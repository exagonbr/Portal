'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect, useCallback, memo } from 'react'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

// Constants
const SIDEBAR_WIDTH = '17rem' // 272px
const COLLAPSED_WIDTH = '5rem' // 80px
// Memoized Components
const SidebarLogo = memo(({ isCollapsed }: { isCollapsed: boolean }) => (
  <Link href="/" className="flex items-center justify-center">
    {isCollapsed ? (
      <span className="text-2xl font-bold text-white">S</span>
    ) : (
      <div className="table">
        <Image
          src="/sabercon-logo-white.png"
          alt="Logo"
          width={250}
          height={100}
          className="object-contain"
          priority
        />
      </div>
    )}
  </Link>
));

const UserProfile = memo(({ user, isCollapsed }: { user: any, isCollapsed: boolean }) => (
  <div className="px-4 py-4 border-b border-white/10">
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
        <span className={`material-symbols-outlined text-blue-500 ${isCollapsed ? 'text-[24px]' : 'text-[20px]'}`}>
          person
        </span>
      </div>
      {!isCollapsed && (
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuário'}</p>
          <p className="text-xs text-gray-400">
            {user?.role === 'student' && 'Estudante'}
            {user?.role === 'teacher' && 'Professor'}
            {user?.role === 'manager' && 'Gestor'}
            {user?.role === 'admin' && 'Administrador'}
          </p>
        </div>
      )}
    </div>
  </div>
));

const NavItem = memo(({ item, isActive, isCollapsed, onClick }: { 
  item: NavItem, 
  isActive: boolean, 
  isCollapsed: boolean,
  onClick?: () => void
}) => (
  <Link
    href={item.href}
    className={`flex items-center ${!isCollapsed && 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-300 group relative
      ${isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-blue-600/10 hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
  >
    <span 
      className={`material-symbols-outlined transition-transform duration-300 ${isCollapsed ? 'text-[24px]' : 'text-[20px]'}`}
      aria-hidden="true"
    >
      {item.icon}
    </span>
    
    {!isCollapsed && (
      <span className="text-sm font-medium truncate">{item.label}</span>
    )}
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div 
        className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg"
        role="tooltip"
      >
        {item.label}
      </div>
    )}
  </Link>
));

const NavSection = memo(({ section, items, pathname, isCollapsed, onItemClick }: { 
  section: string, 
  items: NavItem[], 
  pathname: string,
  isCollapsed: boolean,
  onItemClick?: () => void
}) => (
  <div className="mb-4">
    {!isCollapsed && (
      <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {section}
      </p>
    )}
    <div className="space-y-1">
      {items.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          isActive={pathname === item.href}
          isCollapsed={isCollapsed}
          onClick={onItemClick}
        />
      ))}
    </div>
  </div>
));

const LogoutButton = memo(({ isCollapsed, onLogout }: { isCollapsed: boolean, onLogout: () => void }) => (
  <button
    onClick={onLogout}
    className={`flex items-center ${!isCollapsed && 'space-x-3'} px-3 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group relative w-full
      ${isCollapsed ? 'justify-center' : ''}`}
    aria-label="Sair da Plataforma"
  >
    <span 
      className={`material-symbols-outlined group-hover:animate-pulse transition-transform duration-300 ${isCollapsed ? 'text-[24px]' : 'text-[20px]'}`}
      aria-hidden="true"
    >
      logout
    </span>
    
    {!isCollapsed && <span className="text-sm font-medium">Sair da Plataforma</span>}
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div 
        className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg"
        role="tooltip"
      >
        Sair da Plataforma
      </div>
    )}
  </button>
));
const MOBILE_BREAKPOINT = 768

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }, [isMobileOpen, isCollapsed])

  const closeMobileSidebar = useCallback(() => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setIsMobileOpen(false)
    }
  }, [])

  const getNavItems = useCallback((): NavSection[] => {
    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          { href: `/dashboard/${user?.role || ''}`, icon: 'dashboard', label: 'Painel Principal' },
          ...(user?.role !== 'manager' && user?.role !== 'admin' ? [{ href: '/chat', icon: 'chat', label: 'Mensagens' }] : []),
        ]
      }
    ]

    let roleSpecificItems: NavSection[] = []

    if (user?.role === 'student') {
      roleSpecificItems = [
        {
          section: 'Área Acadêmica',
          items: [
            { href: '/courses', icon: 'school', label: 'Meus Cursos' },
            { href: '/assignments', icon: 'assignment', label: 'Atividades' },
            { href: '/live', icon: 'video_camera_front', label: 'Aulas ao Vivo' },
            { href: '/lessons', icon: 'school', label: 'Aulas' },
          ]
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/books', icon: 'auto_stories', label: 'Portal de Literatura' },
            { href: '/portal/student', icon: 'person_outline', label: 'Portal do Aluno' },
          ]
        }
      ]
    }

    if (user?.role === 'teacher') {
      roleSpecificItems = [
        {
          section: 'Área do Professor',
          items: [
            { href: '/courses/manage', icon: 'school', label: 'Gestão de Cursos' },
            { href: '/assignments/manage', icon: 'assignment', label: 'Gestão de Atividades' },
            { href: '/live/manage', icon: 'video_camera_front', label: 'Gestão de Aulas ao Vivo' },
            { href: '/lessons/manage', icon: 'menu_book', label: 'Gestão de Aulas' },
          ]
        },
        {
          section: 'Gestão da Turma',
          items: [
            { href: '/teacher/students', icon: 'group', label: 'Alunos' },
            { href: '/teacher/grades', icon: 'grade', label: 'Avaliações' },
            { href: '/reports/teacher', icon: 'analytics', label: 'Relatórios' },
          ]
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/videos', icon: 'play_circle', label: 'Portal de Vídeos' },
            { href: '/portal/books', icon: 'auto_stories', label: 'Portal de Literatura' },
          ]
        }
      ]
    }

    if (user?.role === 'manager') {
      roleSpecificItems = [
        {
          section: 'Gestão Institucional',
          items: [
            { href: '/institution/courses', icon: 'school', label: 'Gestão de Cursos' },
            { href: '/institution/teachers', icon: 'groups', label: 'Gestão de Professores' },
            { href: '/institution/students', icon: 'group', label: 'Gestão de Alunos' },
            { href: '/institution/classes', icon: 'class', label: 'Gestão de Turmas' },
          ]
        },
        {
          section: 'Relatórios',
          items: [
            { href: '/reports/academic', icon: 'analytics', label: 'Relatórios Acadêmicos' },
            { href: '/reports/performance', icon: 'monitoring', label: 'Desempenho' },
            { href: '/reports/attendance', icon: 'fact_check', label: 'Frequência' },
          ]
        }
      ]
    }

      if (user?.role === 'admin') {
      roleSpecificItems = [
        {
          section: 'Administração',
          items: [
            { href: '/admin/users', icon: 'manage_accounts', label: 'Gestão de Usuários' },
            { href: '/admin/roles', icon: 'admin_panel_settings', label: 'Gestão de Permissões' },
            { href: '/admin/institutions', icon: 'business', label: 'Gestão de Instituições' },
            { href: '/admin/units', icon: 'business', label: 'Gestão de Unidades' },
          ]
        },
        {
          section: 'Gestão de Conteúdo',
          items: [
            { href: '/admin/content/library', icon: 'library_books', label: 'Acervo Digital' },
            { href: '/admin/content/search', icon: 'manage_search', label: 'Arquivos' },
          ]
        },
        {
          section: 'Relatorios',
          items: [
            { href: '/portal/reports', icon: 'analytics', label: 'Portal de Relatórios' },
          ]
        },
        {
          section: 'Monitoramento',
          items: [
            { href: '/admin/settings', icon: 'settings', label: 'Configurações do Sistema' },
            { href: '/admin/analytics', icon: 'monitoring', label: 'Análise de Dados' },
            { href: '/admin/logs', icon: 'terminal', label: 'Registros do Sistema' },
            { href: '/admin/performance', icon: 'speed', label: 'Desempenho' },
          ]
        },
      ]
    }

    return [...commonItems, ...roleSpecificItems]
  }, [user?.role])

const navItems = getNavItems()
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0A1628] rounded-lg p-2 text-white hover:bg-blue-600/10 transition-colors"
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar-menu"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <div 
        id="sidebar-menu"
        className={`fixed md:sticky top-0 h-screen transition-all duration-300 ease-in-out z-40 overflow-hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Sidebar Content */}
        <aside className="bg-[#0A1628] text-white h-full flex flex-col overflow-hidden shadow-xl">
          {/* Logo */}
          <div className="p-4 border-b border-white/10 relative">
            {/* Desktop Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-[#0A1628] rounded-full p-1.5 hover:bg-blue-600/10 transition-colors z-50 items-center justify-center"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <span className="material-symbols-outlined text-white text-[20px]" aria-hidden="true">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
            
            <SidebarLogo isCollapsed={isCollapsed} />
          </div>

          {/* User Info */}
          <UserProfile user={user} isCollapsed={isCollapsed} />

          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {navItems.map((section, idx) => (
              <NavSection
                key={idx}
                section={section.section}
                items={section.items}
                pathname={pathname}
                isCollapsed={isCollapsed}
                onItemClick={closeMobileSidebar}
              />
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-2 border-t border-white/10">
            <LogoutButton isCollapsed={isCollapsed} onLogout={handleLogout} />
          </div>
        </aside>
      </div>
    </>
  )
}
