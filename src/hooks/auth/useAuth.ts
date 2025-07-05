'use client';

import { useAuthSafe as useAuthContext } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

export interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function useAuthHook(options: UseAuthOptions = {}) {
  const { user, isLoading: loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  
  const memoizedOptions = useMemo(() => ({
    required: options.required ?? false,
    redirectTo: options.redirectTo ?? '/auth/login',
    allowedRoles: options.allowedRoles ?? []
  }), [options.required, options.redirectTo, options.allowedRoles]);

  const userRole = user?.role;

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    const shouldRedirectToLogin = memoizedOptions.required && !isAuthenticated && pathname !== memoizedOptions.redirectTo;
    const shouldRedirectToDashboard = user && memoizedOptions.allowedRoles.length > 0 && 
      (!userRole || !memoizedOptions.allowedRoles.includes(userRole)) && pathname !== '/dashboard';

    if (shouldRedirectToLogin) {
      hasRedirected.current = true;
      router.push(memoizedOptions.redirectTo);
      return;
    }

    if (shouldRedirectToDashboard) {
      hasRedirected.current = true;
      router.push('/dashboard');
      return;
    }
  }, [loading, isAuthenticated, userRole, pathname, router, memoizedOptions]);

  // Reset redirect flag when pathname changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  return {
    session: user ? { user } : null, // Compatibilidade com código existente
    status: loading ? 'loading' : (isAuthenticated ? 'authenticated' : 'unauthenticated'),
    isLoading: loading,
    isAuthenticated,
    user,
    hasRole: (role: string) => userRole === role,
    hasAnyRole: (roles: string[]) => roles.includes(userRole || ''),
  };
}
