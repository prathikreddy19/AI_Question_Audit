import { facultyService } from './facultyService';

// Audit actions are persisted by the faculty endpoints. The backend currently
// exposes no audit-log listing route, so getLogs has no remote implementation.
export const auditService = {
  async getLogs() {
    return [];
  },
  approve: (...args) => facultyService.approve(...args),
  reject: (...args) => facultyService.reject(...args),
  editAndApprove: (...args) => facultyService.edit(...args),
};

export default auditService;
