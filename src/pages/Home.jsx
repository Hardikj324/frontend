import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { useWeather } from '../hooks/useWeather';
import { useDarkMode } from '../hooks/useDarkMode';
import { useWeatherStore } from '../store/weatherStore';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import LocationAutocomplete from '../components/Search/LocationAutocomplete';
import WeatherGlobe from '../components/Map/WeatherGlobe';
import {
  FiMapPin, FiNavigation, FiWind, FiDroplet, FiSun,
  FiEye, FiThermometer, FiActivity, FiClock
} from 'react-icons/fi';
import {
  getWeatherIcon, getTemperatureWarning, getAQILevel, getHealthRecommendation
} from '../utils/weatherHelpers';
import {
  formatTemperature, formatTime, formatUVIndex
} from '../utils/formatters';
import { format, parseISO } from 'date-fns';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── LIVE CLOCK ───────────────────────────────────────────────
function LiveClock({ timezone }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour12: true,
    timeZone: timezone || undefined
  };

  try {
    const formatter = new Intl.DateTimeFormat([], options);
    const parts = formatter.formatToParts(time);
    const getPart = (type) => parts.find(p => p.type === type)?.value;

    const hms = `${getPart('hour')}:${getPart('minute')}:${getPart('second')} ${getPart('dayPeriod') || ''}`;
    const dateStr = `${getPart('weekday')}, ${getPart('month')} ${getPart('day')}`;
    const displayTz = timezone ? timezone.split('/').pop().replace('_', ' ') : 'Local Time';

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontVariantNumeric: 'tabular-nums' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '0.02em' }}>{hms}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>•</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{dateStr}</span>
        {timezone && (
          <>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{displayTz}</span>
          </>
        )}
      </span>
    );
  } catch (e) {
    return <span>{time.toLocaleTimeString()}</span>;
  }
}



// ─── MAGNETIC CURSOR GLOW ─────────────────────────────────────
function CursorGlow({ accent }) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 80, damping: 25 });
  const sy = useSpring(y, { stiffness: 80, damping: 25 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div style={{
      position: 'fixed', left: sx, top: sy, zIndex: 1,
      width: '500px', height: '500px',
      borderRadius: '50%', pointerEvents: 'none',
      background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`,
      transform: 'translate(-50%, -50%)',
    }} />
  );
}

// ─── BIG TEMPERATURE DISPLAY ──────────────────────────────────
function HeroTemp({ current, locationName, updated }) {
  const warn = getTemperatureWarning(current.temperature);
  const weatherCode = current.weather_code;

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}
      >
        {/* Giant temperature */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <span style={{
              fontSize: 'clamp(6rem, 15vw, 9rem)', fontWeight: '900', lineHeight: 1,
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-muted) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-6px', fontVariantNumeric: 'tabular-nums',
            }}>
              {Math.round(current.temperature)}
            </span>
            <span style={{ fontSize: '3rem', fontWeight: '300', color: 'var(--text-secondary)', marginBottom: '12px' }}>°C</span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '500', marginTop: '4px' }}>
            {current.condition_description}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            Feels like {Math.round(current.feels_like)}° · Updated {updated}
          </p>
        </div>

        {/* Huge weather emoji floating */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.25))', lineHeight: 1 }}
        >
          {getWeatherIcon(weatherCode, current.is_day)}
        </motion.div>
      </motion.div>

      {/* Warning banner */}
      {warn.level !== 'normal' && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px',
            padding: '8px 16px', borderRadius: '50px',
            background: `${warn.color}20`, border: `1px solid ${warn.color}50`,
            backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: warn.color, animation: 'pulse 2s infinite' }} />
          <span style={{ color: warn.color, fontWeight: '700', fontSize: '0.85rem' }}>{warn.message}</span>
        </motion.div>
      )}
    </div>
  );
}

// ─── METRIC PILL  ─────────────────────────────────────────────
function MetricPill({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        backdropFilter: 'blur(20px)',
        cursor: 'default',
      }}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '10px',
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, border: `1px solid ${color}30` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '700',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</p>
        <p style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.9rem' }}>{value}</p>
      </div>
    </motion.div>
  );
}

// ─── MINI SPARKLINE ───────────────────────────────────────────
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          fill={`url(#spark_${color.replace('#', '')})`} dot={false} />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div style={{ background: 'rgba(0,0,0,0.8)', padding: '6px 10px', borderRadius: '8px',
                fontSize: '0.75rem', color }}>
                {Math.round(payload[0].value)}°
              </div>
            ) : null
          }
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── HOURLY TIMELINE CARD ─────────────────────────────────────
function HourlyTimeline({ hourly = [] }) {
  if (!hourly?.length) return null;
  const slice = hourly.slice(0, 12);
  const sparkData = slice.map(h => ({ v: h.temperature, t: h.time }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      style={{
        borderRadius: '24px', overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        backdropFilter: 'blur(30px)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.75rem',
          textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiClock size={12} /> Next 12 Hours
        </p>
      </div>

      {/* Sparkline */}
      <div style={{ padding: '0 1.5rem' }}>
        <Sparkline data={sparkData} color="#64b5f6" />
      </div>

      {/* Hourly pills */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '0 1.5rem 1.5rem', gap: '8px', scrollbarWidth: 'none' }}>
        {slice.map((h, i) => {
          const isNow = i === 0;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                flexShrink: 0, minWidth: '70px', textAlign: 'center',
                padding: '10px 8px', borderRadius: '14px',
                background: isNow ? 'rgba(100,181,246,0.2)' : 'rgba(255,255,255,0.04)',
                border: isNow ? '1px solid rgba(100,181,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p style={{ color: isNow ? '#64b5f6' : 'rgba(255,255,255,0.35)',
                fontSize: '0.65rem', fontWeight: '700', marginBottom: '6px' }}>
                {isNow ? 'Now' : h.time ? format(parseISO(h.time), 'HH:mm') : '--'}
              </p>
              <p style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{getWeatherIcon(h.weather_code, h.is_day)}</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.85rem' }}>{Math.round(h.temperature)}°</p>
              <p style={{ color: '#60a5fa', fontSize: '0.6rem', marginTop: '3px' }}>
                {h.precipitation_probability != null ? `${h.precipitation_probability}%` : ''}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── 7-DAY STRIP ─────────────────────────────────────────────
function WeekStrip({ daily = [] }) {
  if (!daily?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      style={{
        borderRadius: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        backdropFilter: 'blur(30px)',
        padding: '1.25rem 1.5rem',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.75rem',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
        📅 7-Day Outlook
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {daily.slice(0, 7).map((d, i) => {
          let dayStr = i === 0 ? 'Today'
            : i === 1 ? 'Tomorrow'
            : d.date ? format(parseISO(d.date), 'EEEE') : '---';
          const rainPct = d.precipitation_probability_max ?? 0;
          const maxT = Math.round(d.temperature_max);
          const minT = Math.round(d.temperature_min);
          const range = 40;
          const barLeft  = ((minT + 10) / range) * 100;
          const barWidth = ((maxT - minT) / range) * 100;

          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              style={{ display: 'grid', alignItems: 'center', gridTemplateColumns: '90px 36px 36px 1fr 70px',
                gap: '10px', padding: '10px 12px', borderRadius: '12px',
                transition: 'background 0.2s' }}
            >
              <span style={{ color: i === 0 ? '#64b5f6' : 'rgba(255,255,255,0.75)',
                fontWeight: i === 0 ? '800' : '500', fontSize: '0.85rem' }}>{dayStr}</span>
              <span style={{ fontSize: '1.3rem', textAlign: 'center' }}>{getWeatherIcon(d.weather_code, true)}</span>
              <span style={{ color: '#60a5fa', fontSize: '0.72rem', fontWeight: '600', textAlign: 'center' }}>
                💧{Math.round(rainPct)}%
              </span>
              {/* Temp range bar */}
              <div style={{ position: 'relative', height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                <div style={{
                  position: 'absolute', top: 0, height: '100%', borderRadius: '99px',
                  left: `${Math.max(0, barLeft)}%`, width: `${Math.max(5, Math.min(barWidth, 100 - barLeft))}%`,
                  background: 'linear-gradient(90deg, #60a5fa, #fb923c)'
                }} />
              </div>
              <div style={{ textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'baseline' }}>
                <span style={{ color: '#fb923c', fontWeight: '800', fontSize: '0.88rem' }}>{maxT}°</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{minT}°</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── AQI PANEL ───────────────────────────────────────────────
function AQIPanel({ airQuality }) {
  if (!airQuality?.aqi_pm25) return null;
  const aqi   = airQuality.aqi_pm25;
  const level = getAQILevel(aqi);
  const rec   = getHealthRecommendation(aqi);
  const pct   = Math.min((aqi / 300) * 100, 100);
  const circ  = 2 * Math.PI * 32;

  const pollutants = [
    { l: 'PM2.5', v: airQuality.pm25, u: 'µg/m³' },
    { l: 'PM10',  v: airQuality.pm10,  u: 'µg/m³' },
    { l: 'NO₂',   v: airQuality.nitrogen_dioxide, u: 'ppb' },
    { l: 'O₃',    v: airQuality.ozone, u: 'ppb' },
  ].filter(p => p.v != null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
      style={{
        borderRadius: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        backdropFilter: 'blur(30px)',
        padding: '1.5rem',
      }}
    >
      <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.75rem',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
        💨 Air Quality
      </p>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Ring */}
        <svg width="90" height="90" viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle cx="40" cy="40" r="32" fill="none" stroke={level.color} strokeWidth="8"
            strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 40 40)"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 10px ${level.color}88)` }}
          />
          <text x="40" y="36" textAnchor="middle" style={{ fill: level.color, fontSize: '14px', fontWeight: '900' }}>{Math.round(aqi)}</text>
          <text x="40" y="50" textAnchor="middle" style={{ fill: 'rgba(255,255,255,0.3)', fontSize: '7px', fontWeight: '700' }}>AQI</text>
        </svg>

        <div style={{ flex: 1 }}>
          <p style={{ color: level.color, fontWeight: '800', fontSize: '0.95rem', marginBottom: '4px' }}>{rec.icon} {level.label}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '10px' }}>{rec.advice}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {pollutants.map(({ l, v, u }) => (
              <div key={l} style={{ padding: '6px 10px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.62rem', fontWeight: '700' }}>{l}</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.82rem' }}>{v?.toFixed(1)} <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>{u}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── WEATHER STORY CHIP ───────────────────────────────────────
function InsightChip({ weather }) {
  const story = useMemo(() => {
    if (!weather) return '';
    const { current, air_quality } = weather;
    const { temperature: temp, condition_description: cond, wind_speed: ws } = current;
    const aqi = air_quality?.aqi_pm25;
    let n = '';
    if (temp >= 35) n = '🔥 Scorching hot! '; else if (temp >= 25) n = '☀️ Warm & pleasant. ';
    else if (temp >= 15) n = '🌤️ Mild & comfortable. '; else if (temp >= 5) n = '🧊 Cool & crisp. '; else n = '🥶 Freezing cold! ';
    const cl = cond.toLowerCase();
    if (cl.includes('clear') || cl.includes('sunny')) n += 'Perfect for outdoors. ';
    else if (cl.includes('rain')) n += 'Rainy — grab an umbrella! ';
    else if (cl.includes('snow')) n += 'Snowy — bundle up! ';
    else if (cl.includes('storm')) n += 'Storm incoming — stay safe! ';
    if (ws > 40) n += 'Strong winds blowing. '; else if (ws > 20) n += 'Moderate breeze. ';
    if (aqi != null) {
      if (aqi <= 50) n += '✅ Excellent air quality!';
      else if (aqi <= 100) n += '⚠️ Acceptable air quality.';
      else n += '❌ Poor air — limit outdoors.';
    }
    return n;
  }, [weather]);

  if (!story) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '14px 18px', borderRadius: '18px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>📖</span>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '800',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
          Sky Insight
        </p>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{story}</p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HOME PAGE
// ═══════════════════════════════════════════════════════════════════
export default function Home() {
  const { darkMode } = useDarkMode();
  const [searchParams] = useSearchParams();
  const { location: geoLoc, error: geoError, loading: geoLoading } = useGeolocation();
  const setSelectedLocation = useWeatherStore(s => s.setSelectedLocation);
  const formattedUpdate     = useWeatherStore(s => s.getFormattedLastUpdated());

  const urlCity = searchParams.get('city');
  const urlLat  = parseFloat(searchParams.get('lat'));
  const urlLng  = parseFloat(searchParams.get('lng'));

  const [searched, setSearched] = useState(
    urlCity && urlLat && urlLng ? { name: urlCity, latitude: urlLat, longitude: urlLng } : null
  );
  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    if (urlCity && urlLat && urlLng) {
      const loc = { name: urlCity, latitude: urlLat, longitude: urlLng };
      setSearched(loc); setSelectedLocation(loc);
    }
  }, [urlCity, urlLat, urlLng]);

  const active = searched
    ? { latitude: searched.latitude, longitude: searched.longitude, name: searched.name }
    : geoLoc ? { ...geoLoc, name: null } : null;

  const { weather, loading: wxLoading } = useWeather(active?.latitude, active?.longitude);

  const accent = useMemo(() => {
    if (!weather) return '#64b5f6';
    const c = weather.current?.weather_code;
    if (c === 0 || c === 1) return weather.current?.is_day ? '#fbbf24' : '#4f8ef7';
    if (c >= 95) return '#a855f7';
    if (c >= 71 && c <= 77) return '#bfdbfe';
    if (c >= 50) return '#60a5fa';
    return '#64b5f6';
  }, [weather]);

  if (geoLoading && !searched) return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
      background: 'transparent',
    }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{ width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(100,180,246,0.15)', borderTopColor: '#64b5f6' }} />
      <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Locating you…</p>
    </div>
  );

  return (
    <>

      <CursorGlow accent={accent} />

      {/* Page scroll content ON TOP of canvas */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 40px', paddingTop: '80px' }}>

          {/* ── TOP STATUS BAR ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '32px', flexWrap: 'wrap', gap: '12px',
            }}
          >
            {/* Location + Clock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent,
                boxShadow: `0 0 10px ${accent}`, animation: 'pulse 2s infinite' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>
                {searched?.name
                  ? `📍 ${searched.name}`
                  : active ? `📍 ${active.latitude?.toFixed(2)}°N, ${active.longitude?.toFixed(2)}°E`
                  : '📍 Locating...'}
              </p>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FiClock size={11} /> <LiveClock timezone={searched?.timezone || weather?.timezone} />
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {searched && geoLoc && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSearched(null); setSelectedLocation(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '50px', border: '1px solid var(--border-card)',
                    background: 'var(--bg-card)', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', backdropFilter: 'blur(10px)',
                  }}>
                  <FiNavigation size={12} /> My Location
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowGlobe(g => !g)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '50px',
                  background: showGlobe ? accent : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${showGlobe ? accent : 'rgba(255,255,255,0.15)'}`,
                  color: showGlobe ? '#000' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', backdropFilter: 'blur(10px)',
                }}>
                🌍 {showGlobe ? 'Hide Globe' : 'Show Globe'}
              </motion.button>
            </div>
          </motion.div>

          {/* ── SEARCH BAR ── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ maxWidth: '560px', marginBottom: '36px' }}>
            <div style={{
              borderRadius: '18px', position: 'relative', zIndex: 50,
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.13)',
              backdropFilter: 'blur(30px)',
              boxShadow: `0 0 60px ${accent}15`,
            }}>
              <LocationAutocomplete onSelect={loc => {
                setSearched(loc); setSelectedLocation(loc);
              }} />
            </div>
          </motion.div>

          {/* ── GLOBE ── */}
          <AnimatePresence>
            {showGlobe && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                style={{ marginBottom: '32px', borderRadius: '24px', overflow: 'hidden',
                  border: '1px solid var(--border-card)', backdropFilter: 'blur(10px)' }}
              >
                <WeatherGlobe
                  onLocationSelect={loc => { setSearched(loc); setSelectedLocation(loc); }}
                  searchedLocation={searched}
                  userLocation={geoLoc}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── NO LOCATION STATE ── */}
          {!active && !geoLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center', padding: '5rem 2rem',
                borderRadius: '28px',
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-card)',
                backdropFilter: 'blur(20px)',
              }}>
              <p style={{ fontSize: '4rem', marginBottom: '16px' }}>🌍</p>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
                Search any city above
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Or enable location access to see live local weather.
              </p>
            </motion.div>
          )}

          {/* ── MAIN WEATHER CONTENT ── */}
          {active && (
            wxLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
                <LoadingSpinner size="lg" />
              </div>
            ) : weather ? (
              <>
                {/* ── BIG HERO TEMPERATURE ── */}
                <div style={{ marginBottom: '36px' }}>
                  <HeroTemp
                    current={weather.current}
                    locationName={searched?.name}
                    updated={formattedUpdate}
                  />
                </div>

                {/* ── METRICS GRID ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '10px',
                    marginBottom: '28px',
                  }}
                >
                  {[
                    { icon: FiDroplet, label: 'Humidity',   value: `${Math.round(weather.current.humidity)}%`,                    color: '#60a5fa' },
                    { icon: FiWind,    label: 'Wind',        value: `${Math.round(weather.current.wind_speed)} km/h`,              color: '#a3e635' },
                    { icon: FiThermometer, label: 'Feels Like', value: `${Math.round(weather.current.feels_like)}°C`,             color: '#fb923c' },
                    { icon: FiSun,     label: 'UV Index',    value: String(formatUVIndex(weather.current.uv_index)),               color: '#fbbf24' },
                    { icon: FiEye,     label: 'Visibility',  value: `${(weather.current.visibility/1000).toFixed(1)} km`,          color: '#c084fc' },
                    { icon: FiActivity,label: 'Pressure',    value: `${Math.round(weather.current.pressure)} hPa`,                color: '#f472b6' },
                  ].map((m, i) => <MetricPill key={m.label} {...m} delay={0.15 + i * 0.06} />)}
                </motion.div>

                {/* ── INSIGHT CHIP ── */}
                <div style={{ marginBottom: '28px' }}>
                  <InsightChip weather={weather} />
                </div>

                {/* ── TWO COLUMN GRID ── */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)',
                  gap: '20px',
                  marginBottom: '28px',
                  alignItems: 'start',
                }}>
                  {/* LEFT: Hourly + Week */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <HourlyTimeline hourly={weather.hourly_forecast} />
                    <WeekStrip daily={weather.daily_forecast} />
                  </div>

                  {/* RIGHT: AQI + Sunrise/Sunset card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <AQIPanel airQuality={weather.air_quality} />

                    {/* Sunrise / Sunset */}
                    {weather.daily_forecast?.[0] && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        style={{
                          borderRadius: '24px', padding: '1.5rem',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-card)',
                          backdropFilter: 'blur(30px)',
                        }}>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.75rem',
                          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>☀️ Sun Schedule</p>

                        {/* Sun arc visualization */}
                        <div style={{ position: 'relative', height: '80px', marginBottom: '16px' }}>
                          <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
                            <path d="M 10 70 Q 100 -10 190 70" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                            <motion.circle cx={0} cy={0} r="7" fill="#fbbf24"
                              style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }}
                              initial={{ offsetDistance: '0%' }}
                              animate={{ offsetDistance: `${Math.min(
                                Math.max(0,
                                  (() => {
                                    const now = new Date();
                                    const sr = weather.daily_forecast[0].sunrise ? new Date(weather.daily_forecast[0].sunrise) : null;
                                    const ss = weather.daily_forecast[0].sunset  ? new Date(weather.daily_forecast[0].sunset)  : null;
                                    if (!sr || !ss) return 50;
                                    const total = ss - sr;
                                    const elapsed = now - sr;
                                    return Math.round((elapsed / total) * 100);
                                  })()
                                ), 100)}%` }}
                              transition={{ duration: 2, ease: 'easeOut' }}
                            />
                          </svg>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {[
                            { emoji: '🌅', label: 'Sunrise', val: weather.daily_forecast[0].sunrise ? formatTime(weather.daily_forecast[0].sunrise) : '--', color: '#fbbf24' },
                            { emoji: '🌇', label: 'Sunset',  val: weather.daily_forecast[0].sunset  ? formatTime(weather.daily_forecast[0].sunset)  : '--', color: '#f87171' },
                          ].map(({ emoji, label, val, color }) => (
                            <div key={label} style={{ padding: '12px', borderRadius: '14px',
                              background: `${color}12`, border: `1px solid ${color}25`, textAlign: 'center' }}>
                              <p style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{emoji}</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '700',
                                textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
                              <p style={{ color: color, fontWeight: '800', fontSize: '1rem' }}>{val}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            ) : null
          )}

          {/* ── GEO ERROR ── */}
          {geoError && !searched && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: '16px', padding: '12px 18px', borderRadius: '14px',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <p style={{ color: '#f87171', fontSize: '0.85rem' }}>📍 {geoError}</p>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  );
}

