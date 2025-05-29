import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.SYSTEM_ADMIN]}>
      {children}
    </RoleGuard>
  );
}