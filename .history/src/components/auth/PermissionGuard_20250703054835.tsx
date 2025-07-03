'use client';

import React, { ReactNode } from 'react';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';
import { UserRole, ROLE_PERMISSIONS } from '@/types/roles';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN];
  permissions?: (keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN])[];
  roles?: UserRole[];
  requireAll?: boolean; // Se true, requer TODAS as permissões. Se false, requer QUALQUER uma
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Componente para proteger conteúdo baseado em permissões e roles
 * 
 * @param children - Conteúdo a ser renderizado se o usuário tiver permissão
 * @param permission - Permissão única requerida
