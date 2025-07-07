// DTO para os dados do painel do sistema
export interface SystemDashboardDto {
  success?: boolean;
  data?: {
    users: { total: number };
    courses: { total: number };
    institutions: { total: number };
    schools: { total: number };
    classes: { total: number };
    users_by_role?: {
      STUDENT: number;
      TEACHER: number;
      COORDINATOR: number;
      ADMIN: number;
      PARENT: number;
      SYSTEM_ADMIN?: number;
    };
  };
  message?: string;
  // Para compatibilidade com respostas diretas
  users?: { total: number };
  courses?: { total: number };
  institutions?: { total: number };
  schools?: { total: number };
  classes?: { total: number };
  users_by_role?: {
    STUDENT: number;
    TEACHER: number;
    COORDINATOR: number;
    ADMIN: number;
    PARENT: number;
    SYSTEM_ADMIN?: number;
  };
}