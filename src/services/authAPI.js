import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import apiClient from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Login Error:', error);
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const signup = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Signup Error:', error);
    throw new Error(error.response?.data?.detail || 'Signup failed');
  }
};

export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshTokenValue,
    });
    return response.data;
  } catch (error) {
    console.error('Token Refresh Error:', error);
    throw new Error(error.response?.data?.detail || 'Token refresh failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get User Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user');
  }
};