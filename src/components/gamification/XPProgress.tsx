'use client';

import { useGamification } from '@/contexts/GamificationContext';

export default function XPProgress() {
  const { xpProgress } = useGamification();
  const progressPercentage = ((xpProgress.currentXP - 0) / (xpProgress.nextLevelXP - 0)) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Level {xpProgress.level}</h3>
        <span className="text-sm text-gray-600">
          {xpProgress.currentXP} / {xpProgress.nextLevelXP} XP
        </span>
      </div>
      
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      <div className="text-sm text-gray-600">
        {xpProgress.nextLevelXP - xpProgress.currentXP} XP until next level
      </div>
    </div>
  );
}
