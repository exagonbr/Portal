'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'
import { UserRole, ROLE_LABELS } from '@/types/roles'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Get user role with fallback to STUDENT
  const userRole: UserRole = (user?.role || UserRole.STUDENT) as UserRole

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.log('Erro ao fazer logout:', error)
    }
  }

  const getNavItems = (): NavSection[] => {
    // Get dashboard route based on role
    const getDashboardRoute = (role: UserRole): string => {
      const dashboardMap = {
        [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
        [UserRole.INSTITUTION_MANAGER]: '/dashboard/institution-manager',
        [UserRole.COORDINATOR]: '/dashboard/coordinator',
        [UserRole.TEACHER]: '/dashboard/teacher',
        [UserRole.STUDENT]: '/dashboard/student',
        [UserRole.GUARDIAN]: '/dashboard/guardian',
      }
      return dashboardMap[role] || '/dashboard'
    }

    const dashboardRoute = getDashboardRoute(userRole)

    // Common items for all users
    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          {
            href: dashboardRoute,
            icon: 'dashboard',
            label: 'Painel Principal',
          },
          {
            href: '/notifications',
            icon: 'notifications',
            label: 'Notificações',
          },
        ],
      },
    ]

    // Role-specific sections
    let roleSpecificItems: NavSection[] = []

    switch (userRole) {
      case UserRole.SYSTEM_ADMIN:
        roleSpecificItems = [
          {
            section: 'Administração',
            items: [
              {
                href: '/admin/users',
                icon: 'group',
                label: 'Usuários',
              },
              {
                href: '/admin/institutions',
                icon: 'business',
                label: 'Instituições',
              },
              {
                href: '/admin/system',
                icon: 'settings',
                label: 'Sistema',
              },
            ],
          },
        ]
        break

      case UserRole.INSTITUTION_MANAGER:
        roleSpecificItems = [
          {
            section: 'Gestão',
            items: [
              {
                href: '/institution/schools',
                icon: 'school',
                label: 'Escolas',
              },
              {
                href: '/institution/classes',
                icon: 'class',
                label: 'Turmas',
              },
              {
                href: '/institution/teachers',
                icon: 'groups',
                label: 'Professores',
              },
              {
                href: '/institution/students',
                icon: 'group',
                label: 'Alunos',
              },
            ],
          },
        ]
        break

      case UserRole.COORDINATOR:
        roleSpecificItems = [
          {
            section: 'Coordenação',
            items: [
              {
                href: '/coordinator/curriculum',
                icon: 'menu_book',
                label: 'Currículo',
              },
              {
                href: '/coordinator/teachers',
                icon: 'groups',
                label: 'Professores',
              },
              {
                href: '/coordinator/reports',
                icon: 'assessment',
                label: 'Relatórios',
              },
            ],
          },
        ]
        break

      case UserRole.TEACHER:
        roleSpecificItems = [
          {
            section: 'Ensino',
            items: [
              {
                href: '/teacher/classes',
                icon: 'class',
                label: 'Turmas',
              },
              {
                href: '/teacher/students',
                icon: 'group',
                label: 'Alunos',
              },
              {
                href: '/teacher/grades',
                icon: 'grade',
                label: 'Notas',
              },
            ],
          },
        ]
        break

      case UserRole.STUDENT:
        roleSpecificItems = [
          {
            section: 'Estudos',
            items: [
              {
                href: '/student/courses',
                icon: 'school',
                label: 'Cursos',
              },
              {
                href: '/student/assignments',
                icon: 'assignment',
                label: 'Atividades',
              },
              {
                href: '/student/grades',
                icon: 'grade',
                label: 'Notas',
              },
            ],
          },
        ]
        break

      case UserRole.GUARDIAN:
        roleSpecificItems = [
          {
            section: 'Acompanhamento',
            items: [
              {
                href: '/guardian/children',
                icon: 'child_care',
                label: 'Filhos',
              },
              {
                href: '/guardian/grades',
                icon: 'grade',
                label: 'Notas',
              },
              {
                href: '/guardian/attendance',
                icon: 'fact_check',
                label: 'Frequência',
              },
            ],
          },
        ]
        break

      default:
        roleSpecificItems = []
    }

    return [...commonItems, ...roleSpecificItems]
  }

  const navItems = getNavItems()

  // Verificações de segurança
  if (!theme || !theme.colors || !theme.colors.sidebar) {
    return (
      <div className="w-64 bg-gray-100 p-4 text-gray-800 border-r border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <p className="mt-4 text-sm">Carregando tema do sidebar...</p>
      </div>
    )
  }

  return (
    <aside
      className="w-64 flex flex-col h-screen shadow-xl"
      style={{
        backgroundColor: theme.colors.sidebar.bg,
        borderRight: `1px solid ${theme.colors.sidebar.border}`,
        color: theme.colors.sidebar.text
      }}
    >
      {/* Logo */}
      <div
        className="border-b flex-shrink-0 p-4 h-20"
        style={{ borderColor: theme.colors.sidebar.border }}
      >
        <Link href="/" className="flex items-center justify-center group h-full">
          <div className="table transition-transform duration-200">
            <Image
              src="/sabercon-logo-white.png"
              alt="Logo"
              width={200}
              height={80}
              className="object-contain group-hover:brightness-110 transition-all duration-200"
              priority
            />
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div
        className="flex-shrink-0 h-20 px-3 border-b py-3"
        style={{ borderColor: theme.colors.sidebar.border }}
      >
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: theme.colors.primary.light || theme.colors.primary.DEFAULT + '40',
              color: theme.colors.sidebar.textActive || '#ffffff'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p
              className="font-semibold truncate leading-tight text-[11px]"
              style={{ color: theme.colors.sidebar.textActive }}
            >
              {user?.name}
            </p>
            <span
              className="leading-tight opacity-80 text-[9px]"
              style={{ color: theme.colors.sidebar.text }}
            >
              {user?.role && ROLE_LABELS[user.role as UserRole]}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1 overflow-y-auto overflow-x-hidden py-2">
        <div className="space-y-1 pb-2">
          {navItems.map((section, idx) => (
            <div key={idx} className="mb-2">
              <p className="px-2 text-[7px] font-bold text-sidebar-text uppercase tracking-wider opacity-70 py-0.5 mb-1">
                {section.section}
              </p>
              <div className="space-y-0">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative w-full text-left py-1.5 min-h-[32px]`}
                      style={{
                        backgroundColor: isActive ? theme.colors.sidebar.active : 'transparent',
                        color: isActive ? theme.colors.sidebar.textActive : theme.colors.sidebar.text
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = theme.colors.sidebar.hover
                          e.currentTarget.style.color = theme.colors.sidebar.textActive
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = theme.colors.sidebar.text
                        }
                      }}
                    >
                      <span className="material-symbols-outlined text-[14px] flex-shrink-0">
                        {item.icon}
                      </span>
                      <span className="font-medium truncate leading-tight text-[11px]">
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t flex-shrink-0 p-2 h-14" style={{ borderColor: theme.colors.sidebar.border }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative w-full py-2 min-h-[36px]"
          style={{
            color: theme.colors.sidebar.text
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.status.error + '20'
            e.currentTarget.style.color = theme.colors.status.error
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = theme.colors.sidebar.text
          }}
        >
          <span className="material-symbols-outlined text-[16px] flex-shrink-0">
            logout
          </span>
          <span className="font-medium truncate leading-tight text-xs">
            Sair da Plataforma
          </span>
        </button>
      </div>
    </aside>
  )
}

export default DashboardSidebar
