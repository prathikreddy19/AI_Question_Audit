import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Layers,
  History,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { StatsCard } from '../../components/faculty/StatsCard';
import { QuestionQueueCard } from '../../components/faculty/QuestionQueueCard';
import { useAudit } from '../../contexts/AuditContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState, ErrorState } from '../../components/common/EmptyState';

export function FacultyDashboard() {
  const { queue, stats, auditLogs, loading, errors, retryDashboard, retryQueue,
    analyzePendingReports, isAnalyzingPending } = useAudit();
  const { user } = useAuth();

  // Urgent pending questions
  const urgentQuestions = queue
    .filter((q) => q.aiAnalysis.status === 'pending')
    .sort((a, b) => {
      const urgencyRank = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
      const rankA = urgencyRank[a.aiAnalysis.urgency] || 0;
      const rankB = urgencyRank[b.aiAnalysis.urgency] || 0;
      if (rankB !== rankA) return rankB - rankA;
      return (b.reportsCount || 0) - (a.reportsCount || 0);
    })
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Faculty Review Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Production Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong> • Ensuring JEE/NEET question accuracy for ~8 lakh students
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={analyzePendingReports}
            disabled={isAnalyzingPending}
            aria-busy={isAnalyzingPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95"
          >
            {isAnalyzingPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />}
            <span>{isAnalyzingPending ? 'Analyzing...' : 'Analyze Pending Reports'}</span>
          </button>
          <Link
            to="/faculty/queue"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Open Review Queue ({stats.pendingReviews})</span>
          </Link>
        </div>
      </div>

      {/* Top Statistics Cards */}
      {loading.dashboard ? <LoadingSkeleton variant="stats" count={6} /> : errors.dashboard ? (
        <ErrorState description={errors.dashboard} onRetry={retryDashboard} />
      ) : <StatsCard />}

      {/* Main Grid: Urgent Queue & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (8 cols): Priority Queue Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-bold text-slate-900">
                Top Priority Queue Items
              </h2>
            </div>
            <Link
              to="/faculty/queue"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
            >
              <span>View all ({stats.pendingReviews})</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {errors.queue ? (
              <ErrorState description={errors.queue} onRetry={retryQueue} />
            ) : loading.queue ? (
              <LoadingSkeleton variant="queue" count={2} />
            ) : urgentQuestions.length === 0 ? (
              <EmptyState title="No pending reviews" description="There are no pending review items right now." />
            ) : urgentQuestions.slice(0, 4).map((q) => (
              <QuestionQueueCard key={q.id} question={q} />
            ))}
          </div>
        </div>

        {/* Right Col (4 cols): AI Triage Health & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI System Health Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Triage Velocity
                </h3>
                <p className="text-[11px] text-slate-500">Autonomous Gatekeeper</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Total Student Reports</span>
                <span className="font-bold text-emerald-600">{stats.totalReports}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Pending Reviews</span>
                <span className="font-bold text-slate-800">{stats.pendingReviews}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Auto Applied</span>
                <span className="font-bold text-slate-800">{stats.autoApplied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Faculty Review Route</span>
                <span className="font-bold text-indigo-600">{stats.facultyReview}</span>
              </div>
            </div>
          </div>

          {/* Recent Audit Activity Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Activity
                </h3>
              </div>
              <Link
                to="/faculty/audit"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                All Logs
              </Link>
            </div>

            <div className="space-y-2.5">
              {auditLogs.length === 0 && (
                <p className="text-xs text-slate-500">No audit activity has been recorded yet.</p>
              )}
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 truncate max-w-[160px]">
                      {log.facultyName}
                    </span>
                    <span className="text-slate-400">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium truncate">
                    {log.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
