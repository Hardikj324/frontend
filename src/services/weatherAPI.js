import apiClient from './apiClient';

export const getWeatherByCoordinates = async (latitude, longitude) => {
  try {
    const response = await apiClient.post('/weather/current-location', {
      current_latitude: latitude,
      current_longitude: longitude,
    });
    return response.data;
  } catch (error) {
    console.error('Weather API Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch weather');
  }
};

export const getSavedLocationsWeather = async () => {
  try {
    const response = await apiClient.get('/weather/saved-locations');
    return response.data;
  } catch (error) {
    console.error('Saved Locations API Error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch saved locations');
  }
};