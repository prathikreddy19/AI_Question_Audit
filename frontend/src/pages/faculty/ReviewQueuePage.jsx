import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { QuestionQueueCard } from '../../components/faculty/QuestionQueueCard';
import { EmptyState, ErrorState } from '../../components/common/EmptyState';
import { useAudit } from '../../contexts/AuditContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useDebounce } from '../../hooks/useDebounce';

export function ReviewQueuePage() {
  const { queue, loading, errors, retryQueue } = useAudit();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('status') || 'pending'
  );
  const [selectedUrgency, setSelectedUrgency] = useState(
    searchParams.get('filter') === 'urgent' ? 'URGENT' : 'ALL'
  );
  const [sortBy, setSortBy] = useState('urgency');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const status = ['pending', 'approved', 'rejected'].includes(selectedStatus) ? selectedStatus : '';
    retryQueue({ page, limit: pageSize + 1, status, search: debouncedSearch });
  }, [page, selectedStatus, debouncedSearch, retryQueue]);

  // Subjects list
  const subjects = useMemo(() => {
    const set = new Set(queue.map((q) => q.subject).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [queue]);

  // Filter questions that have reports
  const queueQuestions = useMemo(() => {
    return queue;
  }, [queue]);

  const filteredQuestions = useMemo(() => {
    return queueQuestions
      .filter((q) => {
        // Search query
        if (searchQuery.trim()) {
          const qText = `${q.qid} ${q.questionId} ${q.reportId} ${q.subject} ${q.chapter} ${
            q.htmlContent
          } ${q.reports.map((r) => r.comment || '').join(' ')}`.toLowerCase();
          if (!qText.includes(searchQuery.toLowerCase())) return false;
        }

        // Subject filter
        if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'ALL' && selectedStatus !== 'auto_applied') {
          if (q.aiAnalysis.status !== selectedStatus) return false;
        }
        if (selectedStatus === 'auto_applied' && q.aiAnalysis.route !== 'auto_apply') return false;

        // Urgency filter
        if (selectedUrgency !== 'ALL') {
          if (q.aiAnalysis.urgency !== selectedUrgency) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const pendingRank = (a.aiAnalysis.status === 'pending' ? 0 : 1) - (b.aiAnalysis.status === 'pending' ? 0 : 1);
        if (pendingRank !== 0) return pendingRank;
        if (sortBy === 'urgency') {
          const urgencyRank = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
          const rankA = urgencyRank[a.aiAnalysis.urgency] || 0;
          const rankB = urgencyRank[b.aiAnalysis.urgency] || 0;
          if (rankB !== rankA) return rankB - rankA;
          return (b.reportsCount || 0) - (a.reportsCount || 0);
        }
        if (sortBy === 'reports') {
          return (b.reportsCount || 0) - (a.reportsCount || 0);
        }
        if (sortBy === 'confidence') {
          return (b.aiAnalysis.confidence || 0) - (a.aiAnalysis.confidence || 0);
        }
        return 0;
      });
  }, [
    queueQuestions,
    searchQuery,
    selectedSubject,
    selectedStatus,
    selectedUrgency,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setSelectedStatus('ALL');
    setSelectedUrgency('ALL');
    setSortBy('urgency');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Faculty Review Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredQuestions.length} questions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student error reports grouped by Question with AI triage recommendations
          </p>
        </div>

        {/* Status quick tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs self-start sm:self-auto">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'auto_applied', label: 'Auto Applied' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'ALL', label: 'All' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setSelectedStatus(tab.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedStatus === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by Question ID, chapter, formula, or student comment..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Subject Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  Subject: {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="urgency">Sort: Highest Urgency</option>
              <option value="reports">Sort: Most Reports</option>
              <option value="confidence">Sort: AI Confidence</option>
            </select>
          </div>
        </div>

        {/* Urgency Filter pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Urgency:
            </span>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedUrgency(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedUrgency === lvl
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {(searchQuery ||
            selectedSubject !== 'ALL' ||
            selectedStatus !== 'pending' ||
            selectedUrgency !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Grouped Question Cards */}
      {loading.queue ? (
        <LoadingSkeleton variant="queue" count={4} />
      ) : errors.queue ? (
        <ErrorState description={errors.queue} onRetry={() => retryQueue({
          page, limit: pageSize + 1,
          status: ['pending', 'approved', 'rejected'].includes(selectedStatus) ? selectedStatus : '',
          search: debouncedSearch,
        })} />
      ) : filteredQuestions.length === 0 ? (
        <EmptyState
          title="No questions match your criteria"
          description="Try broadening your search query or selecting a different status/urgency filter."
          actionLabel="Clear All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredQuestions.slice(0, pageSize).map((q) => (
            <QuestionQueueCard key={q.id} question={q} />
          ))}
        </div>
      )}
      {!loading.queue && !errors.queue && queue.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Page {page}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button disabled={queue.length <= pageSize} onClick={() => setPage((value) => value + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewQueuePage;
