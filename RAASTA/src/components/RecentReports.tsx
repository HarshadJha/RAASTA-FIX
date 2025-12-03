import { Clock, MapPin, AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react';
import { Report } from '../types';

interface RecentReportsProps {
  reports: Report[];
  isDark: boolean;
}

const statusIcons = {
  pending: AlertCircle,
  'in-progress': Loader,
  resolved: CheckCircle,
  rejected: XCircle
};

const statusColors = {
  pending: 'text-yellow-500',
  'in-progress': 'text-blue-500',
  resolved: 'text-green-500',
  rejected: 'text-red-500'
};

export default function RecentReports({ reports, isDark }: RecentReportsProps) {
  const sortedReports = [...reports].sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );

  const recentReports = sortedReports.slice(0, 10);

  return (
    <div className={`rounded-3xl backdrop-blur-xl border-2 shadow-2xl p-6 lg:p-8 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' 
        : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
    }`}>
      <div className="mb-8">
        <h2 className={`text-3xl font-extrabold mb-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent`}>
          Recent Reports
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Latest community reports
        </p>
      </div>

      {recentReports.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-400'} animate-pulse`} />
          <p className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No reports yet</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Be the first to report a civic issue!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {recentReports.map((report) => {
            const StatusIcon = statusIcons[report.status];

            return (
              <div
                key={report.id}
                className={`p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  isDark
                    ? 'bg-gray-700/50 border-gray-600/50 hover:border-gray-500/50'
                    : 'bg-white/50 border-gray-200/50 hover:border-gray-300/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl flex-shrink-0 transform hover:scale-110 transition-transform">{getIssueEmoji(report.type)}</div>
                      <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} break-words whitespace-normal`}>
                          {report.title}
                        </h3>
                        {report.isRainyHazard && (
                          <span className="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            🚨 HAZARD
                          </span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'} whitespace-normal break-words`}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'} border-2 ${
                    isDark ? 'border-gray-700/50' : 'border-gray-200/50'
                  }`}>
                    <StatusIcon className={`w-6 h-6 ${statusColors[report.status]}`} />
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm mb-4">
                  <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <MapPin className="w-4 h-4" />
                    <span className="break-words whitespace-normal font-medium">{report.location.address.split(',').slice(0, 2).join(',')}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{formatRelativeTime(report.reportedAt)}</span>
                  </div>
                </div>

                {report.imageUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200/50 dark:border-gray-700/50">
                    <img src={report.imageUrl} alt={report.title} className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-gray-200/50 dark:border-gray-700/50">
                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    By {report.reportedBy}
                  </span>
                  <span
                    className={`text-xs font-bold px-4 py-2 rounded-full shadow-lg ${
                      report.status === 'resolved'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : report.status === 'in-progress'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        : report.status === 'rejected'
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                    }`}
                  >
                    {report.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getIssueEmoji(type: Report['type']): string {
  const emojis = {
    pothole: '🕳️',
    streetlight: '💡',
    'water-leak': '💧',
    waste: '🗑️',
    manhole: '⚠️'
  };
  return emojis[type];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
