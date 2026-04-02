export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const WEATHER_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

export const AQI_LEVELS = {
  GOOD: { min: 0, max: 50, label: 'Good', color: '#00ff00', bgColor: '#00ff0022' },
  MODERATE: { min: 51, max: 100, label: 'Moderate', color: '#ffff00', bgColor: '#ffff0022' },
  UNHEALTHY_SENSITIVE: { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', color: '#ff7700', bgColor: '#ff770022' },
  UNHEALTHY: { min: 151, max: 200, label: 'Unhealthy', color: '#ff0000', bgColor: '#ff000022' },
  VERY_UNHEALTHY: { min: 201, max: 300, label: 'Very Unhealthy', color: '#8B0000', bgColor: '#8B000022' },
  HAZARDOUS: { min: 301, max: 500, label: 'Hazardous', color: '#800080', bgColor: '#80008022' },
};

export const WEATHER_ALERTS = {
  TEMP_HIGH: 'temperature_high',
  TEMP_LOW: 'temperature_low',
  RAIN: 'rain_expected',
  WIND: 'high_wind',
  AQI_HIGH: 'aqi_high',
};

export const ALERT_THRESHOLDS = {
  TEMP_HIGH: 35,
  TEMP_LOW: 0,
  RAIN: 60,
  WIND: 40,
  AQI_HIGH: 150,
};