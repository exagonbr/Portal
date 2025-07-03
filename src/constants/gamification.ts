export const XP_LEVELS = {
  LEVEL_THRESHOLDS: [
    0,      // Level 1
    100,    // Level 2
    300,    // Level 3
    600,    // Level 4
    1000,   // Level 5
    1500,   // Level 6
    2100,   // Level 7
    2800,   // Level 8
    3600,   // Level 9
    4500    // Level 10
  ],
  XP_REWARDS: {
    ASSIGNMENT_COMPLETE: 50,
    COURSE_COMPLETE: 200,
    PERFECT_ATTENDANCE: 100,
    HELP_OTHERS: 25,
    DAILY_LOGIN: 10
  }
};

import { BadgeCategory, RewardType, RequirementType } from '@/types/gamification';

export const BADGES = [
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 5 assignments in record time',
    category: BadgeCategory.ACADEMIC,
    imageUrl: '/badges/quick-learner.png',
    requirement: {
      type: RequirementType.ASSIGNMENTS,
      threshold: 5
    }
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Reach level 5',
    category: BadgeCategory.ACHIEVEMENT,
    imageUrl: '/badges/knowledge-seeker.png',
    requirement: {
      type: RequirementType.XP,
      threshold: 1000
    }
  },
  {
    id: 'perfect-attendance',
    name: 'Perfect Attendance',
    description: 'Attend all classes for a month',
    category: BadgeCategory.PARTICIPATION,
    imageUrl: '/badges/perfect-attendance.png',
    requirement: {
      type: RequirementType.ATTENDANCE,
      threshold: 20
    }
  },
  {
    id: 'course-master',
    name: 'Course Master',
    description: 'Complete 3 courses with excellence',
    category: BadgeCategory.ACADEMIC,
    imageUrl: '/badges/course-master.png',
    requirement: {
      type: RequirementType.COURSES,
      threshold: 3
    }
  },
  {
    id: 'helpful-peer',
    name: 'Helpful Peer',
    description: 'Help 5 other students in discussions',
    category: BadgeCategory.SOCIAL,
    imageUrl: '/badges/helpful-peer.png',
    requirement: {
      type: RequirementType.CUSTOM,
      threshold: 5
    }
  }
];

export const DEFAULT_REWARDS = [
  {
    id: 'homework-extension',
    name: 'Homework Extension',
    description: 'Get an extra day for any homework assignment',
    xpCost: 300,
    type: RewardType.HOMEWORK_PASS,
    createdBy: 'system'
  },
  {
    id: 'extra-credit',
    name: 'Extra Credit Opportunity',
    description: 'Unlock a special extra credit assignment',
    xpCost: 500,
    type: RewardType.EXTRA_CREDIT,
    createdBy: 'system'
  },
  {
    id: 'choose-group',
    name: 'Group Selection Priority',
    description: 'Get priority in selecting your group for the next project',
    xpCost: 400,
    type: RewardType.SPECIAL_PRIVILEGE,
    createdBy: 'system'
  }
];

export const LEADERBOARD_LIMITS = {
  TOP_STUDENTS: 10,
  RECENT_BADGES: 3
};
