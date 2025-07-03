// API Configuration - Centralizada (sem dependência circular)
const getApiConfig = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api';
    
  return {
    BASE_URL: apiUrl,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  } as const;
};

export const API_CONFIG = getApiConfig();

// Backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper functions sem dependência circular
export const getApiUrl = (path: string = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.BASE_URL}${cleanPath}`;
};

export const getInternalApiUrl = (path: string = '') => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Date format
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Authentication
export const TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const TOKEN_EXPIRY_KEY = 'tokenExpiry';

// Theme
export const THEME_KEY = 'theme';
export const DEFAULT_THEME = 'light';

// Locale
export const DEFAULT_LOCALE = 'pt-BR';

// Cache
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request timeouts
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Por favor, faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION: 'Por favor, verifique os dados informados.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso!',
  UPDATED: 'Atualizado com sucesso!',
  DELETED: 'Excluído com sucesso!',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  INSTITUTIONS: '/institutions',
  USERS: '/users',
  COURSES: '/courses',
};
