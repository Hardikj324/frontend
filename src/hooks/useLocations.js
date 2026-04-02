import { useState, useEffect } from 'react';
import { useLocationStore } from '../store/weatherStore';
import { getSavedLocationsWeather } from '../services/weatherAPI';

export const useLocations = () => {
  const { savedLocations, setSavedLocations, setError } = useLocationStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedLocations = async () => {
    setIsLoading(true);
    try {
      const data = await getSavedLocationsWeather();
      setSavedLocations(data.locations || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch saved locations');
      setSavedLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  return {
    savedLocations,
    isLoading,
    fetchSavedLocations,
  };
};