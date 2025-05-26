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
  ACADEMIC = 'ACADEMIC',
  PARTICIPATION = 'PARTICIPATION',
  ACHIEVEMENT = 'ACHIEVEMENT',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'SPECIAL'
}

export enum RequirementType {
  XP = 'XP',
  ASSIGNMENTS = 'ASSIGNMENTS',
  ATTENDANCE = 'ATTENDANCE',
  COURSES = 'COURSES',
  CUSTOM = 'CUSTOM'
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
  createdBy: string; // teacher ID
  expiresAt?: Date;
}

export enum RewardType {
  HOMEWORK_PASS = 'HOMEWORK_PASS',
  EXTRA_CREDIT = 'EXTRA_CREDIT',
  SPECIAL_PRIVILEGE = 'SPECIAL_PRIVILEGE',
  CUSTOM = 'CUSTOM'
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
