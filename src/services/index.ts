// Exportações centralizadas de todos os serviços

// Cliente API base
export { apiClient, handleApiError, ApiClientError, isAuthError } from '@/lib/api-client';

// Serviços de cache
export {
  cacheService,
  CacheKeys,
  CacheTTL,
  withCache,
  invalidateUserCache,
  invalidateRoleCache,
  invalidateInstitutionCache,
  invalidateCourseCache
} from './cacheService';

// Serviços de filas
export {
  queueService,
  JobTypes,
  addUserImportJob,
  addUserExportJob,
  addEmailJob,
  addReportJob,
  addNotificationJob,
  addCacheRefreshJob
} from './queueService';

// Serviços de autenticação
export { 
  authService,
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated,
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from './authService';

// Serviços de usuários
export {
  userService,
  getUserById,
  listUsers as getUsers,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  updateUserProfile as updateProfile,
  changeUserPassword as changePassword,
  searchUsers,
  getUserProfile
} from './userService';

// Serviços de roles
export { 
  roleService,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getActiveRoles,
  searchRolesByName
} from './roleService';

// Serviços de instituições
export {
  institutionService
} from './institutionService';

// Serviços de cursos
export { 
  courseService,
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getActiveCourses,
  getCoursesByInstitution,
  searchCoursesByName
} from './courseService';

// Tipos de resposta e filtros para conveniência
export type {
  LoginResponse,
  RegisterResponse
} from './authService';

export type {
  RoleFilters,
  RoleListOptions
} from './roleService';

export type {
  CourseFilters,
  CourseListOptions
} from './courseService';

// Tipos de cache e filas
export type {
  CacheConfig,
  CacheEntry
} from './cacheService';

export type {
  QueueJob,
  QueueOptions,
  QueueStats,
  JobHandler
} from './queueService';

// Importa as instâncias dos serviços
import { authService } from './authService';
import { userService } from './userService';
import { roleService } from './roleService';
import { institutionService } from './institutionService';
import { courseService } from './courseService';
import { cacheService, CacheKeys, CacheTTL } from './cacheService';
import { queueService } from './queueService';

// Instâncias dos serviços para uso direto
export const services = {
  auth: authService,
  user: userService,
  role: roleService,
  institution: institutionService,
  course: courseService,
  cache: cacheService,
  queue: queueService
} as const;

// Configuração global dos serviços
export const configureServices = (config: {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cache?: {
    enabled?: boolean;
    defaultTTL?: number;
    prefix?: string;
  };
  queue?: {
    enabled?: boolean;
    pollInterval?: number;
  };
}) => {
  console.log('Configurando serviços:', config);
  
  // Configuração do cache
  if (config.cache) {
    if (config.cache.enabled !== undefined) {
      cacheService.setEnabled(config.cache.enabled);
    }
    if (config.cache.defaultTTL) {
      cacheService.setDefaultTTL(config.cache.defaultTTL);
    }
  }
  
  // Configuração das filas
  if (config.queue) {
    if (config.queue.enabled === false) {
      queueService.stopProcessing();
    } else if (config.queue.enabled === true) {
      queueService.startProcessing();
    }
  }
};

// Utilitários para inicialização
export const initializeServices = async () => {
  try {
    // Verifica se há token válido e tenta obter usuário atual
    if (services.auth.isAuthenticated()) {
      await services.auth.getCurrentUser();
    }
    
    // Pré-aquece cache com dados frequentemente acessados
    await warmupCache();
    
    // Inicia processamento de filas
    services.queue.startProcessing();
    
    console.log('Serviços inicializados com sucesso');
    return true;
  } catch (error) {
    console.log('Erro ao inicializar serviços:', error);
    return false;
  }
};

// Limpeza de dados (logout completo)
export const clearAllData = async () => {
  try {
    await services.auth.logout();
    await services.cache.clear();
    services.queue.stopProcessing();
    console.log('Dados limpos com sucesso');
  } catch (error) {
    console.log('Erro ao limpar dados:', error);
  }
};

// Verificação de saúde dos serviços
export const checkServicesHealth = async () => {
  const health = {
    api: false,
    auth: false,
    cache: false,
    queue: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Testa conectividade básica da API
    const { apiClient } = await import('@/lib/api-client');
    await apiClient.get('/health');
    health.api = true;
  } catch (error) {
    console.warn('API não está respondendo:', error);
  }

  try {
    // Testa se autenticação está funcionando
    if (services.auth.isAuthenticated()) {
      await services.auth.getCurrentUser();
      health.auth = true;
    }
  } catch (error) {
    console.warn('Serviço de autenticação com problemas:', error);
  }

  try {
    // Testa cache
    await services.cache.set('health_check', 'ok', 10);
    const cached = await services.cache.get('health_check');
    health.cache = cached === 'ok';
    await services.cache.delete('health_check');
  } catch (error) {
    console.warn('Serviço de cache com problemas:', error);
  }

  try {
    // Testa filas
    const stats = await services.queue.getStats();
    health.queue = typeof stats.total === 'number';
  } catch (error) {
    console.warn('Serviço de filas com problemas:', error);
  }

  return health;
};

// Interceptadores globais para logging e monitoramento
export const setupGlobalInterceptors = () => {
  // TODO: Implementar interceptadores quando apiClient suportar
  console.log('Interceptadores configurados');
};

// Pré-aquecimento do cache
export const warmupCache = async () => {
  try {
    console.log('Iniciando pré-aquecimento do cache...');
    
    const warmupTasks = [
      {
        key: CacheKeys.ACTIVE_ROLES,
        fetcher: () => services.role.getActiveRoles(),
        ttl: CacheTTL.LONG
      },
      {
        key: CacheKeys.ACTIVE_INSTITUTIONS,
        fetcher: () => institutionService.getActiveInstitutions(),
        ttl: CacheTTL.LONG
      },
      {
        key: CacheKeys.ACTIVE_COURSES,
        fetcher: () => services.course.getActiveCourses(),
        ttl: CacheTTL.LONG
      }
    ];

    await services.cache.warmup(warmupTasks);
    console.log('Cache pré-aquecido com sucesso');
  } catch (error) {
    console.warn('Erro no pré-aquecimento do cache:', error);
  }
};

// Limpeza periódica do cache
export const setupCacheCleanup = () => {
  // Limpa cache expirado a cada hora
  setInterval(async () => {
    try {
      const stats = services.cache.getStats();
      console.log('Estatísticas do cache:', stats);
      
      // Aqui poderia implementar lógica de limpeza mais sofisticada
    } catch (error) {
      console.warn('Erro na limpeza do cache:', error);
    }
  }, 60 * 60 * 1000); // 1 hora
};



// Utilitários para desenvolvimento
export const devUtils = {
  clearCache: () => services.cache.clear(),
  getCacheStats: () => services.cache.getStats(),
  getQueueStats: () => services.queue.getStats(),
  pauseQueue: () => services.queue.pauseQueue(),
  resumeQueue: () => services.queue.resumeQueue(),
  warmupCache,
  checkHealth: checkServicesHealth
};

// Configuração padrão para desenvolvimento
export const setupDevelopmentConfig = () => {
  configureServices({
    baseURL: 'https://portal.sabercon.com.br',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    cache: {
      enabled: true,
      defaultTTL: 300, // 5 minutos
      prefix: 'dev_portal:'
    },
    queue: {
      enabled: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    setupGlobalInterceptors();
    setupCacheCleanup();
    
    // Expõe utilitários no console para desenvolvimento
    if (typeof window !== 'undefined') {
      (window as any).portalDevUtils = devUtils;
    }
  }
};

// Configuração padrão para produção
export const setupProductionConfig = () => {
  configureServices({
    baseURL: 'https://portal.sabercon.com.br',
    timeout: 15000,
    retryAttempts: 2,
    retryDelay: 2000,
    cache: {
      enabled: true,
      defaultTTL: 600, // 10 minutos
      prefix: 'portal:'
    },
    queue: {
      enabled: true
    }
  });
  
  setupCacheCleanup();
};

// Auto-configuração baseada no ambiente
if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    setupProductionConfig();
  } else {
    setupDevelopmentConfig();
  }
}