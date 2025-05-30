'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect, useCallback, memo } from 'react'
import { UserRole } from '@/types/auth'

interface NavItem {
  href: string
  icon: string
  label: string
  permissions?: string[] // Array of required permissions
}
interface NavSection {
  section: string
  items: NavItem[]
}

// Constants
const SIDEBAR_WIDTH = '16rem' // 256px - ligeiramente maior
const COLLAPSED_WIDTH = '4rem' // 64px - mais compacto
const MOBILE_BREAKPOINT = 768
// Memoized Components
const SidebarLogo = memo(({ isCollapsed }: { isCollapsed: boolean }) => (
  <Link href="/" className="overflow-hidden flex items-center justify-center py-1">
    {isCollapsed ? (
      <div className="w-8 h-8 bg-primary-light/20 rounded-lg flex items-center justify-center">
        <span className="text-xl font-bold text-white">S</span>
      </div>
    ) : (
      <div className="w-full flex justify-center">
        <Image
          src="/sabercon-logo-white.png"
          alt="Logo"
          width={160}
          height={35}
          sizes="(max-width: 768px) 140px, 160px"
          className="object-contain max-w-full h-auto"
          priority
        />
      </div>
    )}
  </Link>
));

// Função utilitária para mapear roles para labels em português
const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    'student': 'Aluno',
    'teacher': 'Professor',
    'manager': 'Gestor',
    'institution_manager': 'Gestor Institucional',
    'admin': 'Administrador',
    'system_admin': 'Administrador do Sistema',
    'academic_coordinator': 'Coordenador Acadêmico',
    'guardian': 'Responsável'
  };
  
  return roleLabels[role] || role;
};

const UserProfile = memo(({ user, isCollapsed }: { user: any, isCollapsed: boolean }) => (
  <div className="px-2 py-3 border-b border-white/10 flex-shrink-0">
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
      <div className="w-7 h-7 rounded-full bg-primary-light/30 flex items-center justify-center flex-shrink-0">
        <span className={`material-symbols-outlined text-primary ${isCollapsed ? 'text-[16px]' : 'text-[14px]'}`}>
          person
        </span>
      </div>
      {!isCollapsed && (
        <div className="overflow-hidden min-w-0 flex-1">
          <p className="text-xs font-semibold text-sidebar-text-active truncate leading-tight">{user?.name}</p>
          <span className="text-[10px] text-gray-400 leading-tight">
            {user?.role && getRoleLabel(user.role)}
          </span>
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
    className={`flex items-center gap-2 px-2 py-2 text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative
      ${isActive
        ? 'bg-sidebar-active text-white shadow-sm'
        : ''
      } ${isCollapsed ? 'justify-center' : ''}`}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
  >
    <span
      className={`material-symbols-outlined transition-transform duration-300 flex-shrink-0 ${isCollapsed ? 'text-[18px]' : 'text-[16px]'}`}
      aria-hidden="true"
    >
      {item.icon}
    </span>
    
    {!isCollapsed && (
      <span className="text-xs font-medium truncate leading-tight">{item.label}</span>
    )}
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div
        className="absolute left-full ml-2 px-2 py-1 bg-primary-dark text-sidebar-text-active text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg font-medium"
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
  <div className="mb-3">
    {!isCollapsed && (
      <p className="px-2 py-1 text-[10px] font-bold text-sidebar-text uppercase tracking-wider opacity-75">
        {section}
      </p>
    )}
    <div className="space-y-0.5">
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
    className={`flex items-center gap-2 px-2 py-2 rounded-md text-sidebar-text hover:bg-error/10 hover:text-error transition-all duration-300 group relative w-full mx-1 text-xs font-medium
      ${isCollapsed ? 'justify-center' : ''}`}
    aria-label="Sair da Plataforma"
  >
    <span
      className={`material-symbols-outlined group-hover:animate-pulse transition-transform duration-300 flex-shrink-0 ${isCollapsed ? 'text-[18px]' : 'text-[16px]'}`}
      aria-hidden="true"
    >
      logout
    </span>
    
    {!isCollapsed && <span className="text-xs font-medium leading-tight">Sair da Plataforma</span>}
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && (
      <div
        className="absolute left-full ml-2 px-2 py-1 bg-primary-dark text-sidebar-text-active text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg font-medium"
        role="tooltip"
      >
        Sair da Plataforma
      </div>
    )}
  </button>
));

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout, hasPermission, hasAllPermissions } = useAuth()
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
    // Map roles to dashboard routes
    const dashboardRoute = {
      'aluno': '/dashboard/student',
      'professor': '/dashboard/teacher',
      'gestor': '/dashboard/manager',
      'administrador': '/dashboard/admin',
      'coordenador acadêmico': '/dashboard/coordinator',
      'responsável': '/dashboard/guardian',
      // Fallback para roles em inglês (compatibilidade)
      'student': '/dashboard/student',
      'teacher': '/dashboard/teacher',
      'manager': '/dashboard/manager',
      'admin': '/dashboard/admin',
      'system_admin': '/dashboard/admin',
      'institution_manager': '/dashboard/manager',
      'academic_coordinator': '/dashboard/coordinator',
      'guardian': '/dashboard/guardian',
    }[user?.role || 'student'] || '/dashboard/'

    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          {
            href: dashboardRoute,
            icon: 'dashboard',
            label: 'Painel Principal',
            permissions: [] // Sem permissões específicas - todos podem ver o dashboard
          },
          ...(hasPermission('students.communicate') || hasPermission('teachers.message')
            ? [{
                href: '/chat',
                icon: 'chat',
                label: 'Mensagens',
                permissions: ['students.communicate', 'teachers.message']
              }]
            : []
          ),
        ]
      }
    ];

    let roleSpecificItems: NavSection[] = [];

    if (hasAllPermissions(['schedule.view.own', 'materials.access', 'assignments.submit'])) {
      roleSpecificItems = [
        {
          section: 'Área Acadêmica',
          items: [
            {
              href: '/courses',
              icon: 'school',
              label: 'Meus Cursos',
              permissions: ['materials.access']
            },
            {
              href: '/assignments',
              icon: 'assignment',
              label: 'Atividades',
              permissions: ['assignments.submit']
            },
            {
              href: '/live',
              icon: 'video_camera_front',
              label: 'Aulas ao Vivo',
              permissions: ['schedule.view.own']
            },
            {
              href: '/lessons',
              icon: 'school',
              label: 'Aulas',
              permissions: ['materials.access']
            },
            {
              href: '/forum/student/assignments',
              icon: 'forum',
              label: 'Fórum',
              permissions: ['forum.access']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Portais',
          items: [
            {
              href: '/portal/books',
              icon: 'auto_stories',
              label: 'Portal de Literatura',
              permissions: ['materials.access']
            },
            {
              href: '/portal/student',
              icon: 'person_outline',
              label: 'Portal do Aluno',
              permissions: ['student.portal.access']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }

    if (hasAllPermissions(['attendance.manage', 'grades.manage', 'lessons.manage'])) {
      roleSpecificItems = [
        {
          section: 'Área do Professor',
          items: [
            {
              href: '/courses/manage',
              icon: 'school',
              label: 'Gestão de Cursos',
              permissions: ['courses.manage']
            },
            {
              href: '/assignments/manage',
              icon: 'assignment',
              label: 'Gestão de Atividades',
              permissions: ['assignments.manage']
            },
            {
              href: '/live/manage',
              icon: 'video_camera_front',
              label: 'Gestão de Aulas ao Vivo',
              permissions: ['live.manage']
            },
            {
              href: '/lessons/manage',
              icon: 'menu_book',
              label: 'Gestão de Aulas',
              permissions: ['lessons.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Gestão da Turma',
          items: [
            {
              href: '/teacher/students',
              icon: 'group',
              label: 'Alunos',
              permissions: ['students.view']
            },
            {
              href: '/teacher/grades',
              icon: 'grade',
              label: 'Avaliações',
              permissions: ['grades.manage']
            },
            {
              href: '/reports/teacher',
              icon: 'analytics',
              label: 'Relatórios',
              permissions: ['reports.view.own']
            },
            {
              href: '/forum/teacher/announcements',
              icon: 'forum',
              label: 'Fórum',
              permissions: ['forum.moderate']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Portais',
          items: [
            {
              href: '/portal/videos',
              icon: 'play_circle',
              label: 'Portal de Vídeos',
              permissions: ['videos.access']
            },
            {
              href: '/portal/books',
              icon: 'auto_stories',
              label: 'Portal de Literatura',
              permissions: ['books.access']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }

    if (hasAllPermissions(['users.manage.institution', 'classes.manage', 'analytics.view.institution'])) {
      roleSpecificItems = [
        {
          section: 'Gestão Institucional',
          items: [
            {
              href: '/institution/courses',
              icon: 'school',
              label: 'Gestão de Cursos',
              permissions: ['courses.manage.institution']
            },
            {
              href: '/institution/teachers',
              icon: 'groups',
              label: 'Gestão de Professores',
              permissions: ['users.manage.institution']
            },
            {
              href: '/institution/students',
              icon: 'group',
              label: 'Gestão de Alunos',
              permissions: ['users.manage.institution']
            },
            {
              href: '/institution/classes',
              icon: 'class',
              label: 'Gestão de Turmas',
              permissions: ['classes.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Relatórios',
          items: [
            {
              href: '/reports/academic',
              icon: 'analytics',
              label: 'Relatórios Acadêmicos',
              permissions: ['analytics.view.institution']
            },
            {
              href: '/reports/performance',
              icon: 'monitoring',
              label: 'Desempenho',
              permissions: ['analytics.view.institution']
            },
            {
              href: '/reports/attendance',
              icon: 'fact_check',
              label: 'Frequência',
              permissions: ['attendance.view.institution']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }
// Itens para administradores
if (hasPermission('admin.access')) {
roleSpecificItems = [
  {
    section: 'Administração',
    items: [
      {
        href: '/admin/users',
        icon: 'manage_accounts',
        label: 'Gestão de Usuários',
        permissions: ['users.manage']
      },
      {
        href: '/admin/roles',
        icon: 'admin_panel_settings',
        label: 'Gestão de Permissões',
        permissions: ['roles.manage']
      },
      {
        href: '/admin/institutions',
        icon: 'business',
        label: 'Gestão de Instituições',
        permissions: ['institutions.manage']
      },
      {
        href: '/admin/units',
        icon: 'business',
        label: 'Gestão de Unidades',
        permissions: ['units.manage']
      },
    ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
  },
  {
    section: 'Gestão de Conteúdo',
    items: [
      {
        href: '/admin/content/library',
        icon: 'library_books',
        label: 'Acervo Digital',
        permissions: ['content.manage']
      },
      {
        href: '/admin/content/search',
        icon: 'manage_search',
        label: 'Arquivos',
        permissions: ['content.manage']
      },
    ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
  },
  {
    section: 'Relatórios',
    items: [
      {
        href: '/portal/reports',
        icon: 'analytics',
        label: 'Portal de Relatórios',
        permissions: ['reports.access.all']
      },
    ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
  },
  {
    section: 'Monitoramento',
    items: [
      {
        href: '/admin/settings',
        icon: 'settings',
        label: 'Configurações do Sistema',
        permissions: ['settings.manage']
      },
      {
        href: '/admin/analytics',
        icon: 'monitoring',
        label: 'Análise de Dados',
        permissions: ['analytics.view.all']
      },
      {
        href: '/admin/logs',
        icon: 'terminal',
        label: 'Registros do Sistema',
        permissions: ['logs.view']
      },
      {
        href: '/admin/performance',
        icon: 'speed',
        label: 'Desempenho',
        permissions: ['performance.view']
      },
    ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
  },
];
}
    

    if (hasAllPermissions(['system.manage', 'security.manage', 'analytics.view.system'])) {
      roleSpecificItems = [
        {
          section: 'Administração do Sistema',
          items: [
            {
              href: '/admin/users',
              icon: 'manage_accounts',
              label: 'Gestão de Usuários',
              permissions: ['users.manage.all']
            },
            {
              href: '/admin/roles',
              icon: 'admin_panel_settings',
              label: 'Gestão de Permissões',
              permissions: ['roles.manage']
            },
            {
              href: '/admin/institutions',
              icon: 'business',
              label: 'Gestão de Instituições',
              permissions: ['institutions.manage']
            },
            {
              href: '/admin/system',
              icon: 'settings_applications',
              label: 'Configurações do Sistema',
              permissions: ['system.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Monitoramento',
          items: [
            {
              href: '/admin/monitoring',
              icon: 'monitoring',
              label: 'Monitoramento',
              permissions: ['system.monitor']
            },
            {
              href: '/admin/analytics',
              icon: 'analytics',
              label: 'Análise de Dados',
              permissions: ['analytics.view.system']
            },
            {
              href: '/admin/logs',
              icon: 'terminal',
              label: 'Logs do Sistema',
              permissions: ['logs.view.all']
            },
            {
              href: '/admin/performance',
              icon: 'speed',
              label: 'Performance',
              permissions: ['performance.view.all']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Segurança',
          items: [
            {
              href: '/admin/security',
              icon: 'security',
              label: 'Segurança',
              permissions: ['security.manage']
            },
            {
              href: '/admin/audit',
              icon: 'fact_check',
              label: 'Auditoria',
              permissions: ['audit.view']
            },
            {
              href: '/admin/backup',
              icon: 'backup',
              label: 'Backup',
              permissions: ['backup.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }

    if (hasAllPermissions(['schools.manage', 'users.manage.institution', 'analytics.view.institution'])) {
      roleSpecificItems = [
        {
          section: 'Gestão Institucional',
          items: [
            {
              href: '/institution/schools',
              icon: 'school',
              label: 'Escolas',
              permissions: ['schools.manage']
            },
            {
              href: '/institution/classes',
              icon: 'class',
              label: 'Turmas',
              permissions: ['classes.manage']
            },
            {
              href: '/institution/teachers',
              icon: 'groups',
              label: 'Professores',
              permissions: ['users.manage.institution']
            },
            {
              href: '/institution/students',
              icon: 'group',
              label: 'Alunos',
              permissions: ['users.manage.institution']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Acadêmico',
          items: [
            {
              href: '/institution/courses',
              icon: 'menu_book',
              label: 'Cursos',
              permissions: ['courses.manage.institution']
            },
            {
              href: '/institution/curriculum',
              icon: 'assignment',
              label: 'Currículo',
              permissions: ['curriculum.manage']
            },
            {
              href: '/institution/calendar',
              icon: 'calendar_month',
              label: 'Calendário',
              permissions: ['calendar.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Relatórios',
          items: [
            {
              href: '/reports/institutional',
              icon: 'analytics',
              label: 'Relatórios Institucionais',
              permissions: ['analytics.view.institution']
            },
            {
              href: '/reports/academic',
              icon: 'assessment',
              label: 'Desempenho Acadêmico',
              permissions: ['analytics.view.institution']
            },
            {
              href: '/reports/financial',
              icon: 'payments',
              label: 'Financeiro',
              permissions: ['financial.view']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }

    if (hasAllPermissions(['cycles.manage', 'curriculum.manage', 'teachers.monitor'])) {
      roleSpecificItems = [
        {
          section: 'Coordenação Acadêmica',
          items: [
            {
              href: '/coordinator/cycles',
              icon: 'school',
              label: 'Ciclos Educacionais',
              permissions: ['cycles.manage']
            },
            {
              href: '/coordinator/curriculum',
              icon: 'menu_book',
              label: 'Gestão Curricular',
              permissions: ['curriculum.manage']
            },
            {
              href: '/coordinator/teachers',
              icon: 'groups',
              label: 'Corpo Docente',
              permissions: ['teachers.monitor']
            },
            {
              href: '/coordinator/evaluations',
              icon: 'grade',
              label: 'Avaliações',
              permissions: ['evaluations.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Acompanhamento',
          items: [
            {
              href: '/coordinator/performance',
              icon: 'trending_up',
              label: 'Desempenho',
              permissions: ['performance.view.academic']
            },
            {
              href: '/coordinator/planning',
              icon: 'event_note',
              label: 'Planejamento',
              permissions: ['planning.manage']
            },
            {
              href: '/coordinator/meetings',
              icon: 'groups_2',
              label: 'Reuniões',
              permissions: ['meetings.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Qualidade',
          items: [
            {
              href: '/coordinator/indicators',
              icon: 'analytics',
              label: 'Indicadores',
              permissions: ['indicators.view']
            },
            {
              href: '/coordinator/reports',
              icon: 'assessment',
              label: 'Relatórios',
              permissions: ['reports.view.academic']
            },
            {
              href: '/coordinator/improvements',
              icon: 'tips_and_updates',
              label: 'Melhorias',
              permissions: ['improvements.manage']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }

    if (hasAllPermissions(['children.view.info', 'children.view.grades', 'children.view.attendance'])) {
      roleSpecificItems = [
        {
          section: 'Acompanhamento',
          items: [
            {
              href: '/guardian/children',
              icon: 'child_care',
              label: 'Meus Filhos',
              permissions: ['children.view.info']
            },
            {
              href: '/guardian/grades',
              icon: 'grade',
              label: 'Notas',
              permissions: ['children.view.grades']
            },
            {
              href: '/guardian/attendance',
              icon: 'fact_check',
              label: 'Frequência',
              permissions: ['children.view.attendance']
            },
            {
              href: '/guardian/activities',
              icon: 'assignment',
              label: 'Atividades',
              permissions: ['children.view.activities']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Comunicação',
          items: [
            {
              href: '/guardian/messages',
              icon: 'mail',
              label: 'Mensagens',
              permissions: ['guardian.communicate']
            },
            {
              href: '/guardian/meetings',
              icon: 'video_call',
              label: 'Reuniões',
              permissions: ['guardian.meetings.view']
            },
            {
              href: '/guardian/announcements',
              icon: 'campaign',
              label: 'Comunicados',
              permissions: ['guardian.announcements.view']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        },
        {
          section: 'Financeiro',
          items: [
            {
              href: '/guardian/payments',
              icon: 'payments',
              label: 'Pagamentos',
              permissions: ['guardian.financial.view']
            },
            {
              href: '/guardian/invoices',
              icon: 'receipt',
              label: 'Boletos',
              permissions: ['guardian.financial.view']
            },
            {
              href: '/guardian/history',
              icon: 'history',
              label: 'Histórico',
              permissions: ['guardian.financial.history']
            },
          ].filter(item => !item.permissions || hasAllPermissions(item.permissions))
        }
      ];
    }

    return [...commonItems, ...roleSpecificItems];
  }, [user?.role, hasPermission, hasAllPermissions]);

const navItems = getNavItems()
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-3 left-3 z-50 bg-sidebar-bg rounded-lg p-2.5 text-sidebar-text hover:bg-sidebar-hover transition-colors shadow-lg border border-white/10"
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar-menu"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden sidebar-mobile-backdrop"
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
        <aside className="bg-sidebar-bg text-sidebar-text h-full flex flex-col shadow-xl overflow-hidden border-r border-primary-dark/20">
          {/* Logo */}
          <div className="p-2 border-b border-white/10 relative flex-shrink-0">
            {/* Desktop Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 bg-sidebar-bg rounded-full p-1 hover:bg-sidebar-hover transition-colors z-50 items-center justify-center border border-white/10"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <span className="material-symbols-outlined text-sidebar-text-active text-[16px]" aria-hidden="true">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
            
            <SidebarLogo isCollapsed={isCollapsed} />
          </div>

          {/* User Info */}
          <UserProfile user={user} isCollapsed={isCollapsed} />

          {/* Navigation */}
          <nav className="flex-1 px-1 py-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-sidebar-hover scrollbar-track-transparent">
            <div className="space-y-1">
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
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-1 border-t border-white/10 flex-shrink-0">
            <LogoutButton isCollapsed={isCollapsed} onLogout={handleLogout} />
          </div>
        </aside>
      </div>
    </>
  )
}
