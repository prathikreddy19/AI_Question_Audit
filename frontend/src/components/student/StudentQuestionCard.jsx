import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { stripHtml } from '../../utils/mathmlHelper';

export function StudentQuestionCard({ question }) {
  if (!question) return null;

  const plainText = stripHtml(question.htmlContent || '').slice(0, 150);

  const typeLabels = {
    scq: 'Single Choice (SCQ)',
    mcq: 'Multiple Choice (MCQ)',
    integerQuestion: 'Integer / Numerical',
  };

  const levelStyles = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition duration-200 group flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {question.qid || question.id.slice(0, 8)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {question.subject}
            </span>
          </div>

          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              levelStyles[question.level] || levelStyles.MEDIUM
            }`}
          >
            {question.level || 'MEDIUM'}
          </span>
        </div>

        {/* Chapter / Concept */}
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{question.chapter}</span>
        </div>

        {/* Snippet */}
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2 mb-4 font-normal">
          {plainText || 'Question text unavailable.'}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-mono">
          {typeLabels[question.questionType] || question.questionType}
        </span>

        <Link
          to={`/student/question/${question.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition active:scale-95 group-hover:bg-indigo-600 group-hover:text-white shadow-xs"
        >
          <span>Open Question</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default StudentQuestionCard;
