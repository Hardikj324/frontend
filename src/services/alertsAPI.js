import apiClient from './apiClient';

export const createAlert = async (alertData) => {
  try {
    const response = await apiClient.post('/alerts', alertData);
    return response.data;
  } catch (error) {
    console.error('Create Alert Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create alert');
  }
};

export const getAlerts = async () => {
  try {
    const response = await apiClient.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Get Alerts Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch alerts');
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const response = await apiClient.delete(`/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Alert Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete alert');
  }
};


export const toggleAlert = async (alertId) => {
  try {
    const response = await apiClient.patch(`/alerts/${alertId}/toggle`);
    return response.data;
  }
  catch (error) {
    console.error('Toggle Alert Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to toggle alert');
  }
}