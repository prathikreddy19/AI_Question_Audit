import { facultyService } from './facultyService';
import api from './api';

function normalizeLog(log = {}) {
  return {
    ...log,
    id: String(log._id || log.id || ''),
    eventType: log.event_type || log.eventType || 'legacy_event',
    questionId: String(log.question_id || log.questionId || ''),
    facultyName: log.faculty_email || log.facultyEmail || log.facultyId || log.facultyName || 'System',
    reportId: log.report_id || log.reportId || null,
    aiSuggestionId: log.ai_suggestion_id || log.aiSuggestionId || null,
    timestamp: log.timestamp || '',
  };
}

export const auditService = {
  async getLogs({ page = 1, limit = 20, event_type, action, faculty_email } = {}) {
    const { data } = await api.get('/audit/logs', {
      params: { page, limit, event_type, action, faculty_email },
    });
    return {
      ...data,
      items: (data.items || []).map(normalizeLog),
    };
  },
  async getAllLogs() {
    const limit = 500;
    const firstPage = await this.getLogs({ page: 1, limit });
    const logs = [...firstPage.items];
    const pages = Math.ceil((firstPage.total || 0) / limit);
    for (let page = 2; page <= pages; page += 1) {
      const result = await this.getLogs({ page, limit });
      logs.push(...result.items);
    }
    return logs;
  },
  approve: (...args) => facultyService.approve(...args),
  reject: (...args) => facultyService.reject(...args),
  editAndApprove: (...args) => facultyService.edit(...args),
};

export default auditService;
