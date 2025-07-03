/**
 * Rotas simplificadas para queue usando o utilitário de proxy
 */

import { createProxyRoute } from '@/lib/api-proxy';

// Cria todas as rotas automaticamente
const routes = createProxyRoute('/queue', {
  requireAuth: true,
  allowedRoles: ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'],
});

export const { GET, POST, PUT, DELETE, PATCH } = routes; 
