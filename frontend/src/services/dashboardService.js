import api from './api';

export const dashboardService = {
  async getSummary() {
    const { data } = await api.get('/faculty/dashboard');
    return {
      totalReports: data.total_reports ?? 0,
      pendingReviews: data.pending_reviews ?? 0,
      approvedToday: data.approved ?? 0,
      rejectedToday: data.rejected ?? 0,
      autoApplied: data.auto_applied ?? 0,
      facultyReview: data.faculty_review ?? 0,
    };
  },
};

export default dashboardService;
