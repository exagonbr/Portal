'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';
import { UserRole } from '@/types/roles';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT]}>
      <DashboardLayout >
        {children}
      </DashboardLayout>
    </RoleGuard>
  )
} 