import { useState, useCallback } from 'react';
import apiClient from '../services/apiClient';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Map fetch 'body' to axios 'data' just in case old code uses it
      const config = { ...options };
      if (config.body && !config.data) {
        config.data = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
        delete config.body;
      }

      const response = await apiClient({
        url,
        ...config,
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, request };
};