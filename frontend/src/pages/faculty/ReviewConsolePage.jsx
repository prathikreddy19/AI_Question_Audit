import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  MessageSquare,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ArrowLeft,
  Smartphone,
  Globe,
  Apple,
} from 'lucide-react';
import { MathViewer } from '../../components/student/MathViewer';
import { AIReviewCard } from '../../components/faculty/AIReviewCard';
import { ReportCard } from '../../components/common/ReportCard';
import { StatusBadge, UrgencyBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAudit } from '../../contexts/AuditContext';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { facultyService } from '../../services/facultyService';
import { getApiErrorMessage } from '../../services/api';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/EmptyState';

export function ReviewConsolePage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { queue } = useAudit();

  const [showSolution, setShowSolution] = useState(true);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuestion(await facultyService.getReview(reportId));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => { loadReview(); }, [loadReview]);

  // Queue navigation is keyed by the backend's reportId.
  const reportedQuestions = queue;
  const queueIndex = reportedQuestions.findIndex((q) => q.reportId === reportId);

  const prevQuestion = queueIndex > 0 ? reportedQuestions[queueIndex - 1] : null;
  const nextQuestion =
    queueIndex < reportedQuestions.length - 1
      ? reportedQuestions[queueIndex + 1]
      : null;

  if (loading) return <LoadingSkeleton variant="console" />;
  if (error) return <ErrorState description={error} onRetry={loadReview} />;

  if (!question) {
    return (
      <EmptyState
        title="Question Not Found"
        description="The requested question ID could not be located in the current database."
        actionLabel="Back to Review Queue"
        onAction={() => navigate('/faculty/queue')}
      />
    );
  }

  const getSourceIcon = (source = 'web') => {
    switch (source.toLowerCase()) {
      case 'android':
        return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'ios':
        return <Apple className="w-3.5 h-3.5 text-slate-800" />;
      case 'web':
      default:
        return <Globe className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/faculty/queue"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            title="Back to queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">
                {question.qid || question.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {question.subject}
              </span>
              <UrgencyBadge urgency={question.aiAnalysis.urgency} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Review Queue Item {queueIndex + 1} of {reportedQuestions.length}
            </p>
          </div>
        </div>

        {/* Prev / Next Queue Cycling Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => prevQuestion && navigate(`/faculty/queue/${encodeURIComponent(prevQuestion.reportId)}`)}
            disabled={!prevQuestion}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => nextQuestion && navigate(`/faculty/queue/${encodeURIComponent(nextQuestion.reportId)}`)}
            disabled={!nextQuestion}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Question Viewer, Right AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Question Viewer & Student Reports */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Viewer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            {/* Metadata Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">
                  {question.chapter}
                </span>
                {question.concept && (
                  <span className="hidden sm:inline-block text-slate-400">
                    • {question.concept}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  {question.questionType}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  {question.level || 'MEDIUM'}
                </span>
              </div>
            </div>

            {/* Stem & Options HTML / MathML */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Question Content (Rendered HTML + MathML)
              </span>
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <MathViewer htmlContent={question.htmlContent} />
              </div>
            </div>

            {/* Stored Answer Key Display */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-900 block">
                  Current Database Answer Key:
                </span>
                <span className="text-xs text-indigo-600">
                  Stored value in production database
                </span>
              </div>
              <span className="font-mono text-base font-bold text-indigo-700 px-3 py-1 rounded-lg bg-white border border-indigo-200 shadow-xs">
                {question.answer || 'N/A'}
              </span>
            </div>

            {/* Solution / Derivation Section */}
            {question.solutionHtml && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Official Solution & Derivation</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    {showSolution ? 'Hide Solution' : 'Inspect Solution'}
                  </span>
                </button>

                {showSolution && (
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 animate-fade-in text-xs">
                    <MathViewer htmlContent={question.solutionHtml} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Student Reports Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Student Error Reports ({question.reports?.length || 0})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Real student comments from app
              </span>
            </div>

            <div className="space-y-3">
              {question.reports?.map((report, idx) => (
                <ReportCard key={report.reportId || idx} report={report} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis Card (Split Layout) */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <AIReviewCard question={question} onActionComplete={loadReview} />
        </div>
      </div>
    </div>
  );
}

export default ReviewConsolePage;
