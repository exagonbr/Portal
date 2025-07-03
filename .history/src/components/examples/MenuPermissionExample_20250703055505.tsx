'use client';

import React from 'react';
import { useMenuPermissions, useMenuSectionPermissions } from '@/hooks/useMenuPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';

// Exemplo de itens de menu
const exampleMenuItems = [
  { href: '/admin/users', label: 'Gerenciar Usuários', permission: 'canManageGlobalUsers' },
  { href: '/admin/system', label: 'Sistema', permission: 'canManageSystem' },
  { href: '/teacher/classes', label: 'Minhas Turmas', permission: 'canManageClasses' },
  { href: '/student/courses', label: 'Meus Cursos', permission: 'canAccessLearningMaterials' },
  { href: '/profile', label: 'Perfil' }, // Sem permissão específica
];

// Exemplo de seções de menu
const exampleMenuSections = [
  {
    section: 'Administração',
    items: [
      { href: '/admin/users', label: 'Usuários', permission: 'canManageGlobalUsers' },
