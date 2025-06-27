'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect, useCallback, memo } from 'react'
import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, hasPermission, getAccessibleRoutes, RolePermissions } from '@/types/roles'
import { motion, AnimatePresence } from 'framer-motion'
import { getSystemAdminMenuItems } from '@/components/admin/SystemAdminMenu'
import { EnhancedLoadingState } from '../ui/LoadingStates'
import SidebarDebug from '../debug/SidebarDebug'

interface NavItem {
  href: string
  icon: string
  label: string
  permission?: keyof RolePermissions
}

interface NavSection {
  section: string
  items: NavItem[]
}

// Constants
const SIDEBAR_WIDTH = '16rem'
const COLLAPSED_WIDTH = '4rem'
const MOBILE_BREAKPOINT = 768

// Error boundary wrapper simplificado
function withErrorBoundary<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('Erro no sidebar:', error);
      // Retornar um sidebar básico em caso de erro
      return (
        <div className="w-64 bg-blue-900 border-r border-blue-800 flex flex-col h-screen">
          <div className="p-4 border-b border-blue-800">
            <div className="text-white font-bold text-lg">Portal</div>
          </div>
          <nav className="flex-1 p-4">
            <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-white hover:bg-blue-800 rounded">
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Dashboard</span>
            </a>
          </nav>
        </div>
      );
    }
  };
}

// Memoized Components
const SidebarLogo = memo(({ isCollapsed }: { isCollapsed: boolean }) => (
  <span className="overflow-hidden flex items-center justify-center py-1">
    {isCollapsed ? (
      <div className="w-8 h-8 bg-primary-light/20 rounded-lg flex items-center justify-center">
        <span className="text-xl font-bold text-white">S</span>
      </div>
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
  </span>
));
SidebarLogo.displayName = 'SidebarLogo';

const UserProfile = memo(({ user, isCollapsed, theme, isSystemAdmin = false }: { 
  user: any, 
  isCollapsed: boolean, 
  theme: any,
  isSystemAdmin?: boolean 
}) => (
  <motion.div
    className="px-3 border-b py-3"
    style={{ borderColor: theme.colors.sidebar.border }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
      <motion.div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: theme.colors.primary.light || theme.colors.primary.DEFAULT + '40',
          color: theme.colors.sidebar.textActive || '#ffffff'
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`material-symbols-outlined font-medium ${
          isCollapsed ? 'text-[20px]' : 'text-[18px]'
        }`}>
          person
        </span>
      </motion.div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="overflow-hidden min-w-0 flex-1"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
));
UserProfile.displayName = 'UserProfile';

const NavItem = memo(({ item, isActive, isCollapsed, onClick, theme, isSystemAdmin = false }: {
  item: NavItem,
  isActive: boolean,
  isCollapsed: boolean,
  onClick?: () => void,
  theme: any,
  isSystemAdmin?: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2 }}
    whileHover={{ x: 2 }}
  >
    <Link
      href={item.href}
      prefetch={true}
      className={`flex items-center gap-2 px-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative
        ${isCollapsed ? 'justify-center' : ''}
        py-1.5 min-h-[32px]`}
      style={{
        backgroundColor: isActive ? theme.colors.sidebar.active : 'transparent',
        color: isActive ? theme.colors.sidebar.textActive : theme.colors.sidebar.text
      }}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
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
      <motion.span
        className={`material-symbols-outlined transition-transform duration-300 flex-shrink-0 ${
          isCollapsed ? 'text-[16px]' : 'text-[14px]'
        }`}
        aria-hidden="true"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {item.icon}
      </motion.span>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            className="font-medium truncate leading-tight text-[11px]"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg font-medium"
            style={{
              backgroundColor: theme.colors.primary.dark,
              color: theme.colors.sidebar.textActive
            }}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  </motion.div>
));
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
    <div className="mb-2">
      {!isCollapsed && (
        <p className="px-2 text-[7px] font-bold text-sidebar-text uppercase tracking-wider opacity-70 py-0.5 mb-1">
          {section}
        </p>
      )}
      <div className="space-y-0">
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

const LogoutButton = memo(({ isCollapsed, onLogout, theme, isSystemAdmin = false }: { 
  isCollapsed: boolean, 
  onLogout: () => void, 
  theme: any,
  isSystemAdmin?: boolean 
}) => (
  <motion.button
    onClick={onLogout}
    className={`flex items-center gap-2 px-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative w-full
      ${isCollapsed ? 'justify-center' : ''}
      py-2 min-h-[36px]`}
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
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    aria-label="Sair da Plataforma"
  >
    <motion.span
      className={`material-symbols-outlined transition-transform duration-300 flex-shrink-0 ${
        isCollapsed ? 'text-[18px]' : 'text-[16px]'
      }`}
      aria-hidden="true"
      whileHover={{ rotate: -15 }}
      transition={{ duration: 0.2 }}
    >
      logout
    </motion.span>

    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
          className="font-medium truncate leading-tight text-xs"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
        >
          Sair da Plataforma
        </motion.span>
      )}
    </AnimatePresence>

    {/* Tooltip for collapsed state */}
    <AnimatePresence>
      {isCollapsed && (
        <motion.div
          className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg font-medium"
          style={{
            backgroundColor: theme.colors.status.error,
            color: theme.colors.text.inverse
          }}
          role="tooltip"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          Sair da Plataforma
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
));
LogoutButton.displayName = 'LogoutButton';

const RoleSelector = memo(({ userRole, selectedRole, onRoleChange, theme, isSystemAdmin = false }: { 
  userRole: UserRole,
  selectedRole: UserRole, 
  onRoleChange: (role: UserRole) => void,
  theme: any,
  isSystemAdmin?: boolean
}) => {
  // Only show for system admin, but keep their actual role
  if (userRole !== UserRole.SYSTEM_ADMIN) return null;

  // Define role groups for better organization
  const roleGroups = [
    {
      label: "Administração",
      roles: [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER]
    },
    {
      label: "Acadêmico",
      roles: [UserRole.ACADEMIC_COORDINATOR, UserRole.TEACHER]
    },
    {
      label: "Usuários",
      roles: [UserRole.STUDENT, UserRole.GUARDIAN]
    }
  ];

  return (
    <motion.div
      className="px-3 border-b py-2"
      style={{ borderColor: theme.colors.sidebar.border }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <select
        className="w-full px-2 py-0.5 rounded-md bg-sidebar-hover text-sidebar-text border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-primary text-[10px]"
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        style={{
          backgroundColor: theme.colors.sidebar.hover,
          color: theme.colors.sidebar.text,
          borderColor: theme.colors.sidebar.border
        }}
      >
        {roleGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.roles.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </motion.div>
  );
});
RoleSelector.displayName = 'RoleSelector';

function DashboardSidebarComponent() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Verificações de segurança
  if (!theme || !theme.colors || !theme.colors.sidebar) {
    console.warn('Theme não está disponível ou incompleto no DashboardSidebar');
    return (
      <div className="w-64 bg-gray-100 p-4 text-gray-800 border-r border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <p className="mt-4 text-sm">Carregando tema do sidebar...</p>
      </div>
    );
  }

  // Get user role with fallback to STUDENT
  const userRole: UserRole = (user?.role || 'STUDENT') as UserRole;
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole)



  // Check if current role is SYSTEM_ADMIN for compact styling
  const isSystemAdmin = selectedRole === UserRole.SYSTEM_ADMIN;

  // Load persisted role on mount
  useEffect(() => {
    const persistedRole = localStorage.getItem('selectedRole');
    if (persistedRole && userRole === UserRole.SYSTEM_ADMIN) {
      setSelectedRole(persistedRole as UserRole);
    }
  }, [userRole]);

  // Handle role change
  const handleRoleChange = useCallback((newRole: UserRole) => {
    try {
      console.log('🔄 Iniciando mudança de role:', { from: selectedRole, to: newRole, userRole });
      
      setSelectedRole(newRole);
      
      if (userRole === UserRole.SYSTEM_ADMIN) {
        console.log('✅ SYSTEM_ADMIN detectado, salvando role selecionada');
        localStorage.setItem('selectedRole', newRole);
        
        // Redirect to the corresponding dashboard
        const dashboardMap = {
          [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
          [UserRole.INSTITUTION_MANAGER]: '/dashboard/institution-manager',
          [UserRole.ACADEMIC_COORDINATOR]: '/dashboard/coordinator',
          [UserRole.TEACHER]: '/dashboard/teacher',
          [UserRole.STUDENT]: '/dashboard/student',
          [UserRole.GUARDIAN]: '/dashboard/guardian'
        };
        
        const targetDashboard = dashboardMap[newRole];
        console.log('🎯 Dashboard alvo:', targetDashboard, 'Pathname atual:', pathname);
        
        if (targetDashboard) {
          // Sempre navegar, mesmo se já estiver na rota
          const navigationUrl = `${targetDashboard}?timestamp=${Date.now()}`;
          console.log('🚀 Navegando para:', navigationUrl);
          
          // Navegação simples sem múltiplas tentativas para evitar loops
          console.log('🔄 Navegando com router.push');
          router.push(navigationUrl);
        } else {
          console.log('❌ Dashboard não encontrado para role:', newRole);
        }
      } else {
        console.log('❌ Usuário não é SYSTEM_ADMIN, ignorando mudança de role');
      }
    } catch (error) {
      console.error('❌ Erro durante mudança de role:', error);
    }
  }, [userRole, pathname, router, selectedRole]);

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
      console.error('Erro ao fazer logout:', error);
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

    const dashboardRoute = getDashboardRoute(selectedRole);

    // Common items for all users
    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          {
            href: dashboardRoute,
            icon: 'dashboard',
            label: 'Painel Principal'
          },
          {
            href: '/chat',
            icon: 'chat',
            label: 'Mensagens'
          }
        ]
      }
    ];

    // Role-specific sections
    let roleSpecificItems: NavSection[] = [];

    switch (selectedRole) {
      case UserRole.SYSTEM_ADMIN:
        // Usa o menu completo do SystemAdminMenu
        try {
          roleSpecificItems = getSystemAdminMenuItems() || [];
        } catch (error) {
          console.error('Erro ao carregar menu do System Admin:', error);
          roleSpecificItems = [];
        }
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
            section: 'Portais',
            items: [
              {
                href: '/portal/books',
                icon: 'auto_stories',
                label: 'Portal de Literatura',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/videos',
                icon: 'play_circle',
                label: 'Portal de Vídeos',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/collections',
                icon: 'video_library',
                label: 'Coleções',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/collections/manage',
                icon: 'edit_note',
                label: 'Gerenciar Coleções',
                permission: 'canAccessLearningMaterials'
              }
            ]
          },
          {
            section: 'Relatórios',
            items: [
              {
                href: '/reports/institutional',
                icon: 'analytics',
                label: 'Relatórios Institucionais',
                permission: 'canViewInstitutionAnalytics'
              },
              {
                href: '/reports/performance',
                icon: 'assessment',
                label: 'Desempenho Acadêmico',
                permission: 'canViewAcademicAnalytics'
              },
              {
                href: '/reports/financial',
                icon: 'payments',
                label: 'Financeiro',
                permission: 'canViewInstitutionAnalytics'
              },
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
              },
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
                href: '/portal/videos',
                icon: 'play_circle',
                label: 'Portal de Vídeos',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/collections',
                icon: 'video_library',
                label: 'Coleções',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/collections/manage',
                icon: 'edit_note',
                label: 'Gerenciar Coleções',
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

      case UserRole.TEACHER:
        roleSpecificItems = [
          {
            section: 'Área do Professor',
            items: [
              {
                href: '/courses/manage',
                icon: 'school',
                label: 'Gestão de Cursos',
                permission: 'canManageLessonPlans'
              },
              {
                href: '/assignments/manage',
                icon: 'assignment',
                label: 'Gestão de Atividades',
                permission: 'canManageLessonPlans'
              },
              {
                href: '/live/manage',
                icon: 'video_camera_front',
                label: 'Gestão de Aulas ao Vivo',
                permission: 'canManageLessonPlans'
              },
              {
                href: '/lessons/manage',
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
                href: '/reports/teacher',
                icon: 'analytics',
                label: 'Relatórios',
                permission: 'canManageGrades'
              },
              {
                href: '/forum',
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
                href: '/portal/collections',
                icon: 'video_library',
                label: 'Coleções',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/collections/manage',
                icon: 'edit_note',
                label: 'Gerenciar Coleções',
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
                href: '/courses/',
                icon: 'school',
                label: 'Meus Cursos',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/assignments',
                icon: 'assignment',
                label: 'Atividades',
                permission: 'canSubmitAssignments'
              },
              {
                href: '/live',
                icon: 'video_camera_front',
                label: 'Aulas ao Vivo',
                permission: 'canViewOwnSchedule'
              },
              {
                href: '/lessons',
                icon: 'school',
                label: 'Aulas',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/quiz/student',
                icon: 'quiz',
                label: 'Quiz Interativo',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/study-groups/student',
                icon: 'group',
                label: 'Grupos de Estudo',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/forum',
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
                href: '/portal/videos',
                icon: 'play_circle',
                label: 'Portal de Vídeos',
                permission: 'canAccessLearningMaterials'
              },
              {
                href: '/portal/collections',
                icon: 'video_library',
                label: 'Coleções',
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
                href: '/guardian/activities',
                icon: 'assignment',
                label: 'Atividades',
                permission: 'canViewChildrenAssignments'
              },
              {
                href: '/dashboard/guardian/momentos',
                icon: 'photo_camera',
                label: 'Momentos',
                permission: 'canViewChildrenInfo'
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
                href: '/guardian/invoices',
                icon: 'receipt',
                label: 'Boletos',
                permission: 'canViewBoletos'
              },
              {
                href: '/guardian/history',
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
  }, [selectedRole]);

    // Para o SYSTEM_ADMIN, apenas usamos os itens específicos do papel, sem adicionar os itens comuns
    const navItems = selectedRole === UserRole.SYSTEM_ADMIN 
      ? (() => {
          try {
            return getSystemAdminMenuItems() || [];
          } catch (error) {
            console.error('Erro ao carregar menu do System Admin:', error);
            return [];
          }
        })()
      : getNavItems();

  return (
    <>
      {/* Debug Component */}
      <SidebarDebug />
      
      {/* Loading State para Logout */}
      {isLoggingOut && (
        <EnhancedLoadingState
          message="Saindo do sistema..."
          submessage="Limpando dados e finalizando sessão"
          showProgress={false}
        />
      )}

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-64 flex flex-col h-screen shadow-xl"
        style={{
          backgroundColor: theme.colors.sidebar.bg,
          borderRight: `1px solid ${theme.colors.sidebar.border}`,
          color: theme.colors.sidebar.text
        }}
      >
      {/* Logo - Altura fixa */}
      <motion.div
        className="border-b flex-shrink-0 p-4 h-20"
        style={{ borderColor: theme.colors.sidebar.border }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Link href="/" className="flex items-center justify-center group h-full">
          <motion.div
            className="table transition-transform duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image
              src="/sabercon-logo-white.png"
              alt="Logo"
              width={200}
              height={80}
              className="object-contain group-hover:brightness-110 transition-all duration-200"
              priority
            />
          </motion.div>
        </Link>
      </motion.div>

      {/* Role Selector - Altura fixa */}
      <div className="flex-shrink-0 h-12">
        <RoleSelector 
          userRole={userRole}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
          theme={theme}
          isSystemAdmin={isSystemAdmin}
        />
      </div>

      {/* User Info - Altura fixa */}
      <div className="flex-shrink-0 h-16">
        <UserProfile 
          user={user} 
          isCollapsed={isCollapsed} 
          theme={theme} 
          isSystemAdmin={isSystemAdmin}
        />
      </div>

      {/* Navigation - Área flexível com scroll */}
      <nav className="flex-1 px-1 overflow-y-auto overflow-x-hidden py-2" 
           style={{
             scrollbarWidth: 'thin',
             scrollbarColor: `${theme.colors.sidebar.hover} transparent`,
             minHeight: 0 // Importante para permitir que o flex-1 funcione corretamente
           }}>
        <style jsx>{`
          nav::-webkit-scrollbar {
            width: 4px;
          }
          nav::-webkit-scrollbar-track {
            background: transparent;
          }
          nav::-webkit-scrollbar-thumb {
            background: ${theme.colors.sidebar.hover};
            border-radius: 2px;
          }
          nav::-webkit-scrollbar-thumb:hover {
            background: ${theme.colors.sidebar.border};
          }
        `}</style>
        <div className="space-y-1 pb-2">
          {navItems.map((section, idx) => (
            <NavSection
              key={idx}
              section={section.section}
              items={section.items}
              pathname={pathname}
              isCollapsed={isCollapsed}
              onItemClick={closeMobileSidebar}
              userRole={selectedRole}
              theme={theme}
            />
          ))}
        </div>
      </nav>

      {/* Bottom Actions - Altura fixa */}
      <div className="border-t flex-shrink-0 p-2 h-14" style={{ borderColor: theme.colors.sidebar.border }}>
        <LogoutButton 
          isCollapsed={isCollapsed} 
          onLogout={handleLogout} 
          theme={theme} 
          isSystemAdmin={isSystemAdmin}
        />
      </div>
    </motion.aside>
    </>
  )
}

// Export with error boundary
export default withErrorBoundary(DashboardSidebarComponent);
