export interface XPProgress {
  currentXP: number;
  level: number;
  nextLevelXP: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  imageUrl: string;
  requirement: BadgeRequirement;
}

export interface UserBadge extends Badge {
  earnedAt: Date;
}

export enum BadgeCategory {
  ACADEMIC = 'ACADÊMICO',
  PARTICIPATION = 'PARTICIPAÇÃO',
  ACHIEVEMENT = 'CONQUISTA',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'ESPECIAL'
}

export enum RequirementType {
  XP = 'XP',
  ASSIGNMENTS = 'TAREFAS',
  ATTENDANCE = 'PRESENÇA',
  COURSES = 'CURSOS',
  CUSTOM = 'PERSONALIZADO'
}

export interface BadgeRequirement {
  type: RequirementType;
  threshold: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  type: RewardType;
  createdBy: string; // ID do professor
  expiresAt?: Date;
}

export enum RewardType {
  HOMEWORK_PASS = 'DISPENSA_DE_TAREFA',
  EXTRA_CREDIT = 'CRÉDITO_EXTRA',
  SPECIAL_PRIVILEGE = 'PRIVILÉGIO_ESPECIAL',
  CUSTOM = 'PERSONALIZADO'
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  xp: number;
  level: number;
  recentBadges: UserBadge[];
}

export interface GamificationSettings {
  showOnLeaderboard: boolean;
  receiveNotifications: boolean;
}
