import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  BookOpen,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { MathViewer } from '../../components/student/MathViewer';
import { ReportDialog } from '../../components/student/ReportDialog';
import { EmptyState, ErrorState } from '../../components/common/EmptyState';
import { useAudit } from '../../contexts/AuditContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function StudentQuestionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuestion, getReports, loading, errors, retryQuestions } = useAudit();
  const { user } = useAuth();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userIntegerInput, setUserIntegerInput] = useState('');
  const [reports, setReports] = useState(null);
  const [reportsError, setReportsError] = useState(null);

  const baseQuestion = getQuestion(id);

  useEffect(() => {
    if (!baseQuestion?.id) return;
    let active = true;
    getReports(baseQuestion.id)
      .then((items) => { if (active) setReports(items); })
      .catch((error) => { if (active) setReportsError(error?.userMessage || 'Unable to load reports for this question.'); });
    return () => { active = false; };
  }, [baseQuestion?.id, getReports]);

  const question = baseQuestion ? { ...baseQuestion, reports: reports ?? baseQuestion.reports ?? [] } : null;

  if (loading.questions) return <LoadingSkeleton variant="console" />;
  if (errors.questions) return <ErrorState description={errors.questions} onRetry={retryQuestions} />;

  if (!question) {
    return (
      <EmptyState
        title="Question Not Found"
        description="This question could not be located in the current database."
        actionLabel="Back to Question Bank"
        onAction={() => navigate('/student')}
      />
    );
  }

  const isScqOrMcq = question.questionType === 'scq' || question.questionType === 'mcq';
  const isInteger = question.questionType === 'integerQuestion';

  // Check if current user already reported
  const hasUserReported = question.reports?.some(
    (r) => r.studentId === user?.id
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/student"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            title="Back to Questions"
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
            </div>
            <p className="text-xs text-slate-500">
              {question.chapter} {question.concept ? `• ${question.concept}` : ''}
            </p>
          </div>
        </div>

        {/* Report Error Button */}
        <button
          onClick={() => setIsReportOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Error</span>
        </button>
      </div>

      {hasUserReported && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>You have flagged an error on this question. It has been queued for faculty review.</span>
          </div>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        {/* Question Type & Difficulty Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
          <span className="font-mono uppercase font-semibold text-slate-700">
            Type: {question.questionType}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
            Difficulty: {question.level || 'MEDIUM'}
          </span>
        </div>

        {/* Question Body (HTML + MathML) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Question Statement
          </span>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <MathViewer htmlContent={question.htmlContent} />
          </div>
        </div>

        {/* Interactive Answer Input for Student self-testing */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Test Your Answer (Student Practice)</span>
            <span className="text-[11px] text-slate-400">
              Answer is hidden below until you choose to reveal
            </span>
          </div>

          {isScqOrMcq && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedOption(opt)}
                  className={`p-3 rounded-xl border text-center transition font-bold text-sm ${
                    selectedOption === opt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          )}

          {isInteger && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={userIntegerInput}
                onChange={(e) => setUserIntegerInput(e.target.value)}
                placeholder="Enter numerical answer..."
                className="w-48 text-sm px-3.5 py-2 rounded-xl bg-white border border-slate-200 font-mono"
              />
              <span className="text-xs text-slate-500">
                (Numerical value without units)
              </span>
            </div>
          )}
        </div>

        {/* Reveal Answer Section (Answer Hidden by default!) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Correct Answer & Solution
              </h4>
              <p className="text-xs text-slate-500">
                {isAnswerRevealed
                  ? 'Official key and solution derivation'
                  : 'Answer is currently hidden for authentic testing'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs active:scale-95"
            >
              {isAnswerRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hide Answer</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Reveal Correct Answer</span>
                </>
              )}
            </button>
          </div>

          {isAnswerRevealed && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">
                  Correct Answer Key:
                </span>
                <span className="font-mono font-bold text-base text-indigo-700 bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-xs">
                  {question.answer}
                </span>
              </div>

              {question.solutionHtml && (
                <div className="pt-3 border-t border-indigo-100/80 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                    Derivation & Solution (MathML)
                  </span>
                  <div className="bg-white p-3.5 rounded-lg border border-indigo-100 text-xs text-slate-800">
                    <MathViewer htmlContent={question.solutionHtml} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {reportsError && <ErrorState description={reportsError} onRetry={() => {
        setReportsError(null);
        getReports(question.id).then(setReports).catch((error) => setReportsError(error?.userMessage || 'Unable to load reports for this question.'));
      }} />}

      {/* Report Dialog Modal */}
      <ReportDialog
        question={question}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitted={(report) => setReports((current) => [report, ...(current || [])])}
      />
    </div>
  );
}

export default StudentQuestionDetails;
