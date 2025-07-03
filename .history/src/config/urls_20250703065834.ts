// Configuração centralizada de URLs
export const getApiUrl = () => {
  // Em produção, usa a URL do frontend como base
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
  }
  
  // Em desenvolvimento, usa as URLs específicas
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
};

export const getBackendUrl = () => {
  // Remove /api se já estiver incluído
  const apiUrl = getApiUrl();
  return apiUrl.replace(/\/api$/, '');
};

// Função helper para construir URLs completas
export const buildApiUrl = (path: string) => {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Se o baseUrl já termina com /api, não adiciona novamente
  if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api')) {
    return `${baseUrl}${cleanPath.substring(4)}`;
  }
  
  return `${baseUrl}${cleanPath}`;
};

// Função para URLs internas (server-side)
export const getInternalApiUrl = (path?: string) => {
  const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001/api';
  
  if (!path) return backendUrl;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Se o backendUrl já termina com /api e o path começa com /api
  if (backendUrl.endsWith('/api') && cleanPath.startsWith('/api')) {
    return `${backendUrl}${cleanPath.substring(4)}`;
  }
  
  return `${backendUrl}${cleanPath}`;
};