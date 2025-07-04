// src/types/analytics.ts

/**
 * Representa uma sessão de usuário ativa no sistema.
 */
export interface ActiveSession {
  sessionId: string;
  userId: string;
  username: string;
  role: string;
  loginTime: string; // ISO 8601 format
  lastActivityTime: string; // ISO 8601 format
  ipAddress: string;
}

/**
 * Representa um ponto de dados para gráficos de uso do sistema ao longo do tempo.
 */
export interface SystemUsageDataPoint {
  timestamp: string; // ISO 8601 format
  activeUsers: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
}

export type SystemUsageData = SystemUsageDataPoint[];

/**
 * Representa a distribuição de uso de um tipo de recurso.
 */
export interface ResourceDistribution {
  resourceName: string;
  usageCount: number;
  percentage: number;
}