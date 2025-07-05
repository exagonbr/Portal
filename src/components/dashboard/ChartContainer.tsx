import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
}

export function ChartContainer({ title, children, isLoading = false }: ChartContainerProps) {
  return (
    <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse w-full h-3/4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="h-[400px]">
          {children}
        </div>
      )}
    </div>
  );
}
