import api from './api';
import { normalizeQuestion } from './questionService';

function normalizeQueueItem(review = {}) {
  const confidence = review.confidence ?? 0;
  const urgency = confidence >= 0.95 ? 'URGENT' : confidence >= 0.85 ? 'HIGH' : confidence >= 0.7 ? 'MEDIUM' : 'LOW';
  return {
    id: String(review.reportId || ''),
    reportId: String(review.reportId || ''),
    questionId: String(review.questionId || ''),
    qid: String(review.questionId || ''),
    subject: review.subject || '',
    chapter: review.chapter || '',
    level: '',
    htmlContent: '',
    answer: '',
    reportsCount: 1,
    reports: [{ reportId: review.reportId, comment: review.student_comment || '' }],
    aiAnalysis: {
      verdict: review.verdict,
      repair: review.repair,
      confidence,
      route: review.route,
      status: review.status || 'pending',
      urgency,
      evidence: '',
    },
  };
}

export function normalizeReviewDetail(payload = {}) {
  const rawQuestion = payload.question || {};
  const question = normalizeQuestion(rawQuestion);
  const report = payload.report || {};
  const review = payload.ai_review || {};
  const beforeAfter = payload.before_after;
  const aiAnalysis = {
    ...review,
    studentReply: review.student_reply || payload.student_reply || '',
    proposedEdit: review.edit || null,
    diff: beforeAfter ? {
      before: beforeAfter.before,
      after: beforeAfter.after,
      field: beforeAfter.field,
    } : null,
  };
  return {
    ...question,
    id: String(report.reportId || review.reportId || ''),
    reportId: String(report.reportId || review.reportId || ''),
    questionId: question.id,
    reports: [report],
    reportsCount: 1,
    aiAnalysis,
    validationErrors: payload.validation_errors || review.validation_errors || [],
    report,
    aiReview: review,
  };
}

export const facultyService = {
  async getDashboard() {
    const { data } = await api.get('/faculty/dashboard');
    return data;
  },
  async analyzePendingReports() {
    const { data } = await api.post('/ai/analyze-pending');
    return data;
  },
  async getQueue({ page = 1, limit = 20, status = '', search = '' } = {}) {
    const { data } = await api.get('/faculty/reports', {
      params: { page, limit, status, search: search || undefined },
    });
    return data.map(normalizeQueueItem);
  },
  async getReview(reportId) {
    const { data } = await api.get(`/faculty/report/${encodeURIComponent(reportId)}`);
    return normalizeReviewDetail(data);
  },
  async approve(reportId, facultyId = 'faculty') {
    const { data } = await api.post(`/faculty/approve/${encodeURIComponent(reportId)}`, { facultyId });
    return data;
  },
  async reject(reportId, reason, facultyId = 'faculty') {
    const { data } = await api.post(`/faculty/reject/${encodeURIComponent(reportId)}`, { facultyId, reason });
    return data;
  },
  async edit(reportId, changes, facultyId = 'faculty') {
    const { data } = await api.put(`/faculty/edit/${encodeURIComponent(reportId)}`, { ...changes, facultyId });
    return data;
  },
};

export default facultyService;
