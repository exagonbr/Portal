import RoleGuard from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/roles';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.TEACHER]}>
      {children}
    </RoleGuard>
  );
}
