import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import taxonomy from '../data/taxonomy.json';
import { dashboardService } from '../services/dashboardService';
import { facultyService } from '../services/facultyService';
import { studentService } from '../services/studentService';
import { auditService } from '../services/auditService';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from './AuthContext';

const AuditContext = createContext(null);
const emptyStats = {
  totalReports: 0,
  pendingReviews: 0,
  approvedToday: 0,
  rejectedToday: 0,
  autoApplied: 0,
  facultyReview: 0,
};

export function AuditProvider({ children }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogCount, setAuditLogCount] = useState(0);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [loading, setLoading] = useState({ questions: true, dashboard: true, queue: true });
  const [errors, setErrors] = useState({ questions: null, dashboard: null, queue: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [isAnalyzingPending, setIsAnalyzingPending] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), duration);
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading((state) => ({ ...state, questions: true }));
    setErrors((state) => ({ ...state, questions: null }));
    try {
      setQuestions(await studentService.getQuestions());
    } catch (error) {
      setErrors((state) => ({ ...state, questions: getApiErrorMessage(error) }));
    } finally {
      setLoading((state) => ({ ...state, questions: false }));
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading((state) => ({ ...state, dashboard: true }));
    setErrors((state) => ({ ...state, dashboard: null }));
    try {
      const summary = await dashboardService.getSummary();
      setStats(summary);
    } catch (error) {
      setErrors((state) => ({ ...state, dashboard: getApiErrorMessage(error) }));
    } finally {
      setLoading((state) => ({ ...state, dashboard: false }));
    }
  }, []);

  const loadQueue = useCallback(async (params = { page: 1, limit: 100, status: '' }) => {
    setLoading((state) => ({ ...state, queue: true }));
    setErrors((state) => ({ ...state, queue: null }));
    try {
      setQueue(await facultyService.getQueue(params));
    } catch (error) {
      setErrors((state) => ({ ...state, queue: getApiErrorMessage(error) }));
    } finally {
      setLoading((state) => ({ ...state, queue: false }));
    }
  }, []);

  const loadAuditLogs = useCallback(async (params = { page: 1, limit: 100 }) => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const result = await auditService.getLogs(params);
      setAuditLogs(result.items);
      setAuditLogCount(result.total || 0);
    } catch (error) {
      setAuditLogs([]);
      setAuditLogCount(0);
      setAuditError(getApiErrorMessage(error));
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const reloadFacultyData = useCallback(async () => {
    await Promise.all([loadDashboard(), loadQueue()]);
  }, [loadDashboard, loadQueue]);

  const analyzePendingReports = useCallback(async () => {
    setIsAnalyzingPending(true);
    try {
      const summary = await facultyService.analyzePendingReports();
      await Promise.all([reloadFacultyData(), loadAuditLogs()]);
      if (summary.processed === 0) {
        showToast('No pending reports to analyze.', 'info');
      } else {
        showToast(`Analysis completed. ${summary.processed} reports analyzed.`, 'success');
      }
      return summary;
    } catch {
      showToast('Analysis failed. Please try again.', 'error', 5000);
      return null;
    } finally {
      setIsAnalyzingPending(false);
    }
  }, [loadAuditLogs, reloadFacultyData, showToast]);

  useEffect(() => {
    loadQuestions();
    loadDashboard();
    loadQueue();
    loadAuditLogs();
  }, [loadQuestions, loadDashboard, loadQueue, loadAuditLogs]);

  const runAction = useCallback(async (operation, successMessage, celebrate = false) => {
    setActionLoading(true);
    try {
      const result = await operation();
      await reloadFacultyData();
      await loadAuditLogs();
      if (celebrate) {
        try { confetti({ particleCount: 50, spread: 55, origin: { y: 0.7 } }); } catch { /* cosmetic only */ }
      }
      showToast(successMessage, 'success');
      return result;
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error', 5000);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [loadAuditLogs, reloadFacultyData, showToast]);

  const approve = useCallback((reportId) => runAction(
    () => facultyService.approve(reportId, user?.email || user?.id || 'faculty'),
    'Review approved and saved.', true,
  ), [runAction, user]);

  const reject = useCallback((reportId, reason) => runAction(
    () => facultyService.reject(reportId, reason, user?.email || user?.id || 'faculty'),
    'Review rejected and saved.',
  ), [runAction, user]);

  const editAndApprove = useCallback((reportId, changes) => runAction(
    () => facultyService.edit(reportId, changes, user?.email || user?.id || 'faculty'),
    'Edited review saved and approved.', true,
  ), [runAction, user]);

  const submitReport = useCallback(async (questionId, comment) => {
    setActionLoading(true);
    let report;
    try {
      try {
        report = await studentService.reportError({
          questionId,
          comment,
          studentId: user?.id || 'student',
          source: 'web',
        });
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error', 5000);
        return null;
      }

      try {
        const aiReview = await studentService.runAiReview(report.reportId);
        showToast(
          aiReview.validation_passed
            ? 'Report submitted and AI review completed.'
            : 'Report submitted and sent to faculty review.',
          'success',
        );
        return { ...report, aiReview };
      } catch (error) {
        // Report creation succeeded; do not make students resubmit it if AI review fails.
        showToast(
          `Report ${report.reportId} was submitted, but its AI review could not be started.`,
          'error',
          6000,
        );
        return report;
      }
    } finally {
      if (report) await Promise.allSettled([loadQuestions(), reloadFacultyData(), loadAuditLogs()]);
      setActionLoading(false);
    }
  }, [loadAuditLogs, loadQuestions, reloadFacultyData, showToast, user]);

  const getQuestion = useCallback((id) => questions.find(
    (question) => question.id === String(id) || question.qid === String(id)
  ), [questions]);

  const value = useMemo(() => ({
    questions,
    queue,
    stats,
    auditLogs,
    auditLogCount,
    auditLoading,
    auditError,
    loadAuditLogs,
    taxonomy,
    loading,
    errors,
    actionLoading,
    isAnalyzingPending,
    approve,
    reject,
    editAndApprove,
    analyzePendingReports,
    submitReport,
    getQuestion,
    getReports: studentService.getReports,
    retryQuestions: loadQuestions,
    retryDashboard: loadDashboard,
    retryQueue: loadQueue,
    refreshFacultyData: reloadFacultyData,
    showToast,
    toast,
  }), [questions, queue, stats, auditLogs, auditLogCount, auditLoading, auditError, loadAuditLogs,
    loading, errors, actionLoading, isAnalyzingPending,
    approve, reject, editAndApprove, analyzePendingReports, submitReport, getQuestion, loadQuestions, loadDashboard, loadQueue,
    reloadFacultyData, showToast, toast]);

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used within an AuditProvider');
  return context;
}
