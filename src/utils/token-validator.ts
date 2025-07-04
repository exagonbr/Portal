// Este arquivo foi neutralizado para o desacoplamento do frontend.
// A lógica de validação de token foi mockada.

const MOCKED_TOKEN_KEY = 'auth_token';

export function getCurrentToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MOCKED_TOKEN_KEY);
}

export function validateToken(token?: string): boolean {
  const tokenToValidate = token || getCurrentToken();
  // Em modo desacoplado, qualquer token existente é considerado válido.
  return !!tokenToValidate;
}

export function isAuthenticated(): boolean {
  return validateToken();
}

export function syncTokenWithApiClient(): void {
  // Função desativada em modo desacoplado.
  console.warn("syncTokenWithApiClient foi chamada, mas está desativada.");
}

export function clearAllTokens(): void {
  if (typeof window === 'undefined') return;
  
  // Limpa a chave de token mockado
  localStorage.removeItem(MOCKED_TOKEN_KEY);
  localStorage.removeItem('user_data');

  // Limpa outras chaves por segurança
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('token');
  
  // Limpa cookies se necessário
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
