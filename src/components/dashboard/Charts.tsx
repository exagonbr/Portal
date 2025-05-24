'use client'

interface ChartProps {
  title: string
  type: 'line' | 'bar'
  trend: number
}

export function Chart({ title, type, trend }: ChartProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center mt-1">
            <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {type === 'line' ? (
          <div className="h-48 flex items-end space-x-2">
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[60%]"></div>
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[40%]"></div>
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[80%]"></div>
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[60%]"></div>
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[90%]"></div>
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[70%]"></div>
            <div className="flex-1 bg-blue-500/20 rounded-t-lg h-[100%]"></div>
          </div>
        ) : (
          <div className="h-48 flex items-end space-x-2">
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[60%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[40%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[80%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[60%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[90%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[70%]"></div>
            <div className="flex-1 bg-blue-500 rounded-t-lg h-[100%]"></div>
          </div>
        )}
        
        <div className="grid grid-cols-7 gap-2 mt-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month) => (
            <div key={month} className="text-center text-sm text-gray-500">
              {month}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Chart title="Recent Workflow" type="line" trend={17} />
      <Chart title="Recent Marketing" type="bar" trend={17} />
    </div>
  )
}
