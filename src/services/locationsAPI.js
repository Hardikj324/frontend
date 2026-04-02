import apiClient from './apiClient';

// Save all 4 slots at once
export const saveLocations = async (slot1, slot2, slot3, slot4) => {
  try {
    const response = await apiClient.patch('/weather/save-locations', {
      slot1: slot1 || null,
      slot2: slot2 || null,
      slot3: slot3 || null,
      slot4: slot4 || null,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to save locations');
  }
};

export const getUserLocations = async () => {
  try {
    const response = await apiClient.get('/weather/saved-locations');
    const data = response.data;

    const names = (data.locations || []).map((l) => l.name);
    return {
      slot1_name: names[0] || null,
      slot2_name: names[1] || null,
      slot3_name: names[2] || null,
      slot4_name: names[3] || null,
      locations: data.locations || [],
    };
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch locations');
  }
};
