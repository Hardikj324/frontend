import { format, parseISO } from 'date-fns';

export const formatTemperature = (temp) => {
  if (temp === null || temp === undefined) return '--°C';
  return `${Math.round(temp)}°C`;
};

export const formatDate = (date) => {
    try {
      return format(parseISO(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };
  
  export const formatTime = (time) => {
    try {
      return format(parseISO(time), 'HH:mm');
    } catch {
      return 'Invalid time';
    }
  };
  
  export const formatDateTime = (date) => {
    try {
      return format(parseISO(date), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

export const formatWindSpeed = (speed) => {
  if (speed === null || speed === undefined) return '--';
  return `${Math.round(speed)} km/h`;
};

export const formatHumidity = (humidity) => {
  if (humidity === null || humidity === undefined) return '--';
  return `${Math.round(humidity)}%`;
};

export const formatPressure = (pressure) => {
  if (pressure === null || pressure === undefined) return '--';
  return `${Math.round(pressure)} hPa`;
};

export const formatVisibility = (visibility) => {
  if (visibility === null || visibility === undefined) return '--';
  return `${(visibility / 1000).toFixed(1)} km`;
};

export const formatUVIndex = (uv) => {
  if (uv === null || uv === undefined) return '--';
  return Math.round(uv * 10) / 10;
};

export const formatPrecipitation = (precipitation) => {
  if (precipitation === null || precipitation === undefined) return '--';
  return `${precipitation.toFixed(1)} mm`;
};