import api from './axios';

export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getSLAs = () => api.get('/sla');
export const getSLAByCategory = (categoryId) => api.get(`/sla/${categoryId}`);
export const createSLA = (data) => api.post('/sla', data);
