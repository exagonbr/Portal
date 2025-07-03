import { login, register, getCurrentUser, logout, isAuthenticated } from './authService';

export type { LoginResponse, RegisterResponse } from './authService';


// Funções de compatibilidade para uso no cliente
export { login, getCurrentUser, logout, isAuthenticated };

// Manter apenas hasRole e hasAnyRole que são específicos do clientAuth
export const hasRole = async (role: string) => {
  const user = await getCurrentUser();
  return user?.role === role;
};


export const hasAnyRole = async (roles: string[]) => {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role) : false;
};


export const getUserInstitutionId = async () => {
  const user = await getCurrentUser();
  return user?.institutionId || null;
};


export default {
  login,
  register,
  getCurrentUser,
  logout,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  getUserInstitutionId
};
