import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { Report } from '../types';

interface LeaderboardProps {
  reports: Report[];
  isDark: boolean;
}

interface LeaderboardEntry {
  email: string;
  name: string;
  monthlyReports: number;
  totalReports: number;
  rewardsEarned: number;
  reports: Report[];
}

export default function Leaderboard({ reports, isDark }: LeaderboardProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate monthly reports by citizen
  const citizenReportsMap = new Map<string, {
    email: string;
    name: string;
    monthlyReports: Report[];
    allReports: Report[];
    rewardsEarned: number;
  }>();

  reports.forEach(report => {
    if (report.reportedByEmail && report.reportedBy) {
      const reportDate = new Date(report.reportedAt);
      const isThisMonth = reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
      
      if (!citizenReportsMap.has(report.reportedByEmail)) {
        citizenReportsMap.set(report.reportedByEmail, {
          email: report.reportedByEmail,
          name: report.reportedBy,
          monthlyReports: [],
          allReports: [],
          rewardsEarned: 0
        });
      }

      const entry = citizenReportsMap.get(report.reportedByEmail)!;
      entry.allReports.push(report);
      
      if (isThisMonth) {
        entry.monthlyReports.push(report);
      }

      // Count rewards (reports with reward that are in-progress)
      if (report.reward && report.status === 'in-progress') {
        entry.rewardsEarned++;
      }
    }
  });

  // Convert to array and sort by monthly reports
  const leaderboard: LeaderboardEntry[] = Array.from(citizenReportsMap.values())
    .map(entry => ({
      email: entry.email,
      name: entry.name,
      monthlyReports: entry.monthlyReports.length,
      totalReports: entry.allReports.length,
      rewardsEarned: entry.rewardsEarned,
      reports: entry.allReports
    }))
    .sort((a, b) => {
      // Sort by monthly reports first, then by total reports
      if (b.monthlyReports !== a.monthlyReports) {
        return b.monthlyReports - a.monthlyReports;
      }
      return b.totalReports - a.totalReports;
    })
    .slice(0, 20); // Top 20

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <Star className="w-5 h-5 text-gray-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-orange-500';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-500 to-red-500';
    return 'from-blue-500 to-purple-500';
  };

  return (
    <div className={`rounded-3xl backdrop-blur-xl border-2 shadow-2xl p-6 lg:p-8 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' 
        : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
    }`}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <h2 className={`text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent`}>
            Monthly Leaderboard
          </h2>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Top citizens ranked by reports submitted this month • Higher reports = Instant rewards!
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-400'} animate-pulse`} />
          <p className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>No reports this month</p>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Be the first to report and get on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const resolvedReports = entry.reports.filter(r => r.status === 'resolved').length;
            const approvedReports = entry.reports.filter(r => r.status === 'in-progress' && r.reward).length;

            return (
              <div
                key={entry.email}
                className={`p-6 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  isDark
                    ? 'bg-gray-700/50 border-gray-600/50 hover:border-gray-500/50'
                    : 'bg-white/50 border-gray-200/50 hover:border-gray-300/50'
                } ${rank <= 3 ? 'ring-2 ring-opacity-50' : ''} ${
                  rank === 1 ? 'ring-yellow-500' : rank === 2 ? 'ring-gray-400' : rank === 3 ? 'ring-orange-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${getRankColor(rank)} text-white shadow-lg`}>
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {entry.name}
                        </h3>
                        {rank <= 3 && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRankColor(rank)} text-white shadow-lg`}>
                            #{rank}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {entry.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-2xl font-extrabold bg-gradient-to-r ${getRankColor(rank)} bg-clip-text text-transparent`}>
                        {entry.monthlyReports}
                      </div>
                      <div className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        This Month
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className={`p-3 rounded-xl backdrop-blur-sm border-2 ${
                    isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50/80 border-gray-200/50'
                  }`}>
                    <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {entry.totalReports}
                    </div>
                    <div className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Reports
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl backdrop-blur-sm border-2 ${
                    isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50/80 border-green-200/50'
                  }`}>
                    <div className={`text-lg font-bold text-green-500`}>
                      {resolvedReports}
                    </div>
                    <div className={`text-xs font-semibold text-green-600`}>
                      Resolved
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl backdrop-blur-sm border-2 ${
                    isDark ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50/80 border-yellow-200/50'
                  }`}>
                    <div className={`text-lg font-bold text-yellow-500`}>
                      {entry.rewardsEarned}
                    </div>
                    <div className={`text-xs font-semibold text-yellow-600`}>
                      Rewards
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl backdrop-blur-sm border-2 ${
                    isDark ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50/80 border-blue-200/50'
                  }`}>
                    <div className={`text-lg font-bold text-blue-500`}>
                      {approvedReports}
                    </div>
                    <div className={`text-xs font-semibold text-blue-600`}>
                      Approved
                    </div>
                  </div>
                </div>

                {entry.reports.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200/50 dark:border-gray-700/50">
                    <div className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recent Reports ({entry.reports.slice(0, 3).length} of {entry.reports.length}):
                    </div>
                    <div className="space-y-2">
                      {entry.reports.slice(0, 3).map((report) => (
                        <div
                          key={report.id}
                          className={`p-3 rounded-xl backdrop-blur-sm border ${
                            isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50/80 border-gray-200/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xl">{getIssueEmoji(report.type)}</span>
                              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                                {report.title}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              report.status === 'resolved'
                                ? 'bg-green-500/20 text-green-500'
                                : report.status === 'in-progress'
                                ? 'bg-blue-500/20 text-blue-500'
                                : report.status === 'rejected'
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {report.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
