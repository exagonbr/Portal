'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

const SIDEBAR_WIDTH = '16rem' // 256px
const COLLAPSED_WIDTH = '4rem' // 64px

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
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

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const getNavItems = (): NavSection[] => {
    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          { href: `/dashboard/${user?.role || ''}`, icon: 'dashboard', label: 'Dashboard' },
          { href: '/chat', icon: 'chat', label: 'Chat' },
        ]
      }
    ]

    let roleSpecificItems: NavSection[] = []

    if (user?.role === 'student') {
      roleSpecificItems = [
        {
          section: 'Acadêmico',
          items: [
            { href: '/courses', icon: 'school', label: 'Meus Cursos' },
            { href: '/assignments', icon: 'assignment', label: 'Minhas Atividades' },
            { href: '/live', icon: 'video_camera_front', label: 'Aulas ao Vivo' },
            { href: '/lessons', icon: 'school', label: 'Minhas Aulas' },
          ]
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/literature', icon: 'auto_stories', label: 'Portal de Literatura' },
            { href: '/portal/student', icon: 'person_outline', label: 'Portal do Aluno' },
          ]
        }
      ]
    }

    if (user?.role === 'teacher') {
      roleSpecificItems = [
        {
          section: 'Ensino',
          items: [
            { href: '/courses/manage', icon: 'school', label: 'Gerenciar Cursos' },
            { href: '/assignments/manage', icon: 'assignment', label: 'Gerenciar Atividades' },
            { href: '/live/manage', icon: 'video_camera_front', label: 'Gerenciar Aulas ao Vivo' },
            { href: '/lessons/manage', icon: 'menu_book', label: 'Gerenciar Aulas' },
          ]
        },
        {
          section: 'Gestão',
          items: [
            { href: '/teacher/students', icon: 'group', label: 'Meus Alunos' },
            { href: '/teacher/grades', icon: 'grade', label: 'Notas' },
            { href: '/reports/teacher', icon: 'analytics', label: 'Relatórios' },
          ]
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/videos', icon: 'play_circle', label: 'Portal de Vídeos' },
            { href: '/portal/literature', icon: 'auto_stories', label: 'Portal de Literatura' },
            { href: '/portal/teacher', icon: 'person_outline', label: 'Portal do Professor' },
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
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/manager', icon: 'admin_panel_settings', label: 'Portal do Gestor' },
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
            { href: '/admin/settings', icon: 'settings', label: 'Configurações do Sistema' },
          ]
        },
        {
          section: 'Monitoramento',
          items: [
            { href: '/admin/analytics', icon: 'monitoring', label: 'Analytics' },
            { href: '/admin/logs', icon: 'terminal', label: 'Logs do Sistema' },
            { href: '/admin/performance', icon: 'speed', label: 'Performance' },
          ]
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/admin', icon: 'admin_panel_settings', label: 'Portal Admin' },
            { href: '/portal/reports', icon: 'analytics', label: 'Portal de Relatórios' },
          ]
        }
      ]
    }

    return [...commonItems, ...roleSpecificItems]
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0A1628] rounded-lg p-2 text-white hover:bg-blue-600/10 transition-colors"
      >
        <span className="material-symbols-outlined">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <div 
        className={`fixed md:sticky top-0 h-screen transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      >
        {/* Sidebar Content */}
        <aside className="bg-[#0A1628] text-white h-full flex flex-col">
          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:block absolute -right-3 top-16 bg-[#0A1628] rounded-full p-1.5 cursor-pointer hover:bg-blue-600/10 transition-colors z-50"
          >
            <span className="material-symbols-outlined text-white text-[20px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>

          {/* Logo */}
          <div className={`p-6 border-b border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
            <Link href="/" className="flex items-center justify-center">
              <div className={`relative ${isCollapsed ? 'w-8 h-8' : 'w-32 h-8'}`}>
                <Image
                  src="/sabercon-logo-white.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className={`px-6 py-4 border-b border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-blue-500">person</span>
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-medium text-white">{user?.name || 'Usuário'}</p>
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

          {/* Navigation */}
          <nav className={`flex-1 px-3 py-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
            {getNavItems().map((section, idx) => (
              <div key={idx} className="mb-6">
                {!isCollapsed && (
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group relative
                        ${pathname === item.href
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-blue-600/10 hover:text-white'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      onClick={() => window.innerWidth <= 768 && setIsMobileOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group relative
                ${isCollapsed ? 'justify-center px-2' : 'w-full'}`}
            >
              <span className="material-symbols-outlined text-[20px] group-hover:animate-pulse">logout</span>
              {!isCollapsed && <span className="text-sm font-medium">Sair da Plataforma</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Sair da Plataforma
                </div>
              )}
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
