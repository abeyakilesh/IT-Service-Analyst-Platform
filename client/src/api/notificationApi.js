import api from './axios';

export const getNotifications = (limit = 50) => api.get(`/notifications?limit=${limit}`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
