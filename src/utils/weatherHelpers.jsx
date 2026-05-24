import React from 'react';
import { WEATHER_CODES, AQI_LEVELS } from './constants';
import {
  BsSun,
  BsMoon,
  BsCloudSun,
  BsCloud,
  BsCloudFog2,
  BsCloudDrizzle,
  BsCloudRain,
  BsCloudLightning,
  BsSnow,
  BsThermometerHigh,
  BsThermometerHalf,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsXCircleFill,
  BsExclamationOctagonFill
} from 'react-icons/bs';

export const getWeatherDescription = (code) => {
  return WEATHER_CODES[code] || 'Unknown';
};

export const getAQILevel = (aqi) => {
  if (aqi === null || aqi === undefined) return AQI_LEVELS.GOOD;

  for (const [_key, level] of Object.entries(AQI_LEVELS)) {
    if (aqi >= level.min && aqi <= level.max) {
      return level;
    }
  }
  return AQI_LEVELS.HAZARDOUS;
}

export const getWeatherIcon = (code, isDay = true) => {
  const iconMap = {
    0: { icon: isDay ? <BsSun /> : <BsMoon />, color: isDay ? '#fbbf24' : '#94a3b8' },
    1: { icon: <BsCloudSun />, color: isDay ? '#fcd34d' : '#94a3b8' },
    2: { icon: <BsCloudSun />, color: '#94a3b8' },
    3: { icon: <BsCloud />, color: '#cbd5e1' },
    45: { icon: <BsCloudFog2 />, color: '#94a3b8' },
    48: { icon: <BsCloudFog2 />, color: '#94a3b8' },
    51: { icon: <BsCloudDrizzle />, color: '#60a5fa' },
    53: { icon: <BsCloudDrizzle />, color: '#60a5fa' },
    55: { icon: <BsCloudRain />, color: '#3b82f6' },
    56: { icon: <BsCloudRain />, color: '#3b82f6' },
    57: { icon: <BsCloudRain />, color: '#3b82f6' },
    61: { icon: <BsCloudRain />, color: '#2563eb' },
    63: { icon: <BsCloudRain />, color: '#1e40af' },
    65: { icon: <BsCloudLightning />, color: '#a855f7' },
    66: { icon: <BsCloudRain />, color: '#3b82f6' },
    67: { icon: <BsCloudLightning />, color: '#a855f7' },
    71: { icon: <BsSnow />, color: '#bfdbfe' },
    73: { icon: <BsSnow />, color: '#bfdbfe' },
    75: { icon: <BsSnow />, color: '#bfdbfe' },
    77: { icon: <BsSnow />, color: '#bfdbfe' },
    80: { icon: <BsCloudRain />, color: '#3b82f6' },
    81: { icon: <BsCloudLightning />, color: '#a855f7' },
    82: { icon: <BsCloudLightning />, color: '#a855f7' },
    85: { icon: <BsSnow />, color: '#bfdbfe' },
    86: { icon: <BsSnow />, color: '#bfdbfe' },
    95: { icon: <BsCloudLightning />, color: '#a855f7' },
    96: { icon: <BsCloudLightning />, color: '#a855f7' },
    99: { icon: <BsCloudLightning />, color: '#a855f7' },
  };

  const { icon, color } = iconMap[code] || { icon: <BsThermometerHalf />, color: '#f87171' };
  
  return (
    <span style={{ 
      color, 
      filter: `drop-shadow(0 0 12px ${color}60)`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </span>
  );
};

export const getBackgroundGradient = (code) => {
  if (code === 0 || code === 1) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  if (code === 2 || code === 3) {
    return 'linear-gradient(135deg, #667eea 0%, #424242 100%)';
  }
  if (code >= 45 && code <= 82) {
    return 'linear-gradient(135deg, #424242 0%, #212121 100%)';
  }
  if (code >= 95 && code <= 99) {
    return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
  }
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

export const getHealthRecommendation = (aqi) => {
  const level = getAQILevel(aqi);

  const recommendations = {
    GOOD: {
      title: 'Air Quality is Good',
      advice: 'Perfect day for outdoor activities! No air quality restrictions.',
      icon: <BsCheckCircleFill />,
    },
    MODERATE: {
      title: 'Air Quality is Moderate',
      advice: 'Generally acceptable, but there may be risk for some people.',
      icon: <BsExclamationTriangleFill />,
    },
    UNHEALTHY_SENSITIVE: {
      title: 'Unhealthy for Sensitive Groups',
      advice: 'Sensitive groups should limit prolonged outdoor exertion. Wear masks if needed.',
      icon: <BsExclamationTriangleFill />,
    },
    UNHEALTHY: {
      title: 'Air Quality is Unhealthy',
      advice: 'Everyone may begin to experience health effects. Limit outdoor activities.',
      icon: <BsXCircleFill />,
    },
    VERY_UNHEALTHY: {
      title: 'Very Unhealthy',
      advice: 'Health alert: the entire population is more likely to be affected.',
      icon: <BsExclamationOctagonFill />,
    },
    HAZARDOUS: {
      title: 'Hazardous',
      advice: 'Health warning of emergency conditions: everyone should avoid outdoor exertion.',
      icon: <BsExclamationOctagonFill />,
    },
  };

  return recommendations[Object.keys(AQI_LEVELS).find(key => AQI_LEVELS[key] === level)] ||
    recommendations.GOOD;
};


export const getTemperatureWarning = (temp) => {
  if (temp >= 40) return { level: 'danger', message: 'Extreme Heat Warning', icon: <BsThermometerHigh />, color: '#ff0000' };
  if (temp >= 35) return { level: 'warning', message: 'Heat Advisory', icon: <BsThermometerHigh />, color: '#ff6600' };
  if (temp <= -20) return { level: 'danger', message: 'Extreme Cold Warning', icon: <BsSnow />, color: '#0066ff' };
  if (temp <= 0) return { level: 'warning', message: 'Cold Advisory', icon: <BsSnow />, color: '#0099ff' };
  return { level: 'normal', message: 'Normal Temperature', icon: <BsCheckCircleFill />, color: '#00ff00' };
};