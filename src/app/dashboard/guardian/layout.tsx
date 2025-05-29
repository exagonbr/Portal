import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.GUARDIAN]}>
      {children}
    </RoleGuard>
  );
}