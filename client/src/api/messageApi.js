import api from './axios';

export const getMessages = (ticketId) => api.get(`/tickets/${ticketId}/messages`);
export const sendMessage = (ticketId, content) => api.post(`/tickets/${ticketId}/messages`, { content });
export const getChatTickets = () => api.get('/tickets/my-chats');
