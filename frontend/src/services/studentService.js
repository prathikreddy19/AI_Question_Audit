import api from './api';
import { questionService } from './questionService';

export const studentService = {
  getQuestions: () => questionService.getAll(),
  getQuestion: (id) => questionService.getById(id),
  async getReports(questionId) {
    const { data } = await api.get(`/reports/${encodeURIComponent(questionId)}`);
    return data;
  },
  async reportError({ questionId, comment, studentId, source = 'web' }) {
    const { data } = await api.post('/reports', { questionId, comment, studentId, source });
    return data;
  },
  async runAiReview(reportId) {
    const { data } = await api.post(`/ai/review/${encodeURIComponent(reportId)}`);
    return data;
  },
};

export default studentService;
