import apiClient from './api';

export const registerUser = async (userData) => {
  const response = await apiClient.post('/register', userData);
  return response.data;
};

export const loginUser = async (userData) => {
    const response = await apiClient.post('/login', userData);
    return response.data;
};

export const validateToken = async (token) => {
  const response = await apiClient.post('/validate', {},{
    headers:{
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};