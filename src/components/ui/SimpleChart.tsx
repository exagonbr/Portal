'use client';

import { motion } from 'framer-motion';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title?: string;
  type?: 'bar' | 'line' | 'area';
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
}

export default function SimpleChart({ 
  data, 
  title, 
  type = 'bar', 
  height = 200, 
  showGrid = true,
  animated = true 
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Dados</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative" style={{ height: `${height}px` }}>
        {/* Grid Lines */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border-t border-gray-100 first:border-t-0"></div>
            ))}
          </div>
        )}

        {/* Chart Content */}
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {data.map((item, index) => {
            const barHeight = getBarHeight(item.value);
            const color = item.color || defaultColors[index % defaultColors.length];
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                {/* Bar */}
                <motion.div
                  initial={animated ? { height: 0 } : false}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="w-full max-w-12 rounded-t-lg relative group cursor-pointer"
                  style={{ backgroundColor: color }}
                >
                  {/* Hover Tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.value}
                  </div>
                  
                  {/* Gradient Effect */}
                  <div 
                    className="absolute inset-0 rounded-t-lg opacity-20"
                    style={{
                      background: `linear-gradient(to top, ${color}, transparent)`
                    }}
                  ></div>
                </motion.div>
                
                {/* Label */}
                <span className="text-xs text-gray-600 mt-2 text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          {[...Array(6)].map((_, index) => {
            const value = Math.round((maxValue / 5) * (5 - index));
            return (
              <span key={index} className="transform -translate-y-1/2">
                {value}
              </span>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {data.slice(0, 4).map((item, index) => {
          const color = item.color || defaultColors[index % defaultColors.length];
          return (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 