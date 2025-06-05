'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useCallback, memo } from 'react'
import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, hasPermission, getAccessibleRoutes } from '@/types/roles'

interface NavItem {
  href: string
  icon: string
  label: string
  permission?: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]
}

interface NavSection {
  section: string
  items: NavItem[]
}

// Constants
const SIDEBAR_WIDTH = '16rem'
const COLLAPSED_WIDTH = '4rem'
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
          <span className="text-[10px] text-sidebar-text leading-tight">
            {user?.role && ROLE_LABELS[user.role as UserRole]}
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

const NavSection = memo(({ section, items, pathname, isCollapsed, onItemClick, userRole }: { 
  section: string, 
  items: NavItem[], 
  pathname: string | null,
  isCollapsed: boolean,
  onItemClick?: () => void,
  userRole: UserRole
}) => {
  // Filter items based on user permissions
  const filteredItems = items.filter(item => {
    if (!item.permission) return true;
    return hasPermission(userRole, item.permission);
  });

  if (filteredItems.length === 0) return null;

  return (
    <div className="mb-3">
      {!isCollapsed && (
        <p className="px-2 py-1 text-[10px] font-bold text-sidebar-text uppercase tracking-wider opacity-75">
          {section}
        </p>
      )}
      <div className="space-y-0.5">
        {filteredItems.map((item) => (
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
  );
});

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

export default function StandardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Get user role with fallback to STUDENT
  const userRole: UserRole = (user?.role || 'STUDENT') as UserRole;

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
    // Get dashboard route based on role
    const getDashboardRoute = (role: UserRole): string => {
      const dashboardMap = {
        [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
        [UserRole.INSTITUTION_MANAGER]: '/dashboard/institution-manager',
        [UserRole.ACADEMIC_COORDINATOR]: '/dashboard/coordinator',
        [UserRole.TEACHER]: '/dashboard/teacher',
        [UserRole.STUDENT]: '/dashboard/student',
        [UserRole.GUARDIAN]: '/dashboard/guardian'
      };
      return dashboardMap[role] || '/dashboard';
    };

    const dashboardRoute = getDashboardRoute(userRole);

    // Common items for all users
    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          {
            href: dashboardRoute,
            icon: 'dashboard',
            label: 'Painel Principal'
          }
        ]
      }
    ];

    // Role-specific sections
    let roleSpecificItems: NavSection[] = [];

    switch (userRole) {
      case UserRole.SYSTEM_ADMIN:
        roleSpecificItems = [
          {
            section: 'Administração do Sistema',
            items: [
              {
                href: '/admin/institutions',
                icon: 'business',
                label: 'Gerenciar Instituições',
                permission: 'canManageInstitutions'
              },
              {
                href: '/admin/users',
                icon: 'manage_accounts',
                label: 'Usuários Globais',
                permission: 'canManageGlobalUsers'
              },
              {
                href: '/admin/security',
                icon: 'security',
                label: 'Políticas de Segurança',
                permission: 'canManageSecurityPolicies'
              },
              {
                href: '/admin/roles',
                icon: 'key',
                label: 'Gerenciar Permissões',
                permission: 'canManageSystem'
              },
              {
                href: '/admin/audit',
                icon: 'history',
                label: 'Logs de Auditoria',
                permission: 'canManageSystem'
              },
              {
                href: '/admin/backup',
                icon: 'backup',
                label: 'Backup do Sistema',
                permission: 'canManageSystem'
              },
              {
                href: '/admin/settings',
                icon: 'settings',
                label: 'Configurações do Sistema',
                permission: 'canManageSystem'
              }
            ]
          },
          {
            section: 'Relatórios',
            items: [
              {
                href: '/portal/reports',
                icon: 'analytics',
                label: 'Portal de Relatórios',
                permission: 'canViewPortalReports'
              }
            ]
          },
          {
            section: 'Gestão de Conteúdo',
            items: [
              {
                href: '/admin/content/library',
                icon: 'library_books',
                label: 'Acervo Digital',
                permission: 'canManageSystem'
              },
              {
                href: '/admin/content/search',
                icon: 'archive',
                label: 'Arquivos',
                permission: 'canManageSystem'
              }
            ]
          },
          {
            section: 'Monitoramento',
            items: [
              {
                href: '/admin/analytics',
                icon: 'analytics',
                label: 'Analytics do Sistema',
                permission: 'canViewSystemAnalytics'
              },
              {
                href: '/admin/logs',
                icon: 'terminal',
                label: 'Logs do Sistema',
                permission: 'canManageSystem'
              },
              {
                href: '/admin/performance',
                icon: 'speed',
                label: 'Performance',
                permission: 'canManageSystem'
              }
            ]
          }
        ];
        break;

      case UserRole.INSTITUTION_MANAGER:
        roleSpecificItems = [
          {
            section: 'Gestão Institucional',
            items: [
              {
                href: '/institution/schools',
                icon: 'school',
                label: 'Escolas',
                permission: 'canManageSchools'
              },
              {
                href: '/institution/classes',
                icon: 'class',
                label: 'Turmas',
                permission: 'canManageClasses'
              },
              {
                href: '/institution/teachers',
                icon: 'groups',
                label: 'Professores',
                permission: 'canManageInstitutionUsers'
              },
              {
                href: '/institution/students',
                icon: 'group',
                label: 'Alunos',
                permission: 'canManageInstitutionUsers'
              }
            ]
          },
          {
            section: 'Acadêmico',
            items: [
              {
                href: '/institution/courses',
                icon: 'menu_book',
                label: 'Cursos',
                permission: 'canManageCurriculum'
              },
              {
                href: '/institution/curriculum',
                icon: 'assignment',
                label: 'Currículo',
                permission: 'canManageCurriculum'
              },
              {
                href: '/institution/calendar',
                icon: 'calendar_month',
                label: 'Calendário',
                permission: 'canManageSchedules'
              }
            ]
          },
          {
            section: 'Relatórios',
            items: [
              {
                href: '/institution/reports',
                icon: 'analytics',
                label: 'Relatórios Institucionais',
                permission: 'canViewInstitutionAnalytics'
              },
              {
                href: '/institution/performance',
                icon: 'assessment',
                label: 'Desempenho Acadêmico',
                permission: 'canViewAcademicAnalytics'
              },
              {
                href: '/institution/financial',
                icon: 'payments',
                label: 'Financeiro',
                permission: 'canViewInstitutionAnalytics'
              }
            ]
          }
        ];
        break;

      case UserRole.ACADEMIC_COORDINATOR:
        roleSpecificItems = [
          {
            section: 'Coordenação Acadêmica',
            items: [
              {
                href: '/coordinator/cycles',
                icon: 'school',
                label: 'Ciclos Educacionais',
                permission: 'canManageCycles'
              },
              {
                href: '/coordinator/curriculum',
                icon: 'menu_book',
                label: 'Gestão Curricular',
                permission: 'canManageCurriculum'
              },
              {
                href: '/coordinator/teachers',
                icon: 'groups',
                label: 'Corpo Docente',
                permission: 'canMonitorTeachers'
              },
              {
                href: '/coordinator/evaluations',
                icon: 'grade',
                label: 'Avaliações',
                permission: 'canViewAcademicAnalytics'
              }
            ]
          },
          {
            section: 'Acompanhamento',
            items: [
              {
                href: '/coordinator/performance',
                icon: 'trending_up',
                label: 'Desempenho',
                permission: 'canViewAcademicAnalytics'
              },
              {
                href: '/coordinator/planning',
                icon: 'event_note',
                label: 'Planejamento',
                permission: 'canManageCurriculum'
              },
              {
                href: '/coordinator/meetings',
                icon: 'groups_2',
                label: 'Reuniões',
                permission: 'canCoordinateDepartments'
              }
            ]
          },
          {
            section: 'Qualidade',
            items: [
              {
                href: '/coordinator/indicators',
                icon: 'analytics',
                label: 'Indicadores',
                permission: 'canViewAcademicAnalytics'
              },
              {
                href: '/coordinator/reports',
                icon: 'assessment',
                label: 'Relatórios',
                permission: 'canViewAcademicAnalytics'
              },
              {
                href: '/coordinator/improvements',
                icon: 'tips_and_updates',
                label: 'Melhorias',
                permission: 'canCoordinateDepartments'
              }
            ]
          }
        ];
        break;

      case UserRole.TEACHER:
        roleSpecificItems = [
          {
            section: 'Área do Professor',
            items: [
              {
                href: '/teacher/courses',
                icon: 'school',
                label: 'Gestão de Cursos',
                permission: 'canManageLessonPlans'
              },
              {
                href: '/teacher/assignments',
                icon: 'assignment',
                label: 'Gestão de Atividades',
                permission: 'canManageLessonPlans'
              },
              {
                href: '/teacher/live-classes',
                icon: 'video_camera_front',
                label: 'Gestão de Aulas ao Vivo',
                permission: 'canManageLessonPlans'
              },
              {
                href: '/teacher/lessons',
                icon: 'menu_book',
                label: 'Gestão de Aulas',
                permission: 'canManageLessonPlans'
              }
            ]
          },
          {
            section: 'Gestão da Turma',
            items: [
              {
                href: '/teacher/students',
                icon: 'group',
                label: 'Alunos',
                permission: 'canCommunicateWithStudents'
              },
              {
                href: '/teacher/grades',
                icon: 'grade',
                label: 'Avaliações',
                permission: 'canManageGrades'
              },
              {
                href: '/teacher/reports',
                icon: 'analytics',
                label: 'Relatórios',
                permission: 'canManageGrades'
              },
              {
                href: '/teacher/forum',
                icon: 'forum',
                label: 'Fórum',
                permission: 'canCommunicateWithStudents'
              }
            ]
          },
          {
            section: 'Portais',
            items: [
              {
                href: '/portal/videos',
                icon: 'play_circle',
                label: 'Portal de Vídeos',
                permission: 'canUploadResources'
              },
              {
                href: '/portal/books',
                icon: 'auto_stories',
                label: 'Portal de Literatura',
                permission: 'canUploadResources'
              }
            ]
          }
        ];
        break;

      case UserRole.STUDENT:
        roleSpecificItems = [
          {
            section: 'Área Acadêmica',
            items: [
              {
                href: '/student/courses',
                icon: 'school',
                label: 'Meus Cursos',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/student/assignments',
                icon: 'assignment',
                label: 'Atividades',
                permission: 'canSubmitAssignments'
              },
              {
                href: '/student/live-classes',
                icon: 'video_camera_front',
                label: 'Aulas ao Vivo',
                permission: 'canViewOwnSchedule'
              },
              {
                href: '/student/lessons',
                icon: 'school',
                label: 'Aulas',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/student/forum',
                icon: 'forum',
                label: 'Fórum',
                permission: 'canCommunicateWithStudents'
              }
            ]
          },
          {
            section: 'Portais',
            items: [
              {
                href: '/portal/books',
                icon: 'auto_stories',
                label: 'Portal de Literatura',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/student',
                icon: 'person_outline',
                label: 'Portal do Aluno',
                permission: 'canAccessLearningMaterials'
              }
            ]
          }
        ];
        break;

      case UserRole.GUARDIAN:
        roleSpecificItems = [
          {
            section: 'Acompanhamento',
            items: [
              {
                href: '/guardian/children',
                icon: 'child_care',
                label: 'Meus Filhos',
                permission: 'canViewChildrenInfo'
              },
              {
                href: '/guardian/grades',
                icon: 'grade',
                label: 'Notas',
                permission: 'canViewChildrenGrades'
              },
              {
                href: '/guardian/attendance',
                icon: 'fact_check',
                label: 'Frequência',
                permission: 'canViewChildrenAttendance'
              },
              {
                href: '/guardian/assignments',
                icon: 'assignment',
                label: 'Atividades',
                permission: 'canViewChildrenAssignments'
              }
            ]
          },
          {
            section: 'Comunicação',
            items: [
              {
                href: '/guardian/messages',
                icon: 'mail',
                label: 'Mensagens',
                permission: 'canCommunicateWithSchool'
              },
              {
                href: '/guardian/meetings',
                icon: 'video_call',
                label: 'Reuniões',
                permission: 'canScheduleMeetings'
              },
              {
                href: '/guardian/announcements',
                icon: 'campaign',
                label: 'Comunicados',
                permission: 'canReceiveAnnouncements'
              }
            ]
          },
          {
            section: 'Financeiro',
            items: [
              {
                href: '/guardian/payments',
                icon: 'payments',
                label: 'Pagamentos',
                permission: 'canViewPayments'
              },
              {
                href: '/guardian/boletos',
                icon: 'receipt',
                label: 'Boletos',
                permission: 'canViewBoletos'
              },
              {
                href: '/guardian/financial-history',
                icon: 'history',
                label: 'Histórico',
                permission: 'canViewFinancialHistory'
              }
            ]
          }
        ];
        break;

      default:
        roleSpecificItems = [];
    }

    return [...commonItems, ...roleSpecificItems];
  }, [userRole]);

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-3 left-3 z-[9998] bg-sidebar-bg rounded-lg p-2.5 text-sidebar-text hover:bg-sidebar-hover transition-colors shadow-lg border border-white/10"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-[9997] md:hidden sidebar-mobile-backdrop"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <div
        id="sidebar-menu"
        className={`fixed md:sticky top-0 h-screen transition-all duration-300 ease-in-out z-[9996] overflow-hidden
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
              className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 bg-sidebar-bg rounded-full p-1 hover:bg-sidebar-hover transition-colors z-[9995] items-center justify-center border border-white/10"
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
                  userRole={userRole}
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
