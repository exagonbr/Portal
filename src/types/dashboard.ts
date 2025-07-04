// DTO para os dados do painel do sistema
export interface SystemDashboardDto {
  users: { total: number };
  courses: { total: number };
  institutions: { total: number };
  schools: { total: number };
  classes: { total: number };
}