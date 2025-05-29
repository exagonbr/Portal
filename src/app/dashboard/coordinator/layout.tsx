import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.ACADEMIC_COORDINATOR]}>
      {children}
    </RoleGuard>
  );
}