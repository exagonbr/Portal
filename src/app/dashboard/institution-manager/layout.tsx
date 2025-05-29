import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function InstitutionManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.INSTITUTION_MANAGER]}>
      {children}
    </RoleGuard>
  );
}