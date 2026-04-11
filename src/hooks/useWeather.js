import { useEffect, useRef, useCallback } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { getWeatherByCoordinates } from '../services/weatherAPI';

export const useWeather = (latitude, longitude) => {
  const weather    = useWeatherStore(s => s.weather);
  const loading    = useWeatherStore(s => s.loading);
  const error      = useWeatherStore(s => s.error);
  const setWeather = useWeatherStore(s => s.setWeather);
  const setLoading = useWeatherStore(s => s.setLoading);
  const setError   = useWeatherStore(s => s.setError);

  // Guard: prevent a second request while the first is in-flight
  const fetchingRef = useRef(false);

  const fetchWeather = useCallback(async () => {
    if (!latitude || !longitude) return;
    if (fetchingRef.current) return;   // Already fetching — skip

    fetchingRef.current = true;
    setLoading(true);
    try {
      const data = await getWeatherByCoordinates(latitude, longitude);
      setWeather(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);  // Only re-create when coords change

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, loading, error };
};