'use client';

import { useGamification } from '@/contexts/GamificationContext';
import { BadgeCategory } from '@/types/gamification';
import { useState } from 'react';

export default function BadgeDisplay() {
  const { badges } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'ALL'>('ALL');

  const filteredBadges = selectedCategory === 'ALL' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const categories = ['ALL', ...Object.values(BadgeCategory)];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Badges</h3>
        <span className="text-sm text-gray-600">{badges.length} Earned</span>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as BadgeCategory | 'ALL')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0) + category.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredBadges.map(badge => (
          <div
            key={badge.id}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="relative w-16 h-16 mb-2">
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="text-sm font-medium text-center">{badge.name}</h4>
            <p className="text-xs text-gray-500 text-center mt-1">
              {badge.description}
            </p>
            <span className="text-xs text-gray-400 mt-1">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No badges earned in this category yet
        </div>
      )}
    </div>
  );
}
