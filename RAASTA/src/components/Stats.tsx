import { TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Report } from '../types';

interface StatsProps {
  reports: Report[];
  isDark: boolean;
}

// Leaderboard component will be in separate file
export interface LeaderboardEntry {
  email: string;
  name: string;
  monthlyReports: number;
  totalReports: number;
  rewardsEarned: number;
  reports: Report[];
}

export default function Stats({ reports, isDark }: StatsProps) {
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const inProgressReports = reports.filter((r) => r.status === 'in-progress').length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;
  const rejectedReports = reports.filter((r) => r.status === 'rejected').length;
  const criticalReports = reports.filter((r) => r.isRainyHazard).length;

  const stats = [
    {
      label: 'Total Reports',
      value: totalReports,
      icon: TrendingUp,
      color: 'blue',
      bgColor: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      label: 'Pending',
      value: pendingReports,
      icon: Clock,
      color: 'yellow',
      bgColor: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
      iconColor: 'text-yellow-500'
    },
    {
      label: 'In Progress',
      value: inProgressReports,
      icon: AlertCircle,
      color: 'purple',
      bgColor: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
      iconColor: 'text-purple-500'
    },
    {
      label: 'Resolved',
      value: resolvedReports,
      icon: CheckCircle,
      color: 'green',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50',
      iconColor: 'text-green-500'
    },
    {
      label: 'Rejected',
      value: rejectedReports,
      icon: XCircle,
      color: 'red',
      bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50',
      iconColor: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-3xl backdrop-blur-xl border-2 shadow-xl p-6 lg:p-8 transition-all duration-300 hover:scale-110 hover:shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg`}>
                <Icon className={`w-7 h-7 ${stat.iconColor}`} />
              </div>
              {stat.label === 'Pending' && criticalReports > 0 && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  {criticalReports} 🚨
                </span>
              )}
            </div>
            <div className={`text-4xl lg:text-5xl font-extrabold mb-2 bg-gradient-to-r ${isDark ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className={`text-sm font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
