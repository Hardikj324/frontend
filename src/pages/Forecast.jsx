import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, Cell
} from 'recharts';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { formatTime, formatUVIndex } from '../utils/formatters';
import { getWeatherIcon } from '../utils/weatherHelpers';
import {
  FiArrowLeft, FiSunrise, FiSunset, FiWind, FiSun, FiDroplet,
  FiThermometer, FiEye, FiActivity, FiZap, FiCloud, FiNavigation
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const dayLabel = (date) => {
  try {
    const d = parseISO(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEE');
  } catch { return '---'; }
};

const fullDayLabel = (date) => {
  try { return format(parseISO(date), 'EEEE, MMM d'); }
  catch { return '---'; }
};

// Animated weather-condition background color
const darkConditionColors = {
  clear: { from: '#1a1040', to: '#0f3460', accent: '#fbbf24' },
  cloudy: { from: '#1e293b', to: '#334155', accent: '#94a3b8' },
  rain: { from: '#0c1445', to: '#1e3a5f', accent: '#60a5fa' },
  storm: { from: '#0d0d1a', to: '#1a0a2e', accent: '#a855f7' },
  snow: { from: '#1e3a5f', to: '#0f2744', accent: '#bfdbfe' },
};

const lightConditionColors = {
  clear: { from: '#e0f2fe', to: '#bae6fd', accent: '#f59e0b' },
  cloudy: { from: '#f1f5f9', to: '#e2e8f0', accent: '#64748b' },
  rain: { from: '#dbeafe', to: '#bfdbfe', accent: '#3b82f6' },
  storm: { from: '#ede9fe', to: '#ddd6fe', accent: '#8b5cf6' },
  snow: { from: '#eff6ff', to: '#dbeafe', accent: '#60a5fa' },
};

const getConditionKey = (code) => {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code >= 95) return 'storm';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 50) return 'rain';
  return 'clear';
};

// Floating animated particle canvas
function WeatherParticles({ conditionKey, palette }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const buildParticles = () => {
      particles = [];
      const COUNT = conditionKey === 'rain' ? 80 : conditionKey === 'snow' ? 50 : 30;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: conditionKey === 'snow' ? Math.random() * 3 + 1
            : conditionKey === 'rain' ? Math.random() * 1.5 + 0.5
              : Math.random() * 2 + 0.5,
          speedX: conditionKey === 'rain' ? (Math.random() - 0.3) * 1.5 : (Math.random() - 0.5) * 0.4,
          speedY: conditionKey === 'rain' ? Math.random() * 8 + 4
            : conditionKey === 'snow' ? Math.random() * 1 + 0.3
              : Math.random() * 0.6 + 0.1,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
    };

    buildParticles();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        if (conditionKey === 'rain') {
          ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`;
          ctx.lineWidth = p.r;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + 14);
          ctx.stroke();
        } else {
          ctx.fillStyle = conditionKey === 'cloudy' ? `rgba(148, 163, 184, ${p.opacity})` : `rgba(255, 255, 255, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        p.x += p.speedX; p.y += p.speedY;
        if (p.y > H) { p.y = -10; p.x = Math.random() * W; }
        if (p.x > W || p.x < 0) p.x = Math.random() * W;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [conditionKey]);

  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.45 }} />
  );
}

// Animated temperature progress ring
function TempRing({ value, max, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max((value + 10) / (max + 10), 0), 1);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-input)" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

// Radial metric bar
function MetricBar({ label, value, max, color, icon: Icon }) {
  const pct = Math.min(value / max, 1) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700' }}>
          <Icon size={12} style={{ color }} />{label}
        </span>
        <span style={{ color: color, fontSize: '0.82rem', fontWeight: '800' }}>{value}</span>
      </div>
      <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border-input)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}

// Custom chart tooltip
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)', borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(20px)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: '700', fontSize: '0.85rem' }}>
          {p.name}: {Math.round(p.value)}{p.name.includes('Temp') ? '°C' : p.name.includes('Rain') ? '%' : ` km/h`}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const TABS = [
  { id: 'cinema', label: '🎬 Sky Cinema' },
  { id: 'chart', label: '📈 Trend Lab' },
  { id: 'dna', label: '🧬 Weather DNA' },
  { id: 'hour', label: '⏱ Hour by Hour' },
];

export default function Forecast() {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();
  const conditionColors = darkMode ? darkConditionColors : lightConditionColors;
  
  const weather = useWeatherStore(s => s.weather);
  const [tab, setTab] = useState('cinema');
  const [activeDay, setActiveDay] = useState(0);
  const [chartMetric, setChartMetric] = useState('temp');

  if (!weather) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div className="card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '380px', width: '100%' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
        <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>No Location Selected</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Search for a city on the Home screen to see its full forecast.</p>
        <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          <FiArrowLeft /> Go to Dashboard
        </button>
      </motion.div>
    </div>
  );

  const daily = weather?.daily_forecast || [];
  const hourly = weather?.hourly_forecast || [];
  const day = daily[activeDay];
  if (!day) return null;

  const conditionKey = getConditionKey(day.weather_code);
  const palette = conditionColors[conditionKey];

  // Chart data arrays
  const tempChart = daily.slice(0, 7).map(d => ({
    name: dayLabel(d.date),
    'Max Temp': Math.round(d.temperature_max),
    'Min Temp': Math.round(d.temperature_min),
  }));

  const rainChart = daily.slice(0, 7).map(d => ({
    name: dayLabel(d.date),
    'Rain %': Math.round(d.precipitation_probability_max),
  }));

  const windChart = daily.slice(0, 7).map(d => ({
    name: dayLabel(d.date),
    'Wind km/h': Math.round(d.wind_speed_max),
  }));

  // DNA radar: normalize each metric 0–100
  const dnaData = daily.slice(0, 7).map(d => ({
    day: dayLabel(d.date),
    Heat: Math.round(((d.temperature_max + 20) / 80) * 100),
    Rain: Math.round(d.precipitation_probability_max),
    Wind: Math.round((d.wind_speed_max / 120) * 100),
    UV: Math.round((d.uv_index_max / 12) * 100),
    Cloud: d.precipitation_probability_max > 50 ? 80 : d.precipitation_probability_max > 20 ? 50 : 20,
  }));

  // Hourly slice — next 24 from current day
  const next24 = hourly.slice(0, 24);

  // ─── RENDER ───────────────────────────────
  return (
    <motion.div className="page-content page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            7-Day <span style={{ color: palette.accent }}>Forecast</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {weather.location_name || 'Your Location'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', borderRadius: '12px', padding: '6px', border: '1px solid var(--border-card)', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: '700', transition: 'all 0.2s',
                background: tab === t.id ? palette.accent : 'transparent',
                color: tab === t.id ? (darkMode ? '#000' : '#fff') : 'var(--text-secondary)',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 7-DAY STRIP ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '6px' }}>
        {daily.slice(0, 7).map((d, i) => {
          const ck = getConditionKey(d.weather_code);
          const pal = conditionColors[ck];
          return (
            <motion.button key={i} onClick={() => setActiveDay(i)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{
                flex: '0 0 auto', minWidth: '85px', borderRadius: '16px', cursor: 'pointer',
                padding: '12px 10px', textAlign: 'center', transition: 'all 0.25s',
                background: activeDay === i
                  ? `linear-gradient(160deg, ${pal.from}, ${pal.to})`
                  : 'var(--bg-card)',
                boxShadow: activeDay === i ? `0 0 20px ${pal.accent}40` : 'none',
                border: activeDay === i ? `1px solid ${pal.accent}60` : '1px solid var(--border-card)',
              }}>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', color: activeDay === i ? pal.accent : 'var(--text-muted)', marginBottom: '6px' }}>{dayLabel(d.date)}</p>
              <p style={{ fontSize: '1.6rem', lineHeight: 1, marginBottom: '6px' }}>{getWeatherIcon(d.weather_code, true)}</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '800', color: activeDay === i ? 'var(--text-primary)' : 'var(--text-primary)' }}>{Math.round(d.temperature_max)}°</p>
              <p style={{ fontSize: '0.72rem', color: activeDay === i ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{Math.round(d.temperature_min)}°</p>
            </motion.button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">

        {/* ═══ SKY CINEMA ═══ */}
        {tab === 'cinema' && (
          <motion.div key="cinema" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

            {/* Hero Scene */}
            <div style={{
              position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.5rem', height: '320px',
              background: `linear-gradient(160deg, ${palette.from} 0%, ${palette.to} 100%)`,
              border: `1px solid ${palette.accent}30`
            }}>
              <WeatherParticles conditionKey={conditionKey} palette={palette} />

              {/* Glow orb */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px',
                borderRadius: '50%', background: `radial-gradient(circle, ${palette.accent}20 0%, transparent 70%)`,
                filter: 'blur(40px)'
              }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2, padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      style={{ color: palette.accent, fontWeight: '800', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                      {fullDayLabel(day.date)}
                    </motion.p>
                    <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                      style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700', maxWidth: '260px', lineHeight: 1.4 }}>
                      {day.condition_description}
                    </motion.h2>
                  </div>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                    style={{ fontSize: '5rem', lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
                    {getWeatherIcon(day.weather_code, true)}
                  </motion.span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <TempRing value={day.temperature_max} max={50} color="#fb923c" size={80} />
                      <div>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                          style={{ color: 'var(--text-primary)', fontSize: '3.5rem', fontWeight: '900', lineHeight: 1, letterSpacing: '-2px' }}>
                          {Math.round(day.temperature_max)}°
                        </motion.p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                          Feels like {Math.round(day.temperature_min + 2)}° · Low {Math.round(day.temperature_min)}°
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    {[
                      { icon: FiDroplet, val: `${Math.round(day.precipitation_probability_max)}%`, label: 'Rain', color: '#60a5fa' },
                      { icon: FiWind, val: `${Math.round(day.wind_speed_max)}`, label: 'km/h', color: '#a3e635' },
                      { icon: FiSun, val: `${formatUVIndex(day.uv_index_max)}`, label: 'UV', color: '#fbbf24' },
                    ].map(({ icon: Icon, val, label, color }, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                        style={{ textAlign: 'center' }}>
                        <Icon size={14} style={{ color, marginBottom: '4px' }} />
                        <p style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.1rem' }}>{val}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: '600' }}>{label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '12px', marginBottom: '1.5rem' }}>
              {[
                { icon: FiSunrise, label: 'Sunrise', val: day.sunrise ? formatTime(day.sunrise) : '--', color: '#fbbf24' },
                { icon: FiSunset, label: 'Sunset', val: day.sunset ? formatTime(day.sunset) : '--', color: '#f87171' },
                { icon: FiWind, label: 'Max Wind', val: `${Math.round(day.wind_speed_max)} km/h`, color: '#a3e635' },
                { icon: FiDroplet, label: 'Rain Prob', val: `${Math.round(day.precipitation_probability_max)}%`, color: '#60a5fa' },
                { icon: FiSun, label: 'UV Index', val: `${formatUVIndex(day.uv_index_max)}`, color: '#fb923c' },
                { icon: FiNavigation, label: 'Wind Dir', val: day.wind_direction_dominant != null ? `${day.wind_direction_dominant}°` : '--', color: '#c084fc' },
              ].map(({ icon: Icon, label, val, color }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  whileHover={{ y: -4, boxShadow: `0 8px 30px ${color}20` }}
                  style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.2rem', border: `1px solid var(--border-card)`, cursor: 'default', transition: 'box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                  </div>
                  <p style={{ color: color, fontSize: '1.4rem', fontWeight: '900', lineHeight: 1 }}>{val}</p>
                </motion.div>
              ))}
            </div>

            {/* Day condition metrics bar */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1.2rem' }}>Day Condition Profile</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {[
                  { label: 'Rain Probability', value: `${Math.round(day.precipitation_probability_max)}%`, rawValue: day.precipitation_probability_max, max: 100, color: '#60a5fa', icon: FiDroplet },
                  { label: 'Wind Speed', value: `${Math.round(day.wind_speed_max)} km/h`, rawValue: day.wind_speed_max, max: 120, color: '#a3e635', icon: FiWind },
                  { label: 'UV Index', value: `${formatUVIndex(day.uv_index_max)}`, rawValue: day.uv_index_max, max: 12, color: '#fb923c', icon: FiSun },
                ].map(({ label, value, rawValue, max, color, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: '700' }}>
                        <Icon size={12} style={{ color }} /> {label}
                      </span>
                      <span style={{ color, fontSize: '0.82rem', fontWeight: '800' }}>{value}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border-input)', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }}
                        animate={{ width: `${Math.min((rawValue / max) * 100, 100)}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${color}60, ${color})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ TREND LAB ═══ */}
        {tab === 'chart' && (
          <motion.div key="chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Metric switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'temp', label: '🌡 Temperature', color: '#fb923c' },
                { id: 'rain', label: '💧 Rain Chance', color: '#60a5fa' },
                { id: 'wind', label: '💨 Wind Speed', color: '#a3e635' },
              ].map(m => (
                <button key={m.id} onClick={() => setChartMetric(m.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem',
                    background: chartMetric === m.id ? m.color : 'var(--bg-card)',
                    color: chartMetric === m.id ? '#000' : 'var(--text-secondary)',
                    border: `1px solid ${chartMetric === m.id ? m.color : 'var(--border-card)'}`,
                    boxShadow: chartMetric === m.id ? `0 0 20px ${m.color}40` : 'none',
                    transition: 'all 0.2s',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <AnimatePresence mode="wait">
                {chartMetric === 'temp' && (
                  <motion.div key="temp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '1.5rem' }}>7-Day Temperature Trend</p>
                    <ResponsiveContainer width="100%" height={340}>
                      <AreaChart data={tempChart} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gMax" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gMin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="Max Temp" stroke="#fb923c" strokeWidth={3} fill="url(#gMax)" dot={{ fill: '#fb923c', strokeWidth: 0, r: 4 }} activeDot={{ r: 7 }} />
                        <Area type="monotone" dataKey="Min Temp" stroke="#93c5fd" strokeWidth={3} fill="url(#gMin)" dot={{ fill: '#93c5fd', strokeWidth: 0, r: 4 }} activeDot={{ r: 7 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ width: '16px', height: '3px', borderRadius: '2px', background: '#fb923c', display: 'inline-block' }} /> High
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ width: '16px', height: '3px', borderRadius: '2px', background: '#93c5fd', display: 'inline-block' }} /> Low
                      </span>
                    </div>
                  </motion.div>
                )}
                {chartMetric === 'rain' && (
                  <motion.div key="rain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '1.5rem' }}>Daily Rain Probability</p>
                    <ResponsiveContainer width="100%" height={340}>
                      <BarChart data={rainChart} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="Rain %" radius={[8, 8, 0, 0]} fill="url(#rainGrad)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
                {chartMetric === 'wind' && (
                  <motion.div key="wind" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '1.5rem' }}>Daily Max Wind Speed</p>
                    <ResponsiveContainer width="100%" height={340}>
                      <AreaChart data={windChart} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a3e635" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="Wind km/h" stroke="#a3e635" strokeWidth={3} fill="url(#windGrad)" dot={{ fill: '#a3e635', r: 4, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ═══ WEATHER DNA ═══ */}
        {tab === 'dna' && (
          <motion.div key="dna" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '6px' }}>Weather DNA Radar</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>Multi-dimensional weather fingerprint for today. Each axis is normalized 0–100.</p>
              <ResponsiveContainer width="100%" height={360}>
                <RadarChart data={[
                  { axis: 'Heat', val: dnaData[activeDay]?.Heat || 0 },
                  { axis: 'Rain', val: dnaData[activeDay]?.Rain || 0 },
                  { axis: 'Wind', val: dnaData[activeDay]?.Wind || 0 },
                  { axis: 'UV', val: dnaData[activeDay]?.UV || 0 },
                  { axis: 'Cloud', val: dnaData[activeDay]?.Cloud || 0 },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }} />
                  <Radar name="Today" dataKey="val" stroke={palette.accent} fill={palette.accent} fillOpacity={0.18} strokeWidth={2} dot={{ r: 4, fill: palette.accent }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison table */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '1.2rem' }}>Week Comparison</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dnaData.map((d, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => setActiveDay(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        background: activeDay === i ? `${palette.accent}15` : 'var(--bg-input)',
                        border: activeDay === i ? `1px solid ${palette.accent}40` : '1px solid transparent',
                        transition: 'all 0.2s'
                      }}>
                    <span style={{ fontSize: '1.3rem', width: '28px', textAlign: 'center' }}>{getWeatherIcon(daily[i]?.weather_code, true)}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700', width: '70px', flexShrink: 0 }}>{d.day}</span>
                    {[
                      { label: 'Heat', val: d.Heat, color: '#fb923c' },
                      { label: 'Rain', val: d.Rain, color: '#60a5fa' },
                      { label: 'Wind', val: d.Wind, color: '#a3e635' },
                      { label: 'UV', val: d.UV, color: '#fbbf24' },
                    ].map(m => (
                      <div key={m.label} style={{ flex: 1 }}>
                        <div style={{ height: '5px', borderRadius: '99px', background: 'var(--border-input)', overflow: 'hidden' }}>
                          <motion.div
                            animate={{ width: `${m.val}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ height: '100%', background: m.color, borderRadius: '99px', opacity: 0.85 }}
                          />
                        </div>
                      </div>
                    ))}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', width: '60px', textAlign: 'right' }}>
                      {Math.round(daily[i]?.temperature_max)}° / {Math.round(daily[i]?.temperature_min)}°
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ HOUR BY HOUR ═══ */}
        {tab === 'hour' && (
          <motion.div key="hour" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '1.5rem' }}>Next 24-Hour Temperature</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={next24.map(h => ({
                  time: h.time ? format(parseISO(h.time), 'HH:mm') : '--',
                  temp: Math.round(h.temperature)
                }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.accent} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={palette.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="time" stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={3} />
                  <YAxis stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="temp" name="Temp" stroke={palette.accent} strokeWidth={3} fill="url(#hourGrad)" dot={false} activeDot={{ r: 5, fill: palette.accent }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly card grid */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
              {next24.filter((_, i) => i % 2 === 0).map((h, i) => {
                const tp = h.temperature;
                const condKey = h.weather_code != null ? getConditionKey(h.weather_code) : 'clear';
                const pal = conditionColors[condKey];
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{
                      flex: '0 0 auto', width: '90px', borderRadius: '16px', padding: '14px 10px', textAlign: 'center',
                      background: darkMode ? `linear-gradient(180deg, ${pal.from}cc, ${pal.to}cc)` : `linear-gradient(180deg, ${pal.from}, ${pal.to})`,
                      border: `1px solid ${pal.accent}30`
                    }}>
                    <p style={{ color: pal.accent, fontSize: '0.68rem', fontWeight: '700', marginBottom: '8px' }}>
                      {h.time ? format(parseISO(h.time), 'HH:mm') : '--'}
                    </p>
                    <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{getWeatherIcon(h.weather_code, true)}</p>
                    <p style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.95rem', marginBottom: '4px' }}>{Math.round(tp)}°</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                      {h.precipitation_probability != null ? `💧${Math.round(h.precipitation_probability)}%` : ''}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
