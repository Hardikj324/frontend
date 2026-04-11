import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getWeatherIcon } from '../utils/weatherHelpers';

const API_BASE = 'http://localhost:8000/api';

// ─── Weather gradient themes ──────────────────────────────────
function getCardTheme(code, isDay) {
  if (!isDay) return { bg: 'linear-gradient(135deg,#020818 0%,#0a1628 100%)', accent: '#4f8ef7', star: true };
  if (code === 0 || code === 1) return { bg: isDay ? 'linear-gradient(135deg,#1a3a6b 0%,#0f2547 100%)' : 'linear-gradient(135deg,#020c1b 0%,#050e1f 100%)', accent: '#fbbf24', star: false };
  if (code >= 95) return { bg: 'linear-gradient(135deg,#1a0533 0%,#0d0120 100%)', accent: '#c084fc', star: false };
  if (code >= 71 && code <= 77) return { bg: 'linear-gradient(135deg,#0e1929 0%,#162840 100%)', accent: '#bfdbfe', star: false };
  if (code >= 50) return { bg: 'linear-gradient(135deg,#061a3a 0%,#0a2040 100%)', accent: '#60a5fa', star: false };
  return { bg: 'linear-gradient(135deg,#0b1428 0%,#162240 100%)', accent: '#64b5f6', star: false };
}

function getTempColor(temp) {
  if (temp >= 40) return '#ef4444';
  if (temp >= 35) return '#f97316';
  if (temp >= 28) return '#fbbf24';
  if (temp >= 18) return '#34d399';
  if (temp >= 8) return '#60a5fa';
  if (temp >= 0) return '#93c5fd';
  return '#bfdbfe';
}

// ─── Animated canvas for each card ───────────────────────────
function CardCanvas({ code, isDay, theme }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 280;
    canvas.height = 360;

    let particles = [];
    const pType = code >= 50 && code < 71 ? 'rain' : code >= 71 && code <= 77 ? 'snow' : code >= 95 ? 'lightning' : 'star';
    const COUNT = pType === 'rain' ? 60 : pType === 'snow' ? 30 : pType === 'lightning' ? 4 : 40;

    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * 280, y: Math.random() * 360,
      size: Math.random() * 2 + 0.5,
      speedX: pType === 'rain' ? (Math.random() - 0.4) * 1.5 : (Math.random() - 0.5) * 0.2,
      speedY: pType === 'rain' ? Math.random() * 8 + 4 : pType === 'snow' ? Math.random() * 0.6 + 0.2 : Math.random() * 0.1,
      opacity: Math.random() * 0.6 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.05 + 0.01,
      life: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, 280, 360);
      particles.forEach(p => {
        p.twinkle += p.twinkleSpeed;
        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.twinkle));
        if (pType === 'rain') {
          ctx.strokeStyle = `rgba(147,197,253,${alpha * 0.4})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.speedX * 2, p.y + 14); ctx.stroke();
        } else if (pType === 'snow') {
          ctx.fillStyle = `rgba(219,234,254,${alpha})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size + 0.5, 0, Math.PI * 2); ctx.fill();
        } else if (pType === 'lightning') {
          p.life -= 0.02;
          if (p.life < 0) { p.life = 1; p.x = Math.random() * 280; p.y = 0; }
          const lAlpha = Math.max(0, p.life) * 0.3;
          ctx.strokeStyle = `rgba(196,130,255,${lAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y);
          for (let i = 0; i < 6; i++) {
            ctx.lineTo(p.x + (Math.random() - 0.5) * 20, p.y + 50 * (i + 1));
          }
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2); ctx.fill();
        }
        p.x += p.speedX; p.y += p.speedY;
        if (p.y > 370) { p.y = -10; p.x = Math.random() * 280; }
        if (p.x > 290 || p.x < -10) p.x = Math.random() * 280;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [code, isDay]);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', opacity: 0.6,
    }} />
  );
}

// ─── City Story Card ─────────────────────────────────────────
function CityCard({ city, index, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const theme = getCardTheme(city.weather_code, city.is_day);
  const tempColor = getTempColor(city.temperature);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 160, damping: 20 }}
      whileHover={{ scale: 1.04, y: -8, zIndex: 10 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onSelect(city)}
      style={{
        position: 'relative', width: '220px', height: '300px', borderRadius: '24px',
        flexShrink: 0, cursor: 'pointer', overflow: 'hidden',
        background: theme.bg,
        border: `1px solid ${theme.accent}25`,
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${theme.accent}20` : '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.3s',
      }}
    >
      <CardCanvas code={city.weather_code} isDay={city.is_day} theme={theme} />

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 30%, transparent 70%)' }} />

      {/* Country chip */}
      <div style={{
        position: 'absolute', top: '14px', left: '14px',
        padding: '4px 10px', borderRadius: '99px',
        background: `${theme.accent}20`, border: `1px solid ${theme.accent}40`,
        backdropFilter: 'blur(10px)',
        fontSize: '0.65rem', fontWeight: '800', color: theme.accent,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {city.country}
      </div>

      {/* Weather icon floating */}
      <motion.div
        animate={{ y: hovered ? [0, -6, 0] : 0, rotate: hovered ? [0, 5, -5, 0] : 0 }}
        transition={{ duration: 2, repeat: hovered ? Infinity : 0, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '40px', right: '14px',
          fontSize: '3rem', filter: `drop-shadow(0 0 12px ${theme.accent}60)`,
          lineHeight: 1,
        }}
      >
        {getWeatherIcon(city.weather_code, city.is_day)}
      </motion.div>

      {/* Bottom Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '1.3rem' }}>{city.emoji}</span>
          <span style={{ color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>{city.name}</span>
        </div>

        {/* Temperature */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '8px' }}>
          <span style={{
            fontSize: '3.2rem', fontWeight: '900', lineHeight: 1,
            color: tempColor, filter: `drop-shadow(0 0 10px ${tempColor}60)`,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(city.temperature)}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.4rem', marginBottom: '6px' }}>°C</span>
        </div>

        {/* Condition */}
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '500', marginBottom: '10px', lineHeight: 1.3 }}>
          {city.condition}
        </p>

        {/* Mini stats row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '💧', val: `${city.humidity}%` },
            { label: '💨', val: `${Math.round(city.wind_speed)}km/h` },
          ].map(({ label, val }) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center', padding: '6px 4px',
              borderRadius: '10px', background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
            }}>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>{label}</p>
              <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '800' }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hover glow border */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '24px',
              border: `2px solid ${theme.accent}60`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── City Detail Modal ────────────────────────────────────────
function CityModal({ city, onClose, onNavigate }) {
  const theme = getCardTheme(city.weather_code, city.is_day);
  const tempColor = getTempColor(city.temperature);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px', borderRadius: '32px',
          background: theme.bg, border: `1px solid ${theme.accent}30`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 60px ${theme.accent}15`,
          overflow: 'hidden', position: 'relative',
        }}
      >
        <CardCanvas code={city.weather_code} isDay={city.is_day} theme={theme} />
        <div style={{ position: 'relative', zIndex: 1, padding: '32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '2rem' }}>{city.emoji}</span>
                <h2 style={{ color: '#fff', fontWeight: '900', fontSize: '1.8rem' }}>{city.name}</h2>
              </div>
              <p style={{ color: theme.accent, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {city.country}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</motion.button>
          </div>

          {/* Temperature big */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '8px' }}>
            <motion.span
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                fontSize: '5rem', fontWeight: '900', lineHeight: 1,
                color: tempColor, filter: `drop-shadow(0 0 20px ${tempColor}50)`,
              }}
            >
              {Math.round(city.temperature)}
            </motion.span>
            <span style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>°C</span>
            <div style={{ marginBottom: '12px', fontSize: '3rem' }}>
              {getWeatherIcon(city.weather_code, city.is_day)}
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: '600', marginBottom: '24px' }}>
            {city.condition}
          </p>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { icon: '💧', label: 'Humidity', value: `${city.humidity}%` },
              { icon: '💨', label: 'Wind Speed', value: `${Math.round(city.wind_speed)} km/h` },
              { icon: '🌡️', label: 'Feels Like', value: `${Math.round(city.feels_like)}°C` },
              { icon: '☀️', label: 'UV Index', value: city.uv_index != null ? String(Math.round(city.uv_index)) : 'N/A' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                padding: '14px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${theme.accent}20`,
                backdropFilter: 'blur(10px)',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  {icon} {label}
                </p>
                <p style={{ color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Action button */}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate(city)}
            style={{
              width: '100%', padding: '14px', borderRadius: '16px',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)`,
              border: 'none', color: '#000', fontWeight: '900', fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            🔍 View Full Forecast for {city.name}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Temperature Legend ───────────────────────────────────────
function TempLegend() {
  const bands = [
    { label: '40°+', color: '#ef4444', desc: 'Extreme Heat' },
    { label: '35°', color: '#f97316', desc: 'Very Hot' },
    { label: '28°', color: '#fbbf24', desc: 'Warm' },
    { label: '18°', color: '#34d399', desc: 'Mild' },
    { label: '8°', color: '#60a5fa', desc: 'Cool' },
    { label: '0°', color: '#93c5fd', desc: 'Cold' },
    { label: '<0°', color: '#bfdbfe', desc: 'Freezing' },
  ];
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      {bands.map(({ label, color, desc }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stats Summary Bar ────────────────────────────────────────
function WorldStats({ cities }) {
  const hottest = cities.reduce((a, b) => (a.temperature > b.temperature ? a : b), cities[0]);
  const coldest = cities.reduce((a, b) => (a.temperature < b.temperature ? a : b), cities[0]);
  const windiest = cities.reduce((a, b) => (a.wind_speed > b.wind_speed ? a : b), cities[0]);
  const avgTemp = (cities.reduce((s, c) => s + c.temperature, 0) / cities.length).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px', marginBottom: '36px',
      }}
    >
      {[
        { icon: '🔥', label: 'Hottest City', value: hottest?.name, sub: `${Math.round(hottest?.temperature)}°C`, color: '#ef4444' },
        { icon: '🥶', label: 'Coldest City', value: coldest?.name, sub: `${Math.round(coldest?.temperature)}°C`, color: '#93c5fd' },
        { icon: '💨', label: 'Windiest City', value: windiest?.name, sub: `${Math.round(windiest?.wind_speed)} km/h`, color: '#a3e635' },
        { icon: '🌍', label: 'World Avg Temp', value: `${avgTemp}°C`, sub: `Across ${cities.length} cities`, color: '#fbbf24' },
      ].map(({ icon, label, value, sub, color }) => (
        <motion.div key={label}
          whileHover={{ scale: 1.03, y: -2 }}
          style={{
            padding: '16px 20px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{icon}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</p>
          <p style={{ color, fontWeight: '900', fontSize: '1rem' }}>{value}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{sub}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Custom Sort Dropdown ─────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'default', icon: '🔀', label: 'Default Order' },
  { value: 'temp_desc', icon: '🔥', label: 'Hottest First' },
  { value: 'temp_asc', icon: '❄️', label: 'Coldest First' },
  { value: 'wind', icon: '💨', label: 'Windiest First' },
];

function SortDropdown({ sortBy, setSortBy }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = SORT_OPTIONS.find(o => o.value === sortBy) || SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', borderRadius: '99px', cursor: 'pointer', border: 'none',
          background: open ? 'rgba(100,181,246,0.18)' : 'rgba(255,255,255,0.07)',
          border: open ? '1px solid rgba(100,181,246,0.4)' : '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          color: open ? '#64b5f6' : 'rgba(255,255,255,0.65)',
          fontSize: '0.8rem', fontWeight: '700',
          transition: 'all 0.2s',
        }}
      >
        <span>{active.icon}</span>
        <span>{active.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.6rem', opacity: 0.6, marginLeft: '2px' }}
        >▼</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
              minWidth: '180px', borderRadius: '18px', overflow: 'hidden',
              background: 'rgba(8,16,38,0.97)',
              border: '1px solid rgba(100,181,246,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
              backdropFilter: 'blur(30px)',
              padding: '6px',
            }}
          >
            {SORT_OPTIONS.map((opt, i) => {
              const isActive = sortBy === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setSortBy(opt.value); setOpen(false); }}
                  whileHover={{ background: 'rgba(100,181,246,0.1)' }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '12px', border: 'none',
                    background: isActive ? 'rgba(100,181,246,0.15)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                    borderLeft: isActive ? '2px solid #64b5f6' : '2px solid transparent',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{opt.icon}</span>
                  <span style={{
                    color: isActive ? '#64b5f6' : 'rgba(255,255,255,0.65)',
                    fontWeight: isActive ? '800' : '500',
                    fontSize: '0.82rem',
                  }}>{opt.label}</span>
                  {isActive && (
                    <span style={{ marginLeft: 'auto', color: '#64b5f6', fontSize: '0.7rem' }}>✓</span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN SKY STORIES PAGE
// ═══════════════════════════════════════════════════════════════
export default function SkyStories() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchPulse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/world/pulse`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch world pulse');
      const data = await res.json();
      setCities(data.cities || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPulse(); }, []);

  const filtered = useMemo(() => {
    let c = [...cities];
    if (filter === 'hot') c = c.filter(x => x.temperature >= 28);
    if (filter === 'cold') c = c.filter(x => x.temperature < 10);
    if (filter === 'rainy') c = c.filter(x => x.weather_code >= 50 && x.weather_code < 80);
    if (filter === 'clear') c = c.filter(x => x.weather_code <= 3);
    if (sortBy === 'temp_desc') c.sort((a, b) => b.temperature - a.temperature);
    if (sortBy === 'temp_asc') c.sort((a, b) => a.temperature - b.temperature);
    if (sortBy === 'wind') c.sort((a, b) => b.wind_speed - a.wind_speed);
    return c;
  }, [cities, filter, sortBy]);

  const handleCityNavigate = (city) => {
    navigate(`/?city=${encodeURIComponent(city.name)}&lat=${city.lat}&lng=${city.lon}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(155deg, #020818 0%, #060d20 50%, #0a1530 100%)', position: 'relative' }}>

      {/* ── Animated background orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {['#4f8ef750', '#a855f730', '#fbbf2420'].map((color, i) => (
          <motion.div key={i}
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
            style={{
              position: 'absolute',
              width: '600px', height: '600px', borderRadius: '50%',
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              left: `${20 + i * 25}%`, top: `${10 + i * 20}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', lineHeight: 1.1,
                background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.4) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-2px', marginBottom: '8px',
              }}>
                🌍 Sky Stories
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', fontWeight: '500' }}>
                Live weather from 20 cities across the globe · refreshed now
                {lastRefresh && <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: '8px' }}>
                  at {lastRefresh.toLocaleTimeString()}
                </span>}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchPulse}
              disabled={loading}
              style={{
                padding: '12px 24px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : '🔄'} Refresh
            </motion.button>
          </div>

          {/* World Stats */}
          {cities.length > 0 && <WorldStats cities={cities} />}

          {/* Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: '🌐 All' },
                { key: 'hot', label: '🔥 Hot' },
                { key: 'cold', label: '🥶 Cold' },
                { key: 'rainy', label: '🌧️ Rainy' },
                { key: 'clear', label: '☀️ Clear' },
              ].map(({ key, label }) => (
                <motion.button key={key} whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '7px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                    background: filter === key ? 'rgba(100,181,246,0.25)' : 'rgba(255,255,255,0.06)',
                    color: filter === key ? '#64b5f6' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.8rem', fontWeight: '700',
                    border: filter === key ? '1px solid rgba(100,181,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                >{label}</motion.button>
              ))}
            </div>

            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />

            <div style={{ marginLeft: 'auto' }}>
              <TempLegend />
            </div>
          </div>
        </motion.div>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#64b5f6' }}
                />
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Fetching live data from 20 cities…</p>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            textAlign: 'center', padding: '4rem',
            borderRadius: '24px', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</p>
            <p style={{ color: '#ef4444', fontWeight: '700', marginBottom: '16px' }}>{error}</p>
            <button onClick={fetchPulse} style={{
              padding: '10px 24px', borderRadius: '50px', background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', fontWeight: '700',
            }}>Try Again</button>
          </motion.div>
        )}

        {/* ── CARDS GRID ── */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.3)' }}>
                <p style={{ fontSize: '3rem' }}>🌐</p>
                <p style={{ fontWeight: '700', marginTop: '12px' }}>No cities match this filter</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'flex-start' }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((city, i) => (
                    <CityCard key={city.name} city={city} index={i} onSelect={setSelectedCity} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedCity && (
          <CityModal
            city={selectedCity}
            onClose={() => setSelectedCity(null)}
            onNavigate={(city) => { setSelectedCity(null); handleCityNavigate(city); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
