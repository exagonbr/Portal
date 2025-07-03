export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  INSTITUTION_MANAGER = 'INSTITUTION_MANAGER',
  ACADEMIC_COORDINATOR = 'ACADEMIC_COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN'
}

export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'Acesso completo de administrador',
  [UserRole.INSTITUTION_MANAGER]: 'Gestor',
  [UserRole.ACADEMIC_COORDINATOR]: 'Coordenador Pedagógico',
  [UserRole.TEACHER]: 'Professor',
  [UserRole.STUDENT]: 'Aluno',
  [UserRole.GUARDIAN]: 'Responsável'
};
