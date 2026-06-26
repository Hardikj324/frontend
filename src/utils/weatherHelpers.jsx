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

const SunIcon = () => (
  <svg viewBox="0 0 100 100" className="rotate-slow" style={{ width: '1em', height: '1em' }}>
    <defs>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </radialGradient>
    </defs>
    <g stroke="#f59e0b" strokeWidth="6" strokeLinecap="round">
      <line x1="50" y1="12" x2="50" y2="2" />
      <line x1="50" y1="88" x2="50" y2="98" />
      <line x1="12" y1="50" x2="2" y2="50" />
      <line x1="88" y1="50" x2="98" y2="50" />
      <line x1="23" y1="23" x2="16" y2="16" />
      <line x1="77" y1="77" x2="84" y2="84" />
      <line x1="77" y1="23" x2="84" y2="16" />
      <line x1="23" y1="77" x2="16" y2="84" />
    </g>
    <circle cx="50" cy="50" r="24" fill="url(#sunGlow)" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 100 100" className="drift" style={{ width: '1em', height: '1em' }}>
    <defs>
      <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <path d="M40 25 C60 25 75 40 75 60 C75 72 68 83 58 88 C75 88 90 73 90 55 C90 35 74 20 54 20 C48 20 42 22 38 25 C39 25 40 25 40 25 Z" fill="url(#moonGrad)" />
    <circle cx="25" cy="35" r="2.5" fill="#fef08a" className="pulse-star-1" />
    <circle cx="32" cy="50" r="1.5" fill="#fff" className="pulse-star-2" />
  </svg>
);

const CloudIcon = ({ type }) => {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '1em', height: '1em' }}>
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="cloudBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      {type === 'partly-day' && (
        <g transform="translate(10, 10) scale(0.7)" className="rotate-slow">
          <circle cx="50" cy="50" r="24" fill="#fbbf24" />
          <g stroke="#f59e0b" strokeWidth="6" strokeLinecap="round">
            <line x1="50" y1="12" x2="50" y2="2" /><line x1="50" y1="88" x2="50" y2="98" />
            <line x1="12" y1="50" x2="2" y2="50" /><line x1="88" y1="50" x2="98" y2="50" />
          </g>
        </g>
      )}
      {type === 'partly-night' && (
        <g transform="translate(12, 10) scale(0.65)">
          <path d="M40 25 C60 25 75 40 75 60 C75 72 68 83 58 88 C75 88 90 73 90 55 C90 35 74 20 54 20 C48 20 42 22 38 25 C39 25 40 25 40 25 Z" fill="#cbd5e1" />
        </g>
      )}
      {type === 'cloudy' && (
        <path d="M30 65 L70 65 A15 15 0 0 0 70 35 A10 10 0 0 0 55 30 A20 20 0 0 0 30 35 A15 15 0 0 0 30 65 Z" fill="url(#cloudBackGrad)" transform="translate(-8, -4) scale(0.9)" opacity="0.8" />
      )}
      <path d="M25 70 L75 70 A18 18 0 0 0 75 34 A12 12 0 0 0 60 28 A24 24 0 0 0 25 34 A18 18 0 0 0 25 70 Z" fill="url(#cloudGrad)" className="drift-horizontal" />
    </svg>
  );
};

const RainIcon = ({ intensity }) => {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '1em', height: '1em' }}>
      <defs>
        <linearGradient id="rainCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <path d="M25 60 L75 60 A18 18 0 0 0 75 24 A12 12 0 0 0 60 18 A24 24 0 0 0 25 24 A18 18 0 0 0 25 60 Z" fill="url(#rainCloud)" />
      <g stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="38" y1="65" x2="33" y2="77" className="rain-drop-1" />
        <line x1="50" y1="65" x2="45" y2="77" className="rain-drop-2" />
        <line x1="62" y1="65" x2="57" y2="77" className="rain-drop-3" />
        {intensity === 'heavy' && (
          <>
            <line x1="44" y1="70" x2="39" y2="82" className="rain-drop-2" />
            <line x1="56" y1="70" x2="51" y2="82" className="rain-drop-1" />
          </>
        )}
      </g>
    </svg>
  );
};

const ThunderstormIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: '1em', height: '1em' }}>
    <defs>
      <linearGradient id="stormCloud" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    <path d="M25 60 L75 60 A18 18 0 0 0 75 24 A12 12 0 0 0 60 18 A24 24 0 0 0 25 24 A18 18 0 0 0 25 60 Z" fill="url(#stormCloud)" />
    <polygon points="52,58 44,74 52,74 46,90 60,68 52,68" fill="#fbbf24" className="lightning-flash" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
  </svg>
);

const SnowIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: '1em', height: '1em' }}>
    <defs>
      <linearGradient id="snowCloud" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
    </defs>
    <path d="M25 60 L75 60 A18 18 0 0 0 75 24 A12 12 0 0 0 60 18 A24 24 0 0 0 25 24 A18 18 0 0 0 25 60 Z" fill="url(#snowCloud)" />
    <g stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" transform="translate(36, 70) scale(0.75)" className="rotate-slow">
      <line x1="0" y1="-8" x2="0" y2="8" /><line x1="-8" y1="0" x2="8" y2="0" />
      <line x1="-6" y1="-6" x2="6" y2="6" /><line x1="-6" y1="6" x2="6" y2="-6" />
    </g>
    <g stroke="#93c5fd" strokeWidth="2.0" strokeLinecap="round" transform="translate(54, 73) scale(0.55)" className="rotate-fast">
      <line x1="0" y1="-8" x2="0" y2="8" /><line x1="-8" y1="0" x2="8" y2="0" />
      <line x1="-6" y1="-6" x2="6" y2="6" /><line x1="-6" y1="6" x2="6" y2="-6" />
    </g>
  </svg>
);

const FogIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: '1em', height: '1em' }}>
    <defs>
      <linearGradient id="fogCloud" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <path d="M25 55 L75 55 A18 18 0 0 0 75 19 A12 12 0 0 0 60 13 A24 24 0 0 0 25 19 A18 18 0 0 0 25 55 Z" fill="url(#fogCloud)" opacity="0.8" />
    <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" opacity="0.9">
      <line x1="20" y1="65" x2="80" y2="65" className="fog-line-1" />
      <line x1="25" y1="73" x2="75" y2="73" className="fog-line-2" />
      <line x1="30" y1="81" x2="70" y2="81" className="fog-line-3" />
    </g>
  </svg>
);

export const getWeatherIcon = (code, isDay = true) => {
  const iconMap = {
    0: { icon: isDay ? <SunIcon /> : <MoonIcon />, color: isDay ? '#fbbf24' : '#94a3b8' },
    1: { icon: <CloudIcon type={isDay ? 'partly-day' : 'partly-night'} />, color: isDay ? '#fcd34d' : '#94a3b8' },
    2: { icon: <CloudIcon type={isDay ? 'partly-day' : 'partly-night'} />, color: '#94a3b8' },
    3: { icon: <CloudIcon type="cloudy" />, color: '#cbd5e1' },
    45: { icon: <FogIcon />, color: '#94a3b8' },
    48: { icon: <FogIcon />, color: '#94a3b8' },
    51: { icon: <RainIcon intensity="light" />, color: '#60a5fa' },
    53: { icon: <RainIcon intensity="light" />, color: '#60a5fa' },
    55: { icon: <RainIcon intensity="heavy" />, color: '#3b82f6' },
    56: { icon: <RainIcon intensity="light" />, color: '#3b82f6' },
    57: { icon: <RainIcon intensity="heavy" />, color: '#3b82f6' },
    61: { icon: <RainIcon intensity="light" />, color: '#2563eb' },
    63: { icon: <RainIcon intensity="heavy" />, color: '#1e40af' },
    65: { icon: <ThunderstormIcon />, color: '#a855f7' },
    66: { icon: <RainIcon intensity="light" />, color: '#3b82f6' },
    67: { icon: <ThunderstormIcon />, color: '#a855f7' },
    71: { icon: <SnowIcon />, color: '#bfdbfe' },
    73: { icon: <SnowIcon />, color: '#bfdbfe' },
    75: { icon: <SnowIcon />, color: '#bfdbfe' },
    77: { icon: <SnowIcon />, color: '#bfdbfe' },
    80: { icon: <RainIcon intensity="light" />, color: '#3b82f6' },
    81: { icon: <ThunderstormIcon />, color: '#a855f7' },
    82: { icon: <ThunderstormIcon />, color: '#a855f7' },
    85: { icon: <SnowIcon />, color: '#bfdbfe' },
    86: { icon: <SnowIcon />, color: '#bfdbfe' },
    95: { icon: <ThunderstormIcon />, color: '#a855f7' },
    96: { icon: <ThunderstormIcon />, color: '#a855f7' },
    99: { icon: <ThunderstormIcon />, color: '#a855f7' },
  };

  const { icon, color } = iconMap[code] || { icon: <BsThermometerHalf />, color: '#f87171' };
  
  return (
    <>
      <style>{`
        @keyframes rotateSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes rotateFast { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        @keyframes drift { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes driftHorizontal { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(3px); } }
        @keyframes pulseStar { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes rainDrop { 0% { transform: translate(0, 0); opacity: 0; } 30% { opacity: 0.8; } 100% { transform: translate(-4px, 10px); opacity: 0; } }
        @keyframes lightningFlash { 0%, 90%, 94%, 98%, 100% { opacity: 0.2; } 92%, 96% { opacity: 1; } }
        @keyframes fogDrift { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(4px); } }
        .rotate-slow { animation: rotateSlow 25s linear infinite; transform-origin: center; }
        .rotate-fast { animation: rotateFast 10s linear infinite; transform-origin: center; }
        .drift { animation: drift 4s ease-in-out infinite; }
        .drift-horizontal { animation: driftHorizontal 6s ease-in-out infinite; }
        .pulse-star-1 { animation: pulseStar 3s ease-in-out infinite; }
        .pulse-star-2 { animation: pulseStar 2s ease-in-out infinite; }
        .rain-drop-1 { animation: rainDrop 1.2s linear infinite; }
        .rain-drop-2 { animation: rainDrop 0.9s linear infinite; }
        .rain-drop-3 { animation: rainDrop 1.5s linear infinite; }
        .lightning-flash { animation: lightningFlash 3.5s ease-in-out infinite; }
        .fog-line-1 { animation: fogDrift 4s ease-in-out infinite; }
        .fog-line-2 { animation: fogDrift 3s ease-in-out infinite; }
        .fog-line-3 { animation: fogDrift 5s ease-in-out infinite; }
      `}</style>
      <span style={{ 
        color, 
        filter: `drop-shadow(0 0 12px ${color}60)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </span>
    </>
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