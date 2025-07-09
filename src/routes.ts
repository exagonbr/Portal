export const routes = {
  // Rotas de autenticação
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Rotas administrativas
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    courses: '/admin/courses',
    units: '/admin/units',
    classes: '/admin/classes',
    institutions: '/admin/institutions',
    roles: '/admin/roles',
    settings: '/admin/settings',
  },

  // Rotas de usuário
  user: {
    profile: '/profile',
    settings: '/settings',
    notifications: '/notifications',
  },

  // Rotas de conteúdo
  content: {
    courses: '/courses',
    course: (id: string | number) => `/courses/${id}`,
    unit: (id: string | number) => `/units/${id}`,
    class: (id: string | number) => `/classes/${id}`,
  },
} as const; 