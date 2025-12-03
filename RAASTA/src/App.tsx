import { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ReportForm from './components/ReportForm';
import MapView from './components/MapView';
import MyReports from './components/MyReports';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import ReportModal from './components/ReportModal';
import AIChatbot from './components/AIChatbot';
import VoiceControl from './components/VoiceControl';
import Analytics from './components/Analytics';
import { Report, User, Theme } from './types';
import { storageUtils } from './utils/storage';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthorityAuth, setShowAuthorityAuth] = useState(false);

  useEffect(() => {
    const savedUser = storageUtils.getCurrentUser();
    if (savedUser) {
      const updatedUser = {
        ...savedUser,
        notifications: savedUser.notifications || [],
        reportsSubmitted: savedUser.reportsSubmitted || 0,
        reportsResolved: savedUser.reportsResolved || 0,
        reputation: savedUser.reputation || 0,
        joinedAt: savedUser.joinedAt || new Date().toISOString(),
        rewardsEarned: savedUser.rewardsEarned || 0
      };
      setCurrentUser(updatedUser);
    } else {
      setShowAuthModal(true);
    }

    const savedReports = storageUtils.getReports();
    const migratedReports = savedReports.map(report => ({
      ...report,
      upvotes: report.upvotes || 0,
      downvotes: report.downvotes || 0,
      votedBy: report.votedBy || [],
      comments: report.comments || [],
      views: report.views || 0,
      shareCount: report.shareCount || 0,
      tags: report.tags || [report.type],
      reportedByEmail: report.reportedByEmail || 'user@example.com'
    }));
    setReports(migratedReports);

    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAuth = (user: User) => {
    const newUser = {
      ...user,
      notifications: [],
      reportsSubmitted: 0,
      reportsResolved: 0,
      reputation: 100,
      joinedAt: new Date().toISOString(),
      rewardsEarned: 0
    };
    setCurrentUser(newUser);
    storageUtils.setCurrentUser(newUser);
    storageUtils.saveUser(newUser);
  };

  const handleSubmitReport = (report: Report) => {
    storageUtils.saveReport(report);
    setReports([...reports, report]);

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        reportsSubmitted: currentUser.reportsSubmitted + 1,
        reputation: currentUser.reputation + 10
      };
      setCurrentUser(updatedUser);
      storageUtils.setCurrentUser(updatedUser);
    }
  };

  const handleApproveReport = (reportId: string) => {
    if (!currentUser || currentUser.role !== 'authority') return;
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Generate random reward
    const rewardTypes: ('voucher' | 'tshirt' | 'goodies')[] = ['voucher', 'tshirt', 'goodies'];
    const randomReward = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];

    const updates: Partial<Report> = {
      status: 'in-progress',
      reward: {
        type: randomReward,
        claimed: false
      }
    };
    storageUtils.updateReport(reportId, updates);
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, ...updates } : r
      )
    );

    // Send notification to citizen
    if (report.reportedByEmail) {
      const rewardMessages = {
        voucher: 'a voucher',
        tshirt: 'a t-shirt',
        goodies: 'goodies'
      };
      const notification = {
        id: Date.now().toString(),
        type: 'approval' as const,
        message: `Your report "${report.title}" has been approved by ${currentUser.name}! You've earned ${rewardMessages[randomReward]} as a reward. Check your rewards section.`,
        reportId,
        read: false,
        timestamp: new Date().toISOString(),
        reward: {
          type: randomReward
        }
      };
      storageUtils.addNotificationToUser(report.reportedByEmail, notification);

      // Update citizen's rewards count
      const allUsers = storageUtils.getUsers();
      const citizenUser = allUsers.find(u => u.email === report.reportedByEmail);
      if (citizenUser) {
        const updatedCitizen = {
          ...citizenUser,
          rewardsEarned: (citizenUser.rewardsEarned || 0) + 1
        };
        storageUtils.saveUser(updatedCitizen);
        // Update current user if it's the citizen
        if (currentUser.email === report.reportedByEmail) {
          setCurrentUser(updatedCitizen);
          storageUtils.setCurrentUser(updatedCitizen);
        }
      }
    }

    setSelectedReport(null);
  };

  const handleRejectReport = (reportId: string, reason?: string) => {
    if (!currentUser || currentUser.role !== 'authority') return;
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const updates: Partial<Report> = {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: currentUser.name,
      rejectionReason: reason || 'Report does not meet requirements'
    };
    storageUtils.updateReport(reportId, updates);
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, ...updates } : r
      )
    );

    // Send notification to citizen
    if (report.reportedByEmail) {
      const notification = {
        id: Date.now().toString(),
        type: 'rejection' as const,
        message: `Your report "${report.title}" has been rejected by ${currentUser.name}.${reason ? ` Reason: ${reason}` : ''}`,
        reportId,
        read: false,
        timestamp: new Date().toISOString()
      };
      storageUtils.addNotificationToUser(report.reportedByEmail, notification);
    }

    setSelectedReport(null);
  };

  const handleResolveReport = (reportId: string) => {
    if (!currentUser || currentUser.role !== 'authority') return;
    const updates: Partial<Report> = {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: currentUser.name
    };
    storageUtils.updateReport(reportId, updates);
    setReports(
      reports.map((r) =>
        r.id === reportId ? { ...r, ...updates } : r
      )
    );
    // send notification to the reporting user
    const resolvedReport = reports.find(r => r.id === reportId);
    if (resolvedReport && resolvedReport.reportedByEmail) {
      const notification = {
        id: Date.now().toString(),
        type: 'resolution',
        message: `Your report "${resolvedReport.title}" has been resolved by ${currentUser.name}. Please check the app for details.`,
        reportId,
        read: false,
        timestamp: new Date().toISOString()
      };
      storageUtils.addNotificationToUser(resolvedReport.reportedByEmail, notification as any);
    }
    const updatedUser = {
      ...currentUser,
      reportsResolved: currentUser.reportsResolved + 1,
      reputation: currentUser.reputation + 25
    };
    setCurrentUser(updatedUser);
    storageUtils.setCurrentUser(updatedUser);
    setSelectedReport(null);
  };

  const handleAuthorityClick = () => {
    if (!currentUser) {
      setShowAuthorityAuth(true);
      return;
    }

    if (currentUser.role !== 'authority') {
      // Request authority authentication
      setShowAuthorityAuth(true);
      return;
    }

    // Role switching disabled - authority and citizen cannot switch
    alert('Role switching is not allowed. Please sign out and sign in with the appropriate account.');
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleReportClick = (report: Report) => {
    const updatedReports = reports.map(r =>
      r.id === report.id ? { ...r, views: r.views + 1 } : r
    );
    setReports(updatedReports);
    storageUtils.updateReport(report.id, { views: report.views + 1 });
    setSelectedReport(updatedReports.find(r => r.id === report.id) || report);
  };

  const handleAuthClick = () => {
    if (currentUser) {
      if (confirm('Are you sure you want to sign out?')) {
        setCurrentUser(null);
        storageUtils.setCurrentUser(null);
        setShowAuthModal(true);
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case 'open-report':
        document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'show-map':
        document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'my-reports':
        setFilterType('my-reports');
        break;
      case 'help':
        break;
      case 'toggle-theme':
        handleToggleTheme();
        break;
    }
  };

  const filteredReports = reports.filter(report => {
    if (filterType === 'my-reports' && currentUser) {
      if (report.reportedByEmail !== currentUser.email) return false;
    }
    if (filterType !== 'all' && filterType !== 'my-reports') {
      if (report.type !== filterType) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        report.location.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen w-full ${isDark ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50'} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDark ? 'bg-orange-500/10' : 'bg-orange-400/20'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDark ? 'bg-red-500/10' : 'bg-red-400/20'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 ${isDark ? 'bg-purple-500/5' : 'bg-purple-400/15'} rounded-full blur-3xl animate-pulse delay-2000`}></div>
      </div>

      <Header
        currentUser={currentUser}
        onToggleTheme={handleToggleTheme}
        isDark={isDark}
        onAuthClick={handleAuthClick}
        onToggleRole={handleAuthorityClick}
        onOpenAnalytics={() => setShowAnalytics(true)}
      />

      <main className="relative z-10 w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10">
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="space-y-4">
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent leading-tight animate-fade-in drop-shadow-2xl`}>
                Smart Civic Reporting Platform
              </h1>
              <p className={`text-lg sm:text-xl md:text-2xl font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-3xl`}>
                AI-powered voice assistance • Real-time tracking • Community-driven solutions
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-gray-800/80 border-gray-700/50 text-white placeholder-gray-400 hover:border-orange-500/50 focus:border-orange-500 focus:bg-gray-800/90'
                    : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-500 hover:border-orange-400/50 focus:border-orange-500 focus:bg-white/90 shadow-xl'
                } focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-lg`}
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-6 py-4 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
                isDark
                  ? 'bg-gray-800/80 border-gray-700/50 text-white hover:border-orange-500/50 focus:border-orange-500 focus:bg-gray-800/90'
                  : 'bg-white/80 border-gray-200/50 text-gray-900 hover:border-orange-400/50 focus:border-orange-500 focus:bg-white/90 shadow-xl'
              } focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-lg font-medium cursor-pointer`}
            >
              <option value="all">All Reports</option>
              {currentUser && <option value="my-reports">My Reports</option>}
              <option value="pothole">🕳️ Potholes</option>
              <option value="streetlight">💡 Streetlights</option>
              <option value="water-leak">💧 Water Leak</option>
              <option value="waste">🗑️ Waste</option>
              <option value="manhole">⚠️ Manhole</option>
            </select>
          </div>
        </div>

        <Stats reports={filteredReports} isDark={isDark} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
          <div id="report-form" className="lg:col-span-1">
            {currentUser ? (
              currentUser.role === 'citizen' ? (
                <ReportForm
                  onSubmit={handleSubmitReport}
                  currentUserName={currentUser.name}
                  currentUserEmail={currentUser.email}
                  isDark={isDark}
                />
              ) : (
                <div className={`rounded-3xl backdrop-blur-xl border-2 shadow-2xl p-8 lg:p-10 text-center transition-all duration-300 hover:scale-[1.02] ${
                  isDark 
                    ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' 
                    : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
                }`}>
                  <div className="text-7xl mb-6 animate-bounce">🛡️</div>
                  <p className={`text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent`}>
                    Authority Mode
                  </p>
                  <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Only citizens can report issues. Click on map pins to review and manage reports.
                  </p>
                </div>
              )
            ) : (
              <div className={`rounded-3xl backdrop-blur-xl border-2 shadow-2xl p-8 lg:p-10 text-center transition-all duration-300 hover:scale-[1.02] ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50' 
                  : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
              }`}>
                <div className="text-7xl mb-6 animate-pulse">🚧</div>
                <p className={`text-2xl font-bold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Sign In to Report Issues
                </p>
                <p className={`text-base mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Join our community and help make your city better
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className={`rounded-3xl overflow-hidden shadow-2xl border-2 backdrop-blur-xl transition-all duration-300 hover:shadow-3xl ${
              isDark ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200/50 bg-white/30'
            }`}>
              <MapView reports={filteredReports} onReportClick={handleReportClick} isDark={isDark} />
            </div>
          </div>
        </div>

        {/* My Reports Section - Only for Citizens */}
        {currentUser && currentUser.role === 'citizen' && (
          <div className="mt-8 lg:mt-12">
            <MyReports 
              reports={reports.filter(r => r.reportedByEmail === currentUser.email)} 
              currentUser={currentUser} 
              isDark={isDark} 
            />
          </div>
        )}

        {/* Leaderboard Section - Shows all citizens ranked by monthly reports */}
        <div className="mt-8 lg:mt-12">
          <Leaderboard reports={reports} isDark={isDark} />
        </div>
      </main>

      {showAuthModal && !currentUser && (
        <AuthModal onClose={() => setShowAuthModal(false)} onAuth={handleAuth} isDark={isDark} />
      )}

      {showAuthorityAuth && (
        <AuthModal
          onClose={() => setShowAuthorityAuth(false)}
          onAuth={user => {
            if (user.role === 'authority') {
              setCurrentUser(user);
              storageUtils.setCurrentUser(user);
              storageUtils.saveUser(user);
              setShowAuthorityAuth(false);
            }
          }}
          isDark={isDark}
        />
      )}

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={handleApproveReport}
          onReject={handleRejectReport}
          onResolve={handleResolveReport}
          canApprove={currentUser?.role === 'authority' && selectedReport.status === 'pending'}
          canReject={currentUser?.role === 'authority' && selectedReport.status === 'pending'}
          canResolve={currentUser?.role === 'authority' && selectedReport.status === 'in-progress'}
          isDark={isDark}
        />
      )}

      {showAnalytics && (
        <Analytics
          reports={reports}
          isDark={isDark}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      <AIChatbot isDark={isDark} />
      <VoiceControl isDark={isDark} onCommand={handleVoiceCommand} />
    </div>
  );
}

export default App;
