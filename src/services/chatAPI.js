import apiClient from './apiClient';

export const getChatHistory = async (city) => {
  try {
    const response = await apiClient.get(`/chat/history/${encodeURIComponent(city)}`);
    return response.data;
  } catch (error) {
    console.error('Fetch Chat History Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch chat history');
  }
};

export const uploadChatMedia = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // We override headers just for this request to allow multipart/form-data
    const response = await apiClient.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    console.error('Upload Chat Media Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to upload media');
  }
};
