import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Zap,
  Edit3,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { formatRelativeTime, formatDate } from '../../utils/formatters';

export function AuditTimeline({
  logs = [],
  filterAction = 'ALL',
  onFilterActionChange = () => {},
  page = 1,
  total = 0,
  limit = 20,
  onPageChange = () => {},
}) {
  const filteredLogs = logs;

  const getActionIcon = (action = '', facultyName = '') => {
    const act = action.toLowerCase();
    if (facultyName.includes('Auto') || act.includes('auto')) {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center ring-4 ring-white shadow-xs">
          <Zap className="w-4 h-4" />
        </div>
      );
    }
    if (act.includes('approve') || act.includes('applied')) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center ring-4 ring-white shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }
    if (act.includes('reject') || act.includes('ignored')) {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center ring-4 ring-white shadow-xs">
          <XCircle className="w-4 h-4" />
        </div>
      );
    }
    if (act.includes('edit')) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center ring-4 ring-white shadow-xs">
          <Edit3 className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center ring-4 ring-white shadow-xs">
        <MessageSquare className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Immutable Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Chronological log of all faculty decisions, AI auto-merges, and reports
          </p>
        </div>

        {/* Action Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60 text-xs">
          {['ALL', 'APPROVED', 'REJECTED', 'AUTO', 'REPORT'].map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterActionChange(tab)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filterAction === tab
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'AUTO' ? 'Auto-Applied' : tab === 'REPORT' ? 'Reports' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          No audit entries found for this filter.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline Icon Node */}
              <div className="absolute -left-6 sm:-left-8 top-0">
                {getActionIcon(log.action, log.facultyName)}
              </div>

              {/* Content Card */}
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-2xl p-4 transition duration-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {log.facultyName}
                    </span>
                    {log.repairType && (
                      <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.repairType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span title={formatDate(log.timestamp)}>
                      {formatDate(log.timestamp)} · {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  {log.action}
                </div>

                <div className="text-xs text-slate-500">
                  Event: {(log.eventType || 'legacy_event').replaceAll('_', ' ')}
                </div>

                {log.notes && (
                  <p className="text-xs text-slate-600 leading-relaxed font-normal bg-white p-2.5 rounded-xl border border-slate-200/60">
                    "{log.notes}"
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Question ID: {log.questionId}</span>
                  <span>Entry: {log.id}</span>
                </div>
                {log.reportId && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    Report ID: {log.reportId}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>{total} events</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
          <button
            type="button"
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditTimeline;
