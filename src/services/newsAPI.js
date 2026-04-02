import apiClient from './apiClient';

export const getWeatherNews = async (locationName) => {
  try {
    const response = await apiClient.get(`/news/${encodeURIComponent(locationName)}`);
    return response.data;
  } catch (error) {
    console.error('Fetch News Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch news');
  }
};
