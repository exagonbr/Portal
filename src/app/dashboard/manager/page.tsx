'use client'

import OverviewCards from '@/components/dashboard/OverviewCards'
import Charts from '@/components/dashboard/Charts'
import ActivityTable from '@/components/dashboard/ActivityTable'
import ProductList from '@/components/dashboard/ProductList'
import ChatSection from '@/components/dashboard/ChatSection'
import Leaderboard from '@/components/gamification/Leaderboard'
import RewardCenter from '@/components/gamification/RewardCenter'

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards />

      {/* Charts */}
      <Charts />
      {/* Gamification Management */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Leaderboard />
        <RewardCenter isTeacher={true} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Table - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <ActivityTable />
        </div>

        {/* Right Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          <ProductList />
        </div>
      </div>
    </div>
  )
}
