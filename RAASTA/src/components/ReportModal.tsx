import { useState } from 'react';
import { X, MapPin, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { Report } from '../types';

interface ReportModalProps {
  report: Report;
  onClose: () => void;
  onApprove?: (reportId: string) => void;
  onReject?: (reportId: string, reason?: string) => void;
  onResolve?: (reportId: string) => void;
  canApprove: boolean;
  canReject: boolean;
  canResolve: boolean;
  isDark: boolean;
}

export default function ReportModal({ report, onClose, onApprove, onReject, onResolve, canApprove, canReject, canResolve, isDark }: ReportModalProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmReject = () => {
    if (onReject) {
      onReject(report.id, rejectionReason || undefined);
    }
    setShowRejectDialog(false);
    setRejectionReason('');
  };
  const statusColors = {
    pending: 'bg-yellow-500',
    'in-progress': 'bg-blue-500',
    resolved: 'bg-green-500',
    rejected: 'bg-red-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-3xl rounded-3xl shadow-2xl border-2 backdrop-blur-xl ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-700/50' 
          : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200/50'
      } max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 lg:p-8 border-b-2 border-gray-200/50 dark:border-gray-700/50 bg-inherit backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <span className="text-5xl transform hover:scale-110 transition-transform">{getIssueEmoji(report.type)}</span>
            <div>
              <h2 className={`text-3xl font-extrabold mb-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent break-words whitespace-normal`}>
                {report.title}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg ${statusColors[report.status]}`}>
                  {report.status.toUpperCase()}
                </span>
                {report.isRainyHazard && (
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                    🚨 WEATHER HAZARD
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDark 
                ? 'hover:bg-gray-700/80 text-gray-400 border-2 border-gray-700/50' 
                : 'hover:bg-gray-100/80 text-gray-500 border-2 border-gray-200/50'
            } backdrop-blur-sm shadow-lg`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          {report.imageUrl && (
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200/50 dark:border-gray-700/50">
              <img src={report.imageUrl} alt={report.title} className="w-full h-72 lg:h-80 object-cover" />
            </div>
          )}

          <div>
            <h3 className={`text-sm font-bold uppercase mb-4 tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Description
            </h3>
            <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {report.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={`p-5 rounded-2xl backdrop-blur-sm border-2 shadow-lg ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600/50' 
                : 'bg-gray-50/80 border-gray-200/50'
            }`}>
              <div className="flex items-start gap-3">
                <MapPin className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{report.location.address}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl backdrop-blur-sm border-2 shadow-lg ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600/50' 
                : 'bg-gray-50/80 border-gray-200/50'
            }`}>
              <div className="flex items-start gap-3">
                <Calendar className={`w-6 h-6 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reported On
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(report.reportedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl backdrop-blur-sm border-2 shadow-lg ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600/50' 
                : 'bg-gray-50/80 border-gray-200/50'
            }`}>
              <div className="flex items-start gap-3">
                <User className={`w-6 h-6 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reported By
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{report.reportedBy}</p>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl backdrop-blur-sm border-2 shadow-lg ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600/50' 
                : 'bg-gray-50/80 border-gray-200/50'
            }`}>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 mt-0.5 text-center text-xl">
                  {report.priority === 'critical' ? '🔴' : report.priority === 'high' ? '🟠' : '🟡'}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                    {report.priority}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {report.resolvedAt && (
            <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>Resolved</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                This issue was resolved on{' '}
                {new Date(report.resolvedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {report.resolvedBy && ` by ${report.resolvedBy}`}
              </p>
            </div>
          )}

          {report.status === 'rejected' && (
            <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h4 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Rejected</h4>
              </div>
              {report.rejectedAt && (
                <p className={`text-sm mb-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                  Rejected on {new Date(report.rejectedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {report.rejectedBy && ` by ${report.rejectedBy}`}
                </p>
              )}
              {report.rejectionReason && (
                <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                  <strong>Reason:</strong> {report.rejectionReason}
                </p>
              )}
            </div>
          )}

          {report.reward && report.status === 'in-progress' && (
            <div className={`p-4 rounded-xl border-2 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎁</span>
                <h4 className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>Reward Earned!</h4>
              </div>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                You've earned {report.reward.type === 'voucher' ? 'a voucher' : report.reward.type === 'tshirt' ? 'a t-shirt' : 'goodies'} for this approved report!
              </p>
            </div>
          )}

          {canApprove && report.status === 'pending' && onApprove && (
            <div className="flex gap-4">
              <button
                onClick={() => onApprove(report.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <CheckCircle className="w-6 h-6" />
                <span>Approve</span>
              </button>
              {canReject && onReject && (
                <button
                  onClick={handleRejectClick}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <XCircle className="w-6 h-6" />
                  <span>Reject</span>
                </button>
              )}
            </div>
          )}
          {canResolve && report.status === 'in-progress' && onResolve && (
            <button
              onClick={() => onResolve(report.id)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Mark as Fixed & Resolved</span>
            </button>
          )}

          {showRejectDialog && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className={`w-full max-w-md rounded-3xl shadow-2xl border-2 backdrop-blur-xl ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-700/50' 
                  : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200/50'
              } p-8`}>
                <h3 className={`text-2xl font-extrabold mb-2 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent`}>
                  Reject Report
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Please provide a reason for rejecting this report (optional):
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className={`w-full px-5 py-4 rounded-2xl border-2 backdrop-blur-sm mb-6 transition-all duration-300 ${
                    isDark
                      ? 'bg-gray-700/80 border-gray-600/50 text-white placeholder-gray-400 hover:border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500 hover:border-red-400/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                  } focus:outline-none shadow-lg`}
                  placeholder="Reason for rejection..."
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectionReason('');
                    }}
                    className={`flex-1 px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      isDark
                        ? 'bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 border-2 border-gray-600/50'
                        : 'bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 border-2 border-gray-200/50'
                    } backdrop-blur-sm shadow-lg font-bold`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-bold"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {report.isRainyHazard && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-2 border-red-800' : 'bg-red-50 border-2 border-red-200'}`}>
              <h4 className={`font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>⚠️ Weather Alert</h4>
              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                This issue has been flagged as a potential hazard due to current rainy conditions. Please exercise
                extreme caution in this area and prioritize resolution.
              </p>
            </div>
          )}
        </div>
      </div>
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
