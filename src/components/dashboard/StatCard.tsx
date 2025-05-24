import { IconType } from 'react-icons';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList,
  FaChartLine
} from 'react-icons/fa';

type StatCardProps = {
  title: string;
  value: string | number;
  type: 'courses' | 'students' | 'classes' | 'assignments' | 'performance';
  trend?: number;
};

const getIcon = (type: string): IconType => {
  switch (type) {
    case 'courses':
      return FaGraduationCap;
    case 'students':
      return FaUsers;
    case 'classes':
      return FaCalendarAlt;
    case 'assignments':
      return FaClipboardList;
    default:
      return FaChartLine;
  }
};

const getGradient = (type: string): string => {
  switch (type) {
    case 'courses':
      return 'from-blue-500 to-blue-600';
    case 'students':
      return 'from-green-500 to-green-600';
    case 'classes':
      return 'from-purple-500 to-purple-600';
    case 'assignments':
      return 'from-orange-500 to-orange-600';
    default:
      return 'from-indigo-500 to-indigo-600';
  }
};

export const StatCard = ({ title, value, type, trend }: StatCardProps) => {
  const Icon = getIcon(type);
  const gradientClass = getGradient(type);

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-8 -translate-y-8`}>
        <Icon className={`w-full h-full bg-gradient-to-br ${gradientClass}`} />
      </div>
      
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend !== undefined && (
                <span className={`text-sm font-medium ${
                  trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
