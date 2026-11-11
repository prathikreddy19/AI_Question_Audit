import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useAudit } from '../../contexts/AuditContext';

export function ReportDialog({ question, isOpen, onClose, onSubmitted }) {
  const { submitReport, actionLoading } = useAudit();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !question) return null;

  const quickPills = [
    'Answer key is wrong',
    'Figure/Diagram is missing',
    'Option D is blank or cut off',
    'Typo or spelling error',
    'Question stem data missing',
    'Out of JEE/NEET syllabus',
  ];

  const handlePillClick = (pill) => {
    if (comment.trim()) {
      setComment((prev) => `${prev}. ${pill}`);
    } else {
      setComment(pill);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const report = await submitReport(question.id, comment.trim());
      if (report) {
        onSubmitted?.(report);
        setComment('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Report Error in Question
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                ID: {question.qid || question.id} • {question.subject}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Describe the error or discrepancy
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. In step 2, the flux should be q/(2ε₀) so n=1 instead of 2... Or option D is blank..."
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 leading-relaxed"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
              <span>Be as specific as possible to assist faculty & AI verification</span>
              <span>{comment.length} chars</span>
            </div>
          </div>

          {/* Quick Issue Chips */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Common issues (click to insert):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 transition active:scale-95 text-left"
                >
                  + {pill}
                </button>
              ))}
            </div>
          </div>

          {/* AI Triage Explainer */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Your report will be automatically analyzed by the Acadza AI Triage
              Engine and queued for faculty review if verified.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || actionLoading || !comment.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportDialog;
