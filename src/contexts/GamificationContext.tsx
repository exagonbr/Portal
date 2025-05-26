'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  XPProgress, 
  Badge, 
  Reward, 
  LeaderboardEntry,
  GamificationSettings,
  UserBadge
} from '@/types/gamification';
import { XP_LEVELS, BADGES, DEFAULT_REWARDS } from '@/constants/gamification';

interface GamificationContextType {
  xpProgress: XPProgress;
  badges: UserBadge[];
  availableRewards: Reward[];
  leaderboard: LeaderboardEntry[];
  settings: GamificationSettings;
  addXP: (amount: number) => Promise<void>;
  claimReward: (rewardId: string) => Promise<void>;
  toggleLeaderboardVisibility: () => Promise<void>;
  checkBadgeProgress: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [xpProgress, setXPProgress] = useState<XPProgress>({
    currentXP: 0,
    level: 1,
    nextLevelXP: XP_LEVELS.LEVEL_THRESHOLDS[1]
  });

  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [settings, setSettings] = useState<GamificationSettings>({
    showOnLeaderboard: true,
    receiveNotifications: true
  });

  const calculateLevel = (xp: number): number => {
    return XP_LEVELS.LEVEL_THRESHOLDS.findIndex(threshold => xp < threshold) || 1;
  };

  const addXP = async (amount: number) => {
    const newXP = xpProgress.currentXP + amount;
    const newLevel = calculateLevel(newXP);
    const nextThreshold = XP_LEVELS.LEVEL_THRESHOLDS[newLevel] || Infinity;

    setXPProgress({
      currentXP: newXP,
      level: newLevel,
      nextLevelXP: nextThreshold
    });

    // TODO: Update server
    await checkBadgeProgress();
  };

  const claimReward = async (rewardId: string) => {
    const reward = availableRewards.find(r => r.id === rewardId);
    if (!reward || xpProgress.currentXP < reward.xpCost) {
      throw new Error('Cannot claim reward');
    }

    await addXP(-reward.xpCost);
    // TODO: Update server with claimed reward
  };

  const toggleLeaderboardVisibility = async () => {
    const newSettings = {
      ...settings,
      showOnLeaderboard: !settings.showOnLeaderboard
    };
    setSettings(newSettings);
    // TODO: Update server with new settings
  };

  const checkBadgeProgress = async () => {
    const newBadges = BADGES.filter(badge => {
      if (badges.some(b => b.id === badge.id)) return false;

      switch (badge.requirement.type) {
        case 'XP':
          return xpProgress.currentXP >= badge.requirement.threshold;
        // Add other badge requirement checks here
        default:
          return false;
      }
    }).map(badge => ({
      ...badge,
      earnedAt: new Date()
    }));

    if (newBadges.length > 0) {
      setBadges([...badges, ...newBadges]);
      // TODO: Update server with new badges
    }
  };

  // Mock data loading
  useEffect(() => {
    // TODO: Load initial data from server
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        xpProgress,
        badges,
        availableRewards,
        leaderboard,
        settings,
        addXP,
        claimReward,
        toggleLeaderboardVisibility,
        checkBadgeProgress
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
