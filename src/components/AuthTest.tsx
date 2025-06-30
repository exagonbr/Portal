'use client';

import { useAuth, useAuthSafe } from '@/contexts/AuthContext';

export function AuthTest() {
  // Test the safe version first
  const authContextSafe = useAuthSafe();
  // Always call useAuth hook to avoid conditional hook calls
  const { user, loading, isAuthenticated } = useAuth();
  
  if (!authContextSafe) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-semibold text-yellow-800">AuthContext Loading</h3>
        <p className="text-yellow-700">O contexto de autenticação ainda está carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <h3 className="font-semibold text-green-800">AuthContext Loaded Successfully</h3>
      <div className="text-green-700 space-y-1">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
        <p>User: {user ? user.name : 'null'}</p>
      </div>
    </div>
  );
}
