'use client';

import RoleGuard from '@/components/auth/RoleGuard';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';
import { UserRole } from '@/types/roles';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.ACADEMIC_COORDINATOR, UserRole.TEACHER, UserRole.STUDENT]}>
      <DashboardPageLayout title="Portal do Estudante">
        {children}
      </DashboardPageLayout>
    </RoleGuard>
  )
} 