import { authService } from './auth';
export type { User } from './auth';

// Re-exportar o serviço principal
export { authService };

// Funções de compatibilidade para uso no cliente
export const isAuthenticated = () => authService.isAuthenticated();
export const getCurrentUser = () => authService.getCurrentUser();
export const hasRole = (role: string) => authService.hasRole(role);
export const hasAnyRole = (roles: string[]) => authService.hasAnyRole(roles);
export const getUserInstitutionId = () => authService.getUserInstitutionId();
export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);

export default authService; 