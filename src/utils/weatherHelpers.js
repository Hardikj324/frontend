import { WEATHER_CODES, AQI_LEVELS } from './constants';

export const getWeatherDescription = (code) => {
  return WEATHER_CODES[code] || 'Unknown';
};

export const getAQILevel = (aqi) => {
    if(aqi===null || aqi===undefined) return AQI_LEVELS.GOOD;

    for (const [_key, level] of Object.entries(AQI_LEVELS)) {
        if (aqi >= level.min && aqi <= level.max) {
          return level;
        }
      }      
    return AQI_LEVELS.HAZARDOUS;
}

export const getWeatherIcon = (code, isDay = true) => {
    const iconMap = {
      0: isDay ? '☀️' : '🌙',
      1: isDay ? '🌤️' : '🌤️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      48: '🌫️',
      51: '🌦️',
      53: '🌦️',
      55: '🌧️',
      56: '🌧️',
      57: '🌧️',
      61: '🌧️',
      63: '🌧️',
      65: '⛈️',
      66: '🌧️',
      67: '⛈️',
      71: '❄️',
      73: '❄️',
      75: '❄️',
      77: '❄️',
      80: '🌧️',
      81: '⛈️',
      82: '⛈️',
      85: '❄️',
      86: '❄️',
      95: '⛈️',
      96: '⛈️',
      99: '⛈️',
    };
    return iconMap[code] || '🌡️';
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
        icon: '✅',
      },
      MODERATE: {
        title: 'Air Quality is Moderate',
        advice: 'Generally acceptable, but there may be risk for some people.',
        icon: '⚠️',
      },
      UNHEALTHY_SENSITIVE: {
        title: 'Unhealthy for Sensitive Groups',
        advice: 'Sensitive groups should limit prolonged outdoor exertion. Wear masks if needed.',
        icon: '⚠️',
      },
      UNHEALTHY: {
        title: 'Air Quality is Unhealthy',
        advice: 'Everyone may begin to experience health effects. Limit outdoor activities.',
        icon: '❌',
      },
      VERY_UNHEALTHY: {
        title: 'Very Unhealthy',
        advice: 'Health alert: the entire population is more likely to be affected.',
        icon: '🚨',
      },
      HAZARDOUS: {
        title: 'Hazardous',
        advice: 'Health warning of emergency conditions: everyone should avoid outdoor exertion.',
        icon: '🚨',
      },
  }
  return recommendations[Object.keys(AQI_LEVELS).find(key => AQI_LEVELS[key] === level)] ||
    recommendations.GOOD;
};

export const getTemperatureWarning = (temp) => {
    if (temp >= 40) return { level: 'danger', message: '🔥 Extreme Heat Warning', color: '#ff0000' };
    if (temp >= 35) return { level: 'warning', message: '⚠️ Heat Advisory', color: '#ff6600' };
    if (temp <= -20) return { level: 'danger', message: '🥶 Extreme Cold Warning', color: '#0066ff' };
    if (temp <= 0) return { level: 'warning', message: '⚠️ Cold Advisory', color: '#0099ff' };
    return { level: 'normal', message: '✅ Normal Temperature', color: '#00ff00' };
  };