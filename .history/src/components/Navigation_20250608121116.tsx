'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { UserRole } from '../types/auth';
import { ROLE_LABELS } from '../types/roles';

export const Navigation = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const commonNavItems = [
    { href: '/', label: '' }, // Assuming this is for the logo or home, label can be empty
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
};

export default Navigation;
