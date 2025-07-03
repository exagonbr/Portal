'use client';

import { useGamification } from '@/contexts/GamificationContext';
import { LEADERBOARD_LIMITS } from '@/constants/gamification';

export default function Leaderboard() {
  const { leaderboard, settings, toggleLeaderboardVisibility } = useGamification();

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Leaderboard</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show my ranking</span>
          <button
            onClick={toggleLeaderboardVisibility}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showOnLeaderboard ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showOnLeaderboard ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                XP
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recent Badges
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.slice(0, LEADERBOARD_LIMITS.TOP_STUDENTS).map((entry, index) => (
              <tr key={entry.userId} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  #{index + 1}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {entry.username}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {entry.level}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {entry.xp}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {entry.recentBadges
                      .slice(0, LEADERBOARD_LIMITS.RECENT_BADGES)
                      .map((badge) => (
                        <img
                          key={badge.id}
                          src={badge.imageUrl}
                          alt={badge.name}
                          className="w-6 h-6 rounded-full border-2 border-white"
                          title={badge.name}
                        />
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leaderboard data available
          </div>
        )}
      </div>
    </div>
  );
}
