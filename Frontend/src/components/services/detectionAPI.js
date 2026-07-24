import api from './api';

export const submitDetection = async (payload) => api.post('/detection', payload);
