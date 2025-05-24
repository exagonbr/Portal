'use client'

interface OverviewCardProps {
  title: string
  value: string | number
  icon: string
  trend?: number
  period?: string
}

function OverviewCard({ title, value, icon, trend, period = 'Since last week' }: OverviewCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-2xl font-semibold mt-1">{value}</span>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">{period}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OverviewCards() {
  const stats = [
    { title: 'Document', value: '146.000', icon: '📄', trend: 17 },
    { title: 'Contact', value: '1400', icon: '👥', trend: 17 },
    { title: 'Email', value: '150.700', icon: '📧', trend: 17 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <OverviewCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
