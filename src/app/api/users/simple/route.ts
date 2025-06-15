/**
 * Rota simplificada para usuários usando o utilitário de proxy
 */

import { createProxyRoute } from '@/lib/api-proxy';

// Cria todas as rotas (GET, POST, PUT, DELETE, PATCH) automaticamente
const routes = createProxyRoute('/users', {
  requireAuth: true,
  allowedRoles: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'],
});

export const { GET, POST, PUT, DELETE, PATCH } = routes; 