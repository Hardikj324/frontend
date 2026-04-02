import { useEffect } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { getWeatherByCoordinates } from '../services/weatherAPI';

export const useWeather = (latitude, longitude) => {
  const { weather, loading, error, setWeather, setLoading, setError } = useWeatherStore();

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getWeatherByCoordinates(latitude, longitude);
        setWeather(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch weather');
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude, setWeather, setLoading, setError]);

  return { weather, loading, error };
};