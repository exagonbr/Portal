'use client'

import OverviewCards from '@/components/dashboard/OverviewCards'
import Charts from '@/components/dashboard/Charts'
import ActivityTable from '@/components/dashboard/ActivityTable'
import ProductList from '@/components/dashboard/ProductList'
import ChatSection from '@/components/dashboard/ChatSection'

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards />

      {/* Charts */}
      <Charts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Table - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <ActivityTable />
        </div>

        {/* Right Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          <ProductList />
          <ChatSection />
        </div>
      </div>
    </div>
  )
}
