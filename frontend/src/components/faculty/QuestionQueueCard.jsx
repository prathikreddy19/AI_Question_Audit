import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge, UrgencyBadge } from '../common/StatusBadge';
import { stripHtml } from '../../utils/mathmlHelper';

export function QuestionQueueCard({ question }) {
  if (!question) return null;

  const ai = question.aiAnalysis || {};
  const confidencePercent = Math.round((ai.confidence ?? 0) * 100);
  const plainText = stripHtml(question.htmlContent || '').slice(0, 140);
  const latestReport = question.reports?.[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition duration-200 group flex flex-col justify-between">
      <div>
        {/* Top bar: Question ID, Badges, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
              {question.qid || question.id?.slice(0, 8) || question.reportId}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              {question.subject}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={ai.urgency} size="sm" />
            <StatusBadge status={ai.status} size="sm" />
          </div>
        </div>

        {/* Chapter / Concept */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{question.chapter}</span>
          {question.level && (
            <span className="text-[10px] uppercase font-bold text-slate-400 ml-1">
              • {question.level}
            </span>
          )}
        </div>

        {/* Question Text Snippet */}
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2 mb-3 font-normal">
          {plainText || 'Mathematical/Diagram expression in question stem...'}
        </p>

        {/* Student Report Lead */}
        {latestReport && (
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 mb-3 flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="truncate">
              <span className="font-semibold text-amber-800">Student report: </span>
              <span className="italic">"{latestReport.comment}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {/* Reports count */}
          <div className="flex items-center gap-1.5 font-medium">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
              {question.reportsCount || question.reports?.length || 0}
            </span>
            <span>reports</span>
          </div>

          {/* AI Confidence */}
          <div className="flex items-center gap-1 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium">AI:</span>
            <span className="font-mono font-bold text-slate-800">
              {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Open Button */}
        <Link
          to={`/faculty/queue/${encodeURIComponent(question.reportId || question.id)}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition active:scale-95 group-hover:bg-indigo-600 group-hover:text-white shadow-xs"
        >
          <span>Open Console</span>
          <ChevronRight className="w-4 h-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default QuestionQueueCard;
