import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useWeatherStore } from '../store/weatherStore';
import { useAlerts } from './useAlerts';

export const useAlertChecker = () => {
  const { weather } = useWeatherStore();
  const { alerts } = useAlerts();

  // We use a ref to track which alerts we've already notified the user about
  // This prevents spamming the user with the exact same alert every 10 minutes.
  const notifiedAlerts = useRef(new Set());

  useEffect(() => {
    // If we don't have weather data or alerts, do nothing
    if (!weather || !alerts || alerts.length === 0) return;

    alerts.forEach((alert) => {
      // Skip inactive alerts
      if (!alert.is_active && !alert.isActive) return;

      const { id, alert_type, threshold, name } = alert;
      let conditionMet = false;
      let message = '';
      let icon = '';

      // Check conditions against live weather data
      switch (alert_type) {
        case 'temperature_high':
          if (weather.current?.temperature >= threshold) {
            conditionMet = true;
            message = `${name || 'High Temperature'}: It is currently ${weather.current.temperature}°C`;
            icon = '🔥';
          }
          break;
        case 'temperature_low':
          if (weather.current?.temperature <= threshold) {
            conditionMet = true;
            message = `${name || 'Low Temperature'}: It is currently ${weather.current.temperature}°C`;
            icon = '❄️';
          }
          break;
        case 'rain':
          if (weather.today_summary?.precipitation_probability_max >= threshold) {
            conditionMet = true;
            message = `${name || 'Rain Alert'}: ${weather.today_summary.precipitation_probability_max}% chance of rain today`;
            icon = '🌧️';
          }
          break;
        case 'high_wind':
          if (weather.current?.wind_speed >= threshold) {
            conditionMet = true;
            message = `${name || 'High Wind'}: Winds are currently at ${weather.current.wind_speed} km/h`;
            icon = '💨';
          }
          break;
        case 'aqi_high':
          if (weather.air_quality?.aqi_pm25 >= threshold) {
            conditionMet = true;
            message = `${name || 'High AQI'}: Air Quality Index (PM2.5) is ${weather.air_quality.aqi_pm25}`;
            icon = '😷';
          }
          break;
        default:
          break;
      }

      if (conditionMet) {
        if (!notifiedAlerts.current.has(id)) {
          toast(message, {
            duration: 6000,
            style: {
              borderRadius: '12px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              border: '1px solid var(--border-card)',
              fontWeight: '600',
            },
          });
          notifiedAlerts.current.add(id);
        }
      } else {
        // If the condition is *no longer met* (e.g. temp dropped below threshold),
        // we remove it from the notified Set so it can trigger again next time it crosses the threshold.
        if (notifiedAlerts.current.has(id)) {
          notifiedAlerts.current.delete(id);
        }
      }
    });

  }, [weather, alerts]);

};
