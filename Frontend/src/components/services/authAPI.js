import api from './api';

export const loginUser = async (payload) => api.post('/auth/login', payload);
export const registerUser = async (payload) => api.post('/auth/register', payload);
