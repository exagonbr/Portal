'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import OverviewCards from '@/components/dashboard/OverviewCards'
import Charts from '@/components/dashboard/Charts'
import ActivityTable from '@/components/dashboard/ActivityTable'
import ProductList from '@/components/dashboard/ProductList'
import ChatSection from '@/components/dashboard/ChatSection'
import Leaderboard from '@/components/gamification/Leaderboard'
import RewardCenter from '@/components/gamification/RewardCenter'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if not manager
  useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/dashboard') // This will redirect to appropriate dashboard based on role
    }
  }, [user, router])

  // Return null if user is not authenticated or not a manager
  if (!user || user.role !== 'manager') {
    return null // Loading state handled by redirect
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      </div>

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
