import { useState, useEffect, useCallback } from 'react';
import { getAlerts, createAlert, deleteAlert, toggleAlert } from '../services/alertsAPI';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAlerts();

      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = async (alertData) => {
    try {
      const payload = {
        alert_type: alertData.type,
        threshold: alertData.threshold,
        name: alertData.name
      };
      const newAlert = await createAlert(payload);
      setAlerts((prev) => [...prev, newAlert]);
      return newAlert;
    } catch (error) {
      console.error('Failed to add alert:', error);
      throw error;
    }
  };

  const removeAlert = async (id) => {
    const previousAlerts = alerts;
    setAlerts((prev) => prev.filter((a) => a.id !== id));

    try {
      await deleteAlert(id);
    } catch (error) {
      console.error('Failed to delete alert:', error);
      setAlerts(previousAlerts);
    }
  };

  const updateAlert = async (id, updatedAlert) => {
    const previousAlerts = alerts;
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updatedAlert } : a)));

    try {
      if ('isActive' in updatedAlert || 'is_active' in updatedAlert) {
        await toggleAlert(id);
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      setAlerts(previousAlerts);
    }
  };

  return {
    alerts,
    isLoading,
    addAlert,
    removeAlert,
    updateAlert,
    refreshAlerts: fetchAlerts,
  };
};
