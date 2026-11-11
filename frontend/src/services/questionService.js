import api from './api';

export function normalizeQuestion(raw = {}) {
  const id = String(raw.id ?? raw._id ?? raw.qid ?? '');
  const type = raw.questionType || 'unknown';
  const content = raw[type] && typeof raw[type] === 'object'
    ? raw[type]
    : Object.values(raw).find((value) => value && typeof value === 'object' && 'question' in value) || {};
  return {
    ...raw,
    id,
    qid: raw.qid || id,
    questionType: type,
    htmlContent: content.question || '',
    solutionHtml: content.solution || '',
    answer: content.answer ?? '',
    reports: raw.reports || [],
    reportsCount: raw.reportsCount || raw.reports?.length || 0,
  };
}

export const questionService = {
  async getAll({ limit = 500, skip = 0 } = {}) {
    const response = await api.get('/questions', { params: { limit, skip } });
    return response.data.map(normalizeQuestion);
  },
  async getById(id) {
    const response = await api.get(`/questions/${encodeURIComponent(id)}`);
    return normalizeQuestion(response.data);
  },
};

export default questionService;
