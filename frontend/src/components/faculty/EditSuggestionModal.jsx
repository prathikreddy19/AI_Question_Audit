import React, { useState } from 'react';
import { X, Check, Edit3, AlertCircle } from 'lucide-react';
import { useAudit } from '../../contexts/AuditContext';

export function EditSuggestionModal({ question, isOpen, onClose, onSaved }) {
  const { editAndApprove, taxonomy, actionLoading } = useAudit();
  const ai = question?.aiAnalysis || {};

  const [verdict, setVerdict] = useState(ai.verdict || 'defect');
  const [repair, setRepair] = useState(ai.repair || 'answer_key');
  const [targetField, setTargetField] = useState(ai.proposedEdit?.field || 'answer');
  const [findText, setFindText] = useState(ai.proposedEdit?.find || '');
  const [replaceText, setReplaceText] = useState(ai.proposedEdit?.replace || '');
  const [studentReply, setStudentReply] = useState(ai.studentReply || '');
  const [facultyNotes, setFacultyNotes] = useState('');

  if (!isOpen || !question) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedAnalysis = {
      verdict,
      repair,
      student_reply: studentReply,
      edit: {
        field: targetField,
        find: findText,
        replace: replaceText,
      },
      route: ai.route || 'faculty_review',
      confidence: ai.confidence ?? 0,
    };

    editAndApprove(question.reportId || question.id, updatedAnalysis).then((result) => {
      if (result) {
        onSaved?.();
        onClose();
      }
    });
  };

  const repairsList = taxonomy?.repairs ? Object.keys(taxonomy.repairs) : [];
  const verdictsList = taxonomy?.verdicts ? Object.keys(taxonomy.verdicts) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit AI Suggestion & Fix
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Question ID: {question.qid || question.questionId || question.id}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Verdict */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verdict
              </label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {verdictsList.map((v) => (
                  <option key={v} value={v}>
                    {v.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Repair Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repair Taxonomy
              </label>
              <select
                value={repair || ''}
                onChange={(e) => setRepair(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {repairsList.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field to Modify
            </label>
            <select
              value={targetField}
              onChange={(e) => setTargetField(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="answer">Answer Key (`answer`)</option>
              <option value="question">Question Text / Options (`question`)</option>
              <option value="solution">Solution Derivation (`solution`)</option>
              <option value="chapter">Chapter Classification (`chapter`)</option>
            </select>
          </div>

          {/* Find & Replace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Original / Find (Before)
              </label>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-rose-50/40 rounded-xl border border-rose-200 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                placeholder="Current stored value"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Replacement / Fix (After)
              </label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                required
                className="w-full text-xs font-mono px-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-200 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 font-semibold"
                placeholder="New corrected value"
              />
            </div>
          </div>

          {/* Student Reply Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Reply Message (JEE Aspirant Tone)
            </label>
            <textarea
              rows={3}
              value={studentReply}
              onChange={(e) => setStudentReply(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              placeholder="1-3 encouraging, clarifying sentences for the student..."
            />
          </div>

          {/* Faculty Audit Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Faculty Audit Log Note (Optional)
            </label>
            <input
              type="text"
              value={facultyNotes}
              onChange={(e) => setFacultyNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Recalculated step 2 with corrected dielectric constant."
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm active:scale-95"
            >
              <Check className="w-4 h-4" />
              Save Edit & Approve
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSuggestionModal;
