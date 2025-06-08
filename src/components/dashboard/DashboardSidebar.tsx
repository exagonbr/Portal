'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect, useCallback, memo } from 'react'
import { UserRole, ROLE_PERMISSIONS, ROLE_LABELS, hasPermission, getAccessibleRoutes } from '@/types/roles'
import { motion, AnimatePresence } from 'framer-motion'
import { getSystemAdminMenuItems } from '@/components/admin/SystemAdminMenu'

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

const UserProfile = memo(({ user, isCollapsed, theme }: { user: any, isCollapsed: boolean, theme: any }) => (
  <motion.div
    className="px-4 py-4 border-b"
    style={{ borderColor: theme.colors.sidebar.border }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
      <motion.div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: theme.colors.primary.light || theme.colors.primary.DEFAULT + '40',
          color: theme.colors.sidebar.textActive || '#ffffff'
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <span className={`material-symbols-outlined ${isCollapsed ? 'text-[24px]' : 'text-[20px]'} font-medium`}>
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
              className="text-xs font-semibold truncate leading-tight"
              style={{ color: theme.colors.sidebar.textActive }}
            >
              {user?.name}
            </p>
            <span
              className="text-[10px] leading-tight"
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

const NavItem = memo(({ item, isActive, isCollapsed, onClick, theme }: {
  item: NavItem,
  isActive: boolean,
  isCollapsed: boolean,
  onClick?: () => void,
  theme: any
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.2 }}
    whileHover={{ x: 4 }}
  >
    <Link
      href={item.href}
      prefetch={true}
      locale={false}
      className={`flex items-center gap-2 px-2 py-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative
        ${isCollapsed ? 'justify-center' : ''}`}
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
        className={`material-symbols-outlined transition-transform duration-300 flex-shrink-0 ${isCollapsed ? 'text-[18px]' : 'text-[16px]'}`}
        aria-hidden="true"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {item.icon}
      </motion.span>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            className="text-xs font-medium truncate leading-tight"
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
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
});

const LogoutButton = memo(({ isCollapsed, onLogout, theme }: { isCollapsed: boolean, onLogout: () => void, theme: any }) => (
  <motion.button
    onClick={onLogout}
    className={`flex items-center gap-2 px-2 py-2 transition-all duration-200 rounded-md mx-1 text-xs font-medium group relative w-full
      ${isCollapsed ? 'justify-center' : ''}`}
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
      className={`material-symbols-outlined transition-transform duration-300 flex-shrink-0 ${isCollapsed ? 'text-[18px]' : 'text-[16px]'}`}
      aria-hidden="true"
      whileHover={{ rotate: -15 }}
      transition={{ duration: 0.2 }}
    >
      logout
    </motion.span>

    <AnimatePresence>
      {!isCollapsed && (
        <motion.span
          className="text-xs font-medium truncate leading-tight"
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

const RoleSelector = memo(({ userRole, selectedRole, onRoleChange, theme }: { 
  userRole: UserRole,
  selectedRole: UserRole, 
  onRoleChange: (role: UserRole) => void,
  theme: any 
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
      className="px-4 py-2 border-b"
      style={{ borderColor: theme.colors.sidebar.border }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <select
        className="w-full px-2 py-1 text-xs rounded-md bg-sidebar-hover text-sidebar-text border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-primary"
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

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Get user role with fallback to STUDENT
  const userRole: UserRole = (user?.role || 'STUDENT') as UserRole;
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole)

  // Load persisted role on mount
  useEffect(() => {
    const persistedRole = localStorage.getItem('selectedRole');
    if (persistedRole && userRole === UserRole.SYSTEM_ADMIN) {
      setSelectedRole(persistedRole as UserRole);
    }
  }, [userRole]);

  // Handle role change
  const handleRoleChange = useCallback((newRole: UserRole) => {
    setSelectedRole(newRole);
    if (userRole === UserRole.SYSTEM_ADMIN) {
      localStorage.setItem('selectedRole', newRole);
    }
  }, [userRole]);

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
        // Usa o menu simplificado do SystemAdminMenu
        const adminMenuItems = getSystemAdminMenuItems();
        // Remove a seção "Principal" pois já está nos commonItems
        roleSpecificItems = adminMenuItems.filter(section => section.section !== 'Principal');
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
                icon: 'person_outline',
                label: 'Portal do Videos',
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
                icon: 'person_outline',
                label: 'Portal do Videos',
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

  const navItems = getNavItems();

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-64 flex flex-col min-h-screen shadow-xl"
      style={{
        backgroundColor: theme.colors.sidebar.bg,
        borderRight: `1px solid ${theme.colors.sidebar.border}`,
        color: theme.colors.sidebar.text
      }}
    >
      {/* Logo */}
      <motion.div
        className="p-6 border-b"
        style={{ borderColor: theme.colors.sidebar.border }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Link href="/" className="flex items-center justify-center group">
          <motion.div
            className="table transition-transform duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/sabercon-logo-white.png"
              alt="Logo"
              width={250}
              height={100}
              className="object-contain group-hover:brightness-110 transition-all duration-200"
              priority
            />
          </motion.div>
        </Link>
      </motion.div>

      {/* Role Selector - Only visible for Admin */}
      <RoleSelector 
        userRole={userRole}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        theme={theme}
      />

      {/* User Info */}
      <UserProfile user={user} isCollapsed={isCollapsed} theme={theme} />

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
              userRole={selectedRole}
              theme={theme}
            />
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-1 border-t border-white/10 flex-shrink-0">
        <LogoutButton isCollapsed={isCollapsed} onLogout={handleLogout} theme={theme} />
      </div>
    </motion.aside>
  )
}
