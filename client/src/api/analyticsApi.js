import api from './axios';

export const getAnalyticsSummary = (params) => api.get('/analytics/summary', { params });
export const getReports = () => api.get('/analytics/reports');
export const generateReport = (data) => api.post('/analytics/reports/generate', data);
