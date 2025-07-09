/**
 * Serviço para realizar logout ultra-completo
 * Limpa todos os dados de autenticação
 */

import { UnifiedAuthService } from '@/services/unifiedAuthService';

/**
 * Realiza um logout completo, limpando todos os dados
 */
export async function performUltraLogout(): Promise<void> {
  // Usar o método completo do UnifiedAuthService
  await UnifiedAuthService.performCompleteLogout(true);
} 