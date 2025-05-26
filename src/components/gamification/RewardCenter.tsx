'use client';

import { useState } from 'react';
import { useGamification } from '@/contexts/GamificationContext';
import { Reward, RewardType } from '@/types/gamification';

interface RewardFormData {
  name: string;
  description: string;
  xpCost: number;
  type: RewardType;
  expiresAt?: Date;
}

export default function RewardCenter({ isTeacher = false }) {
  const { availableRewards, claimReward } = useGamification();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<RewardFormData>({
    name: '',
    description: '',
    xpCost: 100,
    type: RewardType.CUSTOM
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reward creation API call
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      xpCost: 100,
      type: RewardType.CUSTOM
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reward Center</h3>
        {isTeacher && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Reward
          </button>
        )}
      </div>

      {/* Create Reward Form */}
      {isTeacher && isCreating && (
        <form onSubmit={handleSubmit} className="space-y-4 border-b pb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reward Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                XP Cost
              </label>
              <input
                type="number"
                value={formData.xpCost}
                onChange={(e) => setFormData({ ...formData, xpCost: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as RewardType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {Object.values(RewardType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              onChange={(e) => setFormData({ ...formData, expiresAt: new Date(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Reward
            </button>
          </div>
        </form>
      )}

      {/* Available Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableRewards.map((reward) => (
          <div
            key={reward.id}
            className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{reward.name}</h4>
              <span className="text-sm font-semibold text-blue-500">
                {reward.xpCost} XP
              </span>
            </div>
            <p className="text-sm text-gray-600">{reward.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Type: {reward.type.replace('_', ' ')}
              </span>
              {!isTeacher && (
                <button
                  onClick={() => claimReward(reward.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  Claim
                </button>
              )}
            </div>
            {reward.expiresAt && (
              <div className="text-xs text-red-500">
                Expires: {new Date(reward.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {availableRewards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No rewards available at the moment
        </div>
      )}
    </div>
  );
}
