const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    register: `${API_BASE_URL}/api/auth/register`,
    profile: `${API_BASE_URL}/api/auth/profile`,
    refreshToken: `${API_BASE_URL}/api/auth/refresh-token`,
  },

  // Usuários
  users: {
    list: `${API_BASE_URL}/api/users`,
    create: `${API_BASE_URL}/api/users`,
    get: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    byRole: (role: string) => `${API_BASE_URL}/api/users?role=${role}`,
  },

  // Instituições
  institutions: {
    list: `${API_BASE_URL}/api/institutions`,
    create: `${API_BASE_URL}/api/institutions`,
    get: (id: string) => `${API_BASE_URL}/api/institutions/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/institutions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/institutions/${id}`,
  },

  // Cursos
  courses: {
    list: `${API_BASE_URL}/api/courses`,
    create: `${API_BASE_URL}/api/courses`,
    get: (id: string) => `${API_BASE_URL}/api/courses/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/courses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/courses/${id}`,
    byTeacher: (teacherId: string) => `${API_BASE_URL}/api/courses?teacher=${teacherId}`,
    byStudent: (studentId: string) => `${API_BASE_URL}/api/courses?student=${studentId}`,
  },

  // Módulos
  modules: {
    list: `${API_BASE_URL}/api/modules`,
    create: `${API_BASE_URL}/api/modules`,
    get: (id: string) => `${API_BASE_URL}/api/modules/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/modules/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/modules/${id}`,
    byCourse: (courseId: string) => `${API_BASE_URL}/api/modules?course=${courseId}`,
  },

  // Livros
  books: {
    list: `${API_BASE_URL}/api/books`,
    create: `${API_BASE_URL}/api/books`,
    get: (id: string) => `${API_BASE_URL}/api/books/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/books/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/books/${id}`,
    search: (query: string) => `${API_BASE_URL}/api/books/search?q=${query}`,
  },

  // Vídeos
  videos: {
    list: `${API_BASE_URL}/api/videos`,
    create: `${API_BASE_URL}/api/videos`,
    get: (id: string) => `${API_BASE_URL}/api/videos/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/videos/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/videos/${id}`,
    byModule: (moduleId: string) => `${API_BASE_URL}/api/videos?module=${moduleId}`,
  },

  // Quizzes
  quizzes: {
    list: `${API_BASE_URL}/api/quizzes`,
    create: `${API_BASE_URL}/api/quizzes`,
    get: (id: string) => `${API_BASE_URL}/api/quizzes/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/quizzes/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/quizzes/${id}`,
    submit: (id: string) => `${API_BASE_URL}/api/quizzes/${id}/submit`,
    results: (id: string) => `${API_BASE_URL}/api/quizzes/${id}/results`,
  },

  // Dashboard
  dashboard: {
    teacher: `${API_BASE_URL}/api/dashboard/teacher`,
    student: `${API_BASE_URL}/api/dashboard/student`,
    admin: `${API_BASE_URL}/api/dashboard/admin`,
    coordinator: `${API_BASE_URL}/api/dashboard/coordinator`,
    guardian: `${API_BASE_URL}/api/dashboard/guardian`,
  },

  // Notas
  grades: {
    list: `${API_BASE_URL}/api/grades`,
    create: `${API_BASE_URL}/api/grades`,
    get: (id: string) => `${API_BASE_URL}/api/grades/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/grades/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/grades/${id}`,
    byStudent: (studentId: string) => `${API_BASE_URL}/api/grades?student=${studentId}`,
    byCourse: (courseId: string) => `${API_BASE_URL}/api/grades?course=${courseId}`,
  },

  // Frequência
  attendance: {
    list: `${API_BASE_URL}/api/attendance`,
    create: `${API_BASE_URL}/api/attendance`,
    get: (id: string) => `${API_BASE_URL}/api/attendance/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/attendance/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/attendance/${id}`,
    byStudent: (studentId: string) => `${API_BASE_URL}/api/attendance?student=${studentId}`,
    byClass: (classId: string) => `${API_BASE_URL}/api/attendance?class=${classId}`,
  },

  // Roles e Permissões
  roles: {
    list: `${API_BASE_URL}/api/roles`,
    create: `${API_BASE_URL}/api/roles`,
    get: (id: string) => `${API_BASE_URL}/api/roles/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/roles/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/roles/${id}`,
  },

  permissions: {
    list: `${API_BASE_URL}/api/permissions`,
    create: `${API_BASE_URL}/api/permissions`,
    get: (id: string) => `${API_BASE_URL}/api/permissions/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/permissions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/permissions/${id}`,
  },

  // Notificações
  notifications: {
    list: `${API_BASE_URL}/api/notifications`,
    create: `${API_BASE_URL}/api/notifications`,
    get: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
    markAsRead: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
    markAllAsRead: `${API_BASE_URL}/api/notifications/read-all`,
  },

  // Chat e Fórum
  chats: {
    list: `${API_BASE_URL}/api/chats`,
    create: `${API_BASE_URL}/api/chats`,
    get: (id: string) => `${API_BASE_URL}/api/chats/${id}`,
    messages: (id: string) => `${API_BASE_URL}/api/chats/${id}/messages`,
    sendMessage: (id: string) => `${API_BASE_URL}/api/chats/${id}/messages`,
  },

  forum: {
    threads: `${API_BASE_URL}/api/forum/threads`,
    createThread: `${API_BASE_URL}/api/forum/threads`,
    getThread: (id: string) => `${API_BASE_URL}/api/forum/threads/${id}`,
    replies: (threadId: string) => `${API_BASE_URL}/api/forum/threads/${threadId}/replies`,
    createReply: (threadId: string) => `${API_BASE_URL}/api/forum/threads/${threadId}/replies`,
  },

  // Relatórios
  reports: {
    performance: `${API_BASE_URL}/api/reports/performance`,
    attendance: `${API_BASE_URL}/api/reports/attendance`,
    grades: `${API_BASE_URL}/api/reports/grades`,
    usage: `${API_BASE_URL}/api/reports/usage`,
  },
};

export default API_ENDPOINTS; 