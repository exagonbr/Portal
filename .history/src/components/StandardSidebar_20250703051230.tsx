'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, hasPermission, getAccessibleRoutes } from '@/types/roles'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import { getSystemAdminMenuItems } from '@/components/admin/SystemAdminMenu'
import { EnhancedLoadingState } from './ui/LoadingStates'
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading'

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
const SidebarLogo = memo(({ isCollapsed, theme }: { isCollapsed: boolean, theme: any }) => (
  <Link href="/" className="overflow-hidden flex items-center justify-center py-1">
    {isCollapsed ? (
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${theme.colors.primary.light}20` }}
      >
        <span className="text-xl font-bold" style={{ color: theme.colors.primary.DEFAULT }}>S</span>
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
SidebarLogo.displayName = 'SidebarLogo';

const UserProfile = memo(({ user, isCollapsed, theme, userRole }: { user: any, isCollapsed: boolean, theme: any, userRole: UserRole }) => (
  <div className={`px-2 py-3 border-b flex-shrink-0 ${userRole !== UserRole.SYSTEM_ADMIN ? 'py-4' : ''}`} style={{ borderColor: `${theme.colors.border.light}40` }}>
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${theme.colors.primary.light}30` }}
      >
        <span
          className={`material-symbols-outlined ${isCollapsed ? 'text-[16px]' : 'text-[14px]'}`}
          style={{ color: theme.colors.primary.DEFAULT }}
        >
          person
        </span>
      </div>
      {!isCollapsed && (
        <div className="overflow-hidden min-w-0 flex-1">
          <p className="text-xs font-semibold truncate leading-tight" style={{ color: theme.colors.text.primary }}>{user?.name}</p>
          <span className="text-[10px] leading-tight" style={{ color: theme.colors.text.secondary }}>
              {user?.role && ROLE_LABELS[user.role as UserRole]}
          </span>
        </div>
      )}
    </div>
  </div>
));
UserProfile.displayName = 'UserProfile';

const NavItem = memo(({ item, isActive, isCollapsed, onClick, theme }: {
  item: NavItem,
  isActive: boolean,
  isCollapsed: boolean,
  onClick?: () => void,
  theme: any
}) => {
  const { navigateWithLoading } = useNavigationWithLoading()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Se já estiver na página atual, não fazer nada
    if (isActive) return
    
    // Chamar onClick se fornecido (para fechar mobile sidebar)
    onClick?.()
    
    // Navegar com loading
    navigateWithLoading(item.href, {
      message: 'Estamos preparando tudo para você',
      delay: 200
    })
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-2 py-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative outline-none w-full text-left
        ${isCollapsed ? 'justify-center' : ''}`}
      style={{
        backgroundColor: isActive ? theme.colors.primary.DEFAULT : 'transparent',
        color: isActive ? 'white' : theme.colors.text.secondary
      }}
      aria-current={isActive ? 'page' : undefined}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = `${theme.colors.primary.light}20`;
          e.currentTarget.style.color = theme.colors.primary.DEFAULT;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = theme.colors.text.secondary;
        }
      }}
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
        className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg font-medium"
        style={{ 
          backgroundColor: theme.colors.background.card,
          color: theme.colors.text.primary,
          borderColor: theme.colors.border.DEFAULT
        }}
        role="tooltip"
      >
        {item.label}
      </div>
    )}
  </button>
  )
});
NavItem.displayName = 'NavItem';

const NavSection = memo(({ section, items, pathname, isCollapsed, onItemClick, userRole, theme }: { 
  section: string, 
  items: NavItem[], 
  pathname: string | null,
  isCollapsed: boolean,
  onItemClick?: () => void,
  userRole: UserRole,
  theme: any
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
        <p 
          className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider opacity-75"
          style={{ color: theme.colors.text.tertiary }}
        >
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
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
});
NavSection.displayName = 'NavSection';

const LogoutButton = memo(({ isCollapsed, onLogout, theme }: { isCollapsed: boolean, onLogout: () => void, theme: any }) => (
  <button
    onClick={onLogout}
    className={`flex items-center gap-2 px-2 py-2 rounded-md transition-all duration-300 group relative w-full mx-1 text-xs font-medium
      ${isCollapsed ? 'justify-center' : ''}`}
    style={{ color: theme.colors.text.secondary }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = `${theme.colors.status.error}10`;
      e.currentTarget.style.color = theme.colors.status.error;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = theme.colors.text.secondary;
    }}
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
        className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg font-medium"
        style={{ 
          backgroundColor: theme.colors.background.card,
          color: theme.colors.text.primary,
          borderColor: theme.colors.border.DEFAULT
        }}
        role="tooltip"
      >
        Sair da Plataforma
      </div>
    )}
  </button>
));
LogoutButton.displayName = 'LogoutButton';

export default function StandardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Get user role with fallback to STUDENT - garantindo que sempre será uppercase
  const normalizedRole = user?.role ? user.role.toUpperCase() : 'STUDENT';
  const userRole: UserRole = (normalizedRole as UserRole) || UserRole.STUDENT;

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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
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

  const navItems = useMemo(() => {
    const getDashboardRoute = (role: UserRole): string => {
      const dashboardMap: Record<UserRole, string> = {
        [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
        [UserRole.INSTITUTION_MANAGER]: '/dashboard/institution-manager',
        [UserRole.COORDINATOR]: '/dashboard/coordinator',
        [UserRole.TEACHER]: '/dashboard/teacher',
        [UserRole.STUDENT]: '/dashboard/student',
        [UserRole.GUARDIAN]: '/dashboard/guardian',
      };
      return dashboardMap[role] || '/dashboard';
    };

    const dashboardRoute = getDashboardRoute(userRole);

    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [{ href: dashboardRoute, icon: 'dashboard', label: 'Painel Principal' }],
      },
    ];

    const roleSpecificItemsMap: Record<UserRole, NavSection[]> = {
      [UserRole.SYSTEM_ADMIN]: getSystemAdminMenuItems(),
      [UserRole.INSTITUTION_MANAGER]: [
        {
          section: 'Gestão Institucional',
          items: [
            { href: '/institution/schools', icon: 'school', label: 'Escolas', permission: 'canManageSchools' },
            { href: '/institution/classes', icon: 'class', label: 'Turmas', permission: 'canManageClasses' },
            { href: '/institution/teachers', icon: 'groups', label: 'Professores', permission: 'canManageInstitutionUsers' },
            { href: '/institution/students', icon: 'group', label: 'Alunos', permission: 'canManageInstitutionUsers' },
          ],
        },
        {
          section: 'Acadêmico',
          items: [
            { href: '/institution/courses', icon: 'menu_book', label: 'Cursos', permission: 'canManageCurriculum' },
            { href: '/institution/curriculum', icon: 'assignment', label: 'Currículo', permission: 'canManageCurriculum' },
            { href: '/institution/calendar', icon: 'calendar_month', label: 'Calendário', permission: 'canManageSchedules' },
          ],
        },
        {
          section: 'Relatórios',
          items: [
            { href: '/institution/reports', icon: 'analytics', label: 'Relatórios Institucionais', permission: 'canViewInstitutionAnalytics' },
            { href: '/institution/performance', icon: 'assessment', label: 'Desempenho Acadêmico', permission: 'canViewAcademicAnalytics' },
            { href: '/institution/financial', icon: 'payments', label: 'Financeiro', permission: 'canViewInstitutionAnalytics' },
          ],
        },
      ],
      [UserRole.COORDINATOR]: [
        {
          section: 'Coordenação Acadêmica',
          items: [
            { href: '/coordinator/cycles', icon: 'school', label: 'Ciclos Educacionais', permission: 'canManageCycles' },
            { href: '/coordinator/curriculum', icon: 'menu_book', label: 'Gestão Curricular', permission: 'canManageCurriculum' },
            { href: '/coordinator/teachers', icon: 'groups', label: 'Corpo Docente', permission: 'canMonitorTeachers' },
            { href: '/coordinator/evaluations', icon: 'grade', label: 'Avaliações', permission: 'canViewAcademicAnalytics' },
          ],
        },
        {
          section: 'Acompanhamento',
          items: [
            { href: '/coordinator/performance', icon: 'trending_up', label: 'Desempenho', permission: 'canViewAcademicAnalytics' },
            { href: '/coordinator/planning', icon: 'event_note', label: 'Planejamento', permission: 'canManageCurriculum' },
            { href: '/coordinator/meetings', icon: 'groups_2', label: 'Reuniões', permission: 'canCoordinateDepartments' },
          ],
        },
        {
          section: 'Qualidade',
          items: [
            { href: '/coordinator/indicators', icon: 'analytics', label: 'Indicadores', permission: 'canViewAcademicAnalytics' },
            { href: '/coordinator/reports', icon: 'assessment', label: 'Relatórios', permission: 'canViewAcademicAnalytics' },
            { href: '/coordinator/improvements', icon: 'tips_and_updates', label: 'Melhorias', permission: 'canCoordinateDepartments' },
          ],
        },
      ],
      [UserRole.TEACHER]: [
        {
          section: 'Área do Professor',
          items: [
            { href: '/teacher/courses', icon: 'school', label: 'Gestão de Cursos', permission: 'canManageLessonPlans' },
            { href: '/teacher/assignments', icon: 'assignment', label: 'Gestão de Atividades', permission: 'canManageLessonPlans' },
            { href: '/teacher/live-classes', icon: 'video_camera_front', label: 'Gestão de Aulas ao Vivo', permission: 'canManageLessonPlans' },
            { href: '/teacher/lessons', icon: 'menu_book', label: 'Gestão de Aulas', permission: 'canManageLessonPlans' },
          ],
        },
        {
          section: 'Gestão da Turma',
          items: [
            { href: '/teacher/students', icon: 'group', label: 'Alunos', permission: 'canCommunicateWithStudents' },
            { href: '/teacher/grades', icon: 'grade', label: 'Avaliações', permission: 'canManageGrades' },
            { href: '/teacher/reports', icon: 'analytics', label: 'Relatórios', permission: 'canManageGrades' },
            { href: '/teacher/forum', icon: 'forum', label: 'Fórum', permission: 'canCommunicateWithStudents' },
          ],
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/videos', icon: 'play_circle', label: 'Portal de Vídeos', permission: 'canUploadResources' },
            { href: '/portal/books', icon: 'auto_stories', label: 'Portal de Literatura', permission: 'canUploadResources' },
          ],
        },
      ],
      [UserRole.STUDENT]: [
        {
          section: 'Área Acadêmica',
          items: [
            { href: '/student/courses', icon: 'school', label: 'Meus Cursos', permission: 'canAccessLearningMaterials' },
            { href: '/student/assignments', icon: 'assignment', label: 'Atividades', permission: 'canSubmitAssignments' },
            { href: '/student/live-classes', icon: 'video_camera_front', label: 'Aulas ao Vivo', permission: 'canViewOwnSchedule' },
            { href: '/student/lessons', icon: 'school', label: 'Aulas', permission: 'canAccessLearningMaterials' },
            { href: '/student/forum', icon: 'forum', label: 'Fórum', permission: 'canCommunicateWithStudents' },
          ],
        },
        {
          section: 'Portais',
          items: [
            { href: '/portal/books', icon: 'auto_stories', label: 'Portal de Literatura', permission: 'canAccessLearningMaterials' },
            { href: '/portal/student', icon: 'person_outline', label: 'Portal do Aluno', permission: 'canAccessLearningMaterials' },
          ],
        },
      ],
      [UserRole.GUARDIAN]: [
        {
          section: 'Acompanhamento',
          items: [
            { href: '/guardian/children', icon: 'child_care', label: 'Meus Filhos', permission: 'canViewChildrenInfo' },
            { href: '/guardian/grades', icon: 'grade', label: 'Notas', permission: 'canViewChildrenGrades' },
            { href: '/guardian/attendance', icon: 'fact_check', label: 'Frequência', permission: 'canViewChildrenAttendance' },
            { href: '/guardian/assignments', icon: 'assignment', label: 'Atividades', permission: 'canViewChildrenAssignments' },
            { href: '/dashboard/guardian/momentos', icon: 'photo_camera', label: 'Momentos', permission: 'canViewChildrenInfo' },
          ],
        },
        {
          section: 'Comunicação',
          items: [
            { href: '/guardian/messages', icon: 'mail', label: 'Mensagens', permission: 'canCommunicateWithSchool' },
            { href: '/guardian/meetings', icon: 'video_call', label: 'Reuniões', permission: 'canScheduleMeetings' },
            { href: '/guardian/announcements', icon: 'campaign', label: 'Comunicados', permission: 'canReceiveAnnouncements' },
          ],
        },
        {
          section: 'Financeiro',
          items: [
            { href: '/guardian/payments', icon: 'payments', label: 'Pagamentos', permission: 'canViewPayments' },
            { href: '/guardian/boletos', icon: 'receipt', label: 'Boletos', permission: 'canViewBoletos' },
            { href: '/guardian/financial-history', icon: 'history', label: 'Histórico', permission: 'canViewFinancialHistory' },
          ],
        },
      ],
    };

    const roleSpecificItems = roleSpecificItemsMap[userRole] || [];

    if (userRole === UserRole.SYSTEM_ADMIN) {
      return roleSpecificItems;
    }

    return [...commonItems, ...roleSpecificItems];
  }, [userRole]);

  return (
    <>
      {/* Loading State para Logout */}
      {isLoggingOut && (
        <EnhancedLoadingState
          message="Saindo do sistema..."
          submessage="Limpando dados e finalizando sessão"
          showProgress={false}
        />
      )}

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className="md:hidden fixed top-3 left-3 z-[9998] rounded-lg p-2.5 transition-colors shadow-lg border"
        style={{ 
          backgroundColor: theme.colors.background.card,
          color: theme.colors.text.secondary,
          borderColor: theme.colors.border.DEFAULT
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
          e.currentTarget.style.color = theme.colors.primary.DEFAULT;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.card;
          e.currentTarget.style.color = theme.colors.text.secondary;
        }}
        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar-menu"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </motion.button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9997] md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        id="sidebar-menu"
        className={`fixed md:sticky top-0 h-screen transition-all duration-200 ease-in-out z-[9999] overflow-hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Sidebar Content */}
        <aside 
          className="h-full flex flex-col shadow-xl overflow-hidden border-r"
          style={{ 
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.DEFAULT
          }}
        >
          {/* Logo */}
          <div className="p-2 border-b relative flex-shrink-0" style={{ borderColor: `${theme.colors.border.light}40` }}>
            {/* Desktop Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors z-[9995] items-center justify-center border"
              style={{ 
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.DEFAULT
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.card;
              }}
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <span 
                className="material-symbols-outlined text-[16px]" 
                style={{ color: theme.colors.text.secondary }}
                aria-hidden="true"
              >
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </motion.button>
            
            <SidebarLogo isCollapsed={isCollapsed} theme={theme} />
          </div>

          {/* User Info */}
          <UserProfile user={user} isCollapsed={isCollapsed} theme={theme} userRole={userRole} />

          {/* Navigation */}
          <nav className="flex-1 px-1 py-2 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <div className="space-y-1">
              {navItems.map((section: NavSection, idx: number) => (
                <NavSection
                  key={idx}
                  section={section.section}
                  items={section.items}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  onItemClick={closeMobileSidebar}
                  userRole={userRole}
                  theme={theme}
                />
              ))}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-1 border-t flex-shrink-0" style={{ borderColor: `${theme.colors.border.light}40` }}>
            <LogoutButton isCollapsed={isCollapsed} onLogout={handleLogout} theme={theme} />
          </div>
        </aside>
      </motion.div>
    </>
  )
}
