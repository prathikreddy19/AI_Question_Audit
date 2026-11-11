import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Sparkles, Filter, RotateCcw } from 'lucide-react';
import { StudentQuestionCard } from '../../components/student/StudentQuestionCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useAudit } from '../../contexts/AuditContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/EmptyState';

export function StudentDashboard() {
  const { questions, loading, errors, retryQuestions } = useAudit();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const subjects = useMemo(() => {
    const set = new Set(questions.map((q) => q.subject).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (searchQuery.trim()) {
        const text = `${q.qid} ${q.id} ${q.subject} ${q.chapter} ${q.htmlContent}`.toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) {
        return false;
      }
      if (selectedType !== 'ALL' && q.questionType !== selectedType) {
        return false;
      }
      return true;
    });
  }, [questions, searchQuery, selectedSubject, selectedType]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('ALL');
    setSelectedType('ALL');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Hero Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs uppercase tracking-wider">
            JEE & NEET Practice Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Practice Real IIT-JEE & NEET Questions
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
            Sharpen your problem-solving with official mock questions featuring full
            MathML expressions. Found a mistake or typo? Use the <strong>"Report Error"</strong> button
            to trigger immediate AI triage & faculty review!
          </p>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, formula, concept, or chapter..."
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

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Question Types</option>
              <option value="scq">Single Choice (SCQ)</option>
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="integerQuestion">Integer / Numerical</option>
            </select>
          </div>
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredQuestions.length}</strong> questions
          </span>
          {(searchQuery || selectedSubject !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions Grid */}
      {loading.questions ? (
        <LoadingSkeleton variant="card" count={6} />
      ) : errors.questions ? (
        <ErrorState description={errors.questions} onRetry={retryQuestions} />
      ) : filteredQuestions.length === 0 ? (
        <EmptyState
          title="No questions match your query"
          description="Try clearing your search keyword or switching subjects."
          actionLabel="Clear Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuestions.map((q) => (
            <StudentQuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
