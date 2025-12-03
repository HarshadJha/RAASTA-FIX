import { Moon, Sun, User, Shield, Bell, BarChart3 } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  onToggleTheme: () => void;
  isDark: boolean;
  onAuthClick: () => void;
  onToggleRole?: () => void;
  onOpenAnalytics: () => void;
}

export default function Header({ currentUser, onToggleTheme, isDark, onAuthClick, onToggleRole, onOpenAnalytics }: HeaderProps) {
  const unreadNotifications = currentUser?.notifications?.filter(n => !n.read).length || 0;
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900/80 border-gray-700/50 shadow-2xl' 
        : 'bg-white/80 border-gray-200/50 shadow-xl'
    }`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300">
              <span className="text-3xl font-bold text-white drop-shadow-lg">🛣️</span>
            </div>
            <div>
              <h1 className={`text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm`}>
                RaastaFix
              </h1>
              <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'} tracking-wide`}>
                AI-Powered Civic Solutions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {currentUser && (
              <>
                <button
                  onClick={onOpenAnalytics}
                  className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    isDark 
                      ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700/50' 
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border border-gray-200/50'
                  } backdrop-blur-sm shadow-lg hover:shadow-xl`}
                  title="Analytics Dashboard"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  className={`relative p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    isDark 
                      ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700/50' 
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border border-gray-200/50'
                  } backdrop-blur-sm shadow-lg hover:shadow-xl`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </>
            )}
            {/* Authority mode indicator - no switching allowed */}
            {currentUser && currentUser.role === 'authority' && (
              <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-pink-500 text-white shadow-xl border-2 border-red-400/30 backdrop-blur-sm`}>
                <Shield className="w-5 h-5" />
                <span className="text-sm font-bold hidden sm:inline">
                  Authority Mode
                </span>
              </div>
            )}

            <button
              onClick={onToggleTheme}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'bg-gray-800/80 hover:bg-gray-700/80 text-yellow-400 border border-gray-700/50' 
                  : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 border border-gray-200/50'
              } backdrop-blur-sm shadow-lg hover:shadow-xl`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={onAuthClick}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold border-2 border-orange-400/30 backdrop-blur-sm`}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-bold hidden sm:inline">
                {currentUser ? currentUser.name : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {currentUser?.role === 'authority' && (
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-500 text-white py-3 px-4 text-center text-sm font-bold shadow-2xl backdrop-blur-sm border-t border-red-400/30 animate-pulse">
          🛡️ AUTHORITY MODE ACTIVE - Click pins on the map to review and manage reports
        </div>
      )}
    </header>
  );
}
