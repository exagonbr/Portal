interface StatsCardProps {
  title: string;
  value: number;
  colorClass: string;
}

export function StatsCard({ title, value, colorClass }: StatsCardProps) {
  return (
    <div className="bg-white p-4 shadow-sm rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}
