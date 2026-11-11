import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Cpu,
  Check,
} from 'lucide-react';
import { DiffViewer } from './DiffViewer';
import { ReplyPreview } from './ReplyPreview';
import { EditSuggestionModal } from './EditSuggestionModal';
import { UrgencyBadge, StatusBadge } from '../common/StatusBadge';
import { getVerdictConfig } from '../../utils/formatters';
import { useAudit } from '../../contexts/AuditContext';

export function AIReviewCard({ question, onActionComplete }) {
  const { approve, reject, actionLoading } = useAudit();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rejectPromptOpen, setRejectPromptOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!question) return null;

  const ai = question.aiAnalysis || {};
  const verdictConfig = getVerdictConfig(ai.verdict);
  const confidencePercent = Math.round((ai.confidence ?? 0) * 100);

  const handleApprove = async () => {
    const result = await approve(question.reportId || question.id);
    if (result) onActionComplete?.();
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    const result = await reject(question.reportId || question.id, rejectReason || 'Faculty marked as student miscalculation / no error.');
    if (result) {
      onActionComplete?.();
      setRejectPromptOpen(false);
      setRejectReason('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      {/* Header with Title and Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">AI Triage Analysis</h3>
              <StatusBadge status={ai.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">Autonomous Evaluation Engine v2.4</p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Confidence:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  confidencePercent >= 90
                    ? 'bg-emerald-500'
                    : confidencePercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-slate-800">
              {confidencePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Verdict & Repair Taxonomy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            VERDICT
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${verdictConfig.color}`}
            >
              {verdictConfig.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            {verdictConfig.desc}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            REPAIR TYPE
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono capitalize">
              {ai.repair ? ai.repair.replace('_', ' ') : 'None (No Change)'}
            </span>
            <UrgencyBadge urgency={ai.urgency} size="sm" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Route: <strong className="font-semibold text-slate-700">{ai.route || 'faculty_review'}</strong>
          </p>
        </div>
      </div>

      {/* Evidence String */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Evidence & Grounding Rationale</span>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-700 leading-relaxed font-normal">
          {ai.evidence || 'No evidence was provided with this review.'}
        </div>
      </div>

      {/* Before / After Diff Viewer */}
      <div className="space-y-1.5">
        <DiffViewer
          beforeText={ai.diff?.before || `Original Answer: ${question.answer}`}
          afterText={
            ai.diff?.after ||
            (ai.proposedEdit?.replace
              ? `Corrected Answer: ${ai.proposedEdit.replace}`
              : `Answer: ${question.answer}`)
          }
          field={ai.proposedEdit?.field || 'answer'}
        />
      </div>

      {/* Student Reply Preview */}
      <div className="space-y-1.5">
        <ReplyPreview
          replyText={ai.studentReply || 'No student reply was provided with this review.'}
          studentName={question.reports?.[0]?.studentId || 'Reporting Student'}
        />
      </div>

      {/* Reject Modal / Prompt Inline */}
      {rejectPromptOpen && (
        <form
          onSubmit={handleRejectConfirm}
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Reject Report & Mark Closed</span>
            <button
              type="button"
              onClick={() => setRejectPromptOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (e.g. Student miscalculated perimeter)..."
            className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectPromptOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      )}

      {/* Action Buttons: Approve, Reject, Edit Suggestion */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setRejectPromptOpen(true)}
            disabled={actionLoading || ai.status === 'rejected'}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 text-xs font-semibold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <XCircle className="w-4 h-4" />
          <span>Reject Report</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition active:scale-95 shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Suggestion</span>
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={actionLoading || ai.status === 'approved'}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition active:scale-95 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{ai.status === 'approved' ? 'Approved & Merged' : 'Approve Fix'}</span>
          </button>
        </div>
      </div>

      {/* Edit Suggestion Modal Dialog */}
      <EditSuggestionModal
        question={question}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={onActionComplete}
      />
    </div>
  );
}

export default AIReviewCard;
