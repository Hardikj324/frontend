import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000,
    };

    let active = true;

    const getPosition = () => {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!active) return;
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLoading(false);
          setError(null);
        },
        (error) => {
          if (!active) return;
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          setError(errorMessage);
          setLoading(false);
        },
        options
      );
    };

    // Run geolocation query immediately
    getPosition();

    // Listen to permission changes in the background
    let permissionStatus;
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (!active) return;
        permissionStatus = status;
        status.onchange = () => {
          if (!active) return;
          if (status.state === 'granted') {
            getPosition();
          } else if (status.state === 'denied') {
            setError('Permission denied. Please enable location access.');
            setLocation(null);
          }
        };
      });
    }

    return () => {
      active = false;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  return { location, error, loading };
};