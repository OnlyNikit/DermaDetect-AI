import api from './api';

export const submitPrediction = async (payload) => api.post('/predict', payload);
