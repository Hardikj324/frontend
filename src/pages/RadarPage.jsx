import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '../store/weatherStore';
import { useAuthStore } from '../store/authStore';
import LocationAutocomplete from '../components/Search/LocationAutocomplete';
import { API_BASE_URL } from '../utils/constants';

const API_BASE = API_BASE_URL;

// ─── Wind Particle Radar Canvas ───────────────────────────────
function WindRadar({ windSpeed, windDirection, weatherCode, temperature }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  const theme = useMemo(() => {
    if (weatherCode >= 95) return { color: '#c084fc', bg: '#1a0533' };
    if (weatherCode >= 71) return { color: '#bfdbfe', bg: '#0e1929' };
    if (weatherCode >= 50) return { color: '#60a5fa', bg: '#061225' };
    if (temperature > 30) return { color: '#fbbf24', bg: '#1a0a00' };
    return { color: '#34d399', bg: '#001a0f' };
  }, [weatherCode, temperature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const CX = W / 2;
    const CY = H / 2;
    const MAX_R = Math.min(W, H) * 0.42;

    // Wind direction in radians (meteorological: 0=from N, 90=from E, etc.)
    const windRad = ((windDirection || 0) - 90) * (Math.PI / 180);
    const speed = windSpeed || 10;

    // Initialize particles in a field
    const COUNT = Math.min(200, 80 + speed * 2);
    particlesRef.current = Array.from({ length: COUNT }, () => {
      const r = Math.random() * MAX_R;
      const theta = Math.random() * Math.PI * 2;
      return {
        x: CX + r * Math.cos(theta),
        y: CY + r * Math.sin(theta),
        vx: Math.cos(windRad) * speed * 0.15 * (0.6 + Math.random() * 0.8),
        vy: Math.sin(windRad) * speed * 0.15 * (0.6 + Math.random() * 0.8),
        life: Math.random(),
        maxLife: 0.6 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 1.8,
        trail: [],
      };
    });

    let frame = 0;
    const draw = () => {
      frame++;
      // Fade trail
      ctx.fillStyle = `rgba(0,0,0,0.12)`;
      ctx.fillRect(0, 0, W, H);

      // Radar rings — all labels on the same NE diagonal (-45°), naturally spaced by ring radius
      const labelAngle = -Math.PI / 4; // exactly between N and E
      [0.25, 0.5, 0.75, 1].forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(CX, CY, MAX_R * r, 0, Math.PI * 2);
        ctx.strokeStyle = `${theme.color}18`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label sits exactly on the ring at the fixed angle
        const lx = CX + Math.cos(labelAngle) * MAX_R * r;
        const ly = CY + Math.sin(labelAngle) * MAX_R * r;
        const kmLabel = `${Math.round(r * 100)}km`;

        ctx.font = 'bold 9px monospace';
        const tw = ctx.measureText(kmLabel).width;
        const ph = 11, pw = tw + 8;

        // Dark pill background for legibility
        ctx.fillStyle = 'rgba(2,10,20,0.75)';
        ctx.beginPath();
        ctx.roundRect(lx - pw / 2, ly - ph / 2, pw, ph, 3);
        ctx.fill();

        // Label text
        ctx.fillStyle = `${theme.color}99`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(kmLabel, lx, ly);
      });

      // Cardinal direction lines
      ['N', 'E', 'S', 'W'].forEach((dir, i) => {
        const angle = (i * Math.PI / 2) - Math.PI / 2;
        const ex = CX + Math.cos(angle) * MAX_R;
        const ey = CY + Math.sin(angle) * MAX_R;
        ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(ex, ey);
        ctx.strokeStyle = `${theme.color}0a`; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = `${theme.color}60`;
        ctx.font = 'bold 11px DM Sans, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const labelDist = MAX_R + 18;
        ctx.fillText(dir, CX + Math.cos(angle) * labelDist, CY + Math.sin(angle) * labelDist);
      });

      // Radar sweep line
      const sweepAngle = (frame * 0.018) % (Math.PI * 2);
      const sweepGrad = ctx.createConicalGradient ? null : null;
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(sweepAngle);
      const sweepLine = ctx.createLinearGradient(0, 0, MAX_R, 0);
      sweepLine.addColorStop(0, `${theme.color}00`);
      sweepLine.addColorStop(0.6, `${theme.color}30`);
      sweepLine.addColorStop(1, `${theme.color}60`);
      // Fill sweep wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, MAX_R, -0.6, 0);
      ctx.lineTo(0, 0);
      ctx.fillStyle = `${theme.color}08`;
      ctx.fill();
      // Bright leading edge
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(MAX_R, 0);
      ctx.strokeStyle = sweepLine; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();

      // Clip to radar circle
      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, MAX_R, 0, Math.PI * 2); ctx.clip();

      // Update & draw particles
      particlesRef.current.forEach(p => {
        p.life += 0.008;
        if (p.life >= p.maxLife) {
          // Respawn at a random edge or random position
          const r = MAX_R * (0.1 + Math.random() * 0.9);
          const theta = Math.random() * Math.PI * 2;
          p.x = CX + r * Math.cos(theta);
          p.y = CY + r * Math.sin(theta);
          p.life = 0;
          p.trail = [];
        }

        const turbX = (Math.random() - 0.5) * 0.3;
        const turbY = (Math.random() - 0.5) * 0.3;
        p.x += p.vx + turbX;
        p.y += p.vy + turbY;

        // Keep trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 12) p.trail.shift();

        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.7;

        // Draw trail
        if (p.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = `${theme.color}${Math.round(alpha * 60).toString(16).padStart(2,'0')}`;
          ctx.lineWidth = p.size * 0.6;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Dot at head
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `${theme.color}${Math.round(alpha * 200).toString(16).padStart(2,'0')}`;
        ctx.fill();
      });
      ctx.restore();

      // Center dot glow
      const centerGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, 20);
      centerGrad.addColorStop(0, `${theme.color}cc`);
      centerGrad.addColorStop(1, `${theme.color}00`);
      ctx.beginPath(); ctx.arc(CX, CY, 20, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad; ctx.fill();

      // Wind direction arrow from center
      const arrowLen = MAX_R * 0.3;
      const ax = CX + Math.cos(windRad) * arrowLen;
      const ay = CY + Math.sin(windRad) * arrowLen;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(ax, ay);
      ctx.strokeStyle = `${theme.color}cc`;
      ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();

      // Arrowhead
      const headLen = 12;
      const headAngle = Math.PI / 7;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - headLen * Math.cos(windRad - headAngle), ay - headLen * Math.sin(windRad - headAngle));
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - headLen * Math.cos(windRad + headAngle), ay - headLen * Math.sin(windRad + headAngle));
      ctx.strokeStyle = `${theme.color}cc`; ctx.lineWidth = 2; ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [windSpeed, windDirection, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', background: theme.bg + '80', borderRadius: '50%' }}
    />
  );
}

// ─── Compass Rose ─────────────────────────────────────────────
function CompassRose({ direction }) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(((direction || 0) % 360) / 45) % 8;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <motion.div
          animate={{ rotate: direction || 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
          }}
        >
          🧭
        </motion.div>
      </div>
      <span style={{ color: '#64b5f6', fontWeight: '900', fontSize: '1rem' }}>{dirs[idx]}</span>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{direction || 0}°</span>
    </div>
  );
}

// ─── Beaufort Scale ───────────────────────────────────────────
function BeaufortScale({ windSpeed }) {
  const scales = [
    { max: 1, label: 'Calm', desc: 'Smoke rises vertically' },
    { max: 5, label: 'Light Air', desc: 'Smoke drifts' },
    { max: 11, label: 'Light Breeze', desc: 'Feel on face' },
    { max: 19, label: 'Gentle Breeze', desc: 'Leaves rustle' },
    { max: 28, label: 'Moderate', desc: 'Small branches move' },
    { max: 38, label: 'Fresh Breeze', desc: 'Small trees sway' },
    { max: 49, label: 'Strong Breeze', desc: 'Large branches move' },
    { max: 61, label: 'Near Gale', desc: 'Whole trees move' },
    { max: 74, label: 'Gale', desc: 'Twigs break' },
    { max: 88, label: 'Strong Gale', desc: 'Structural damage' },
    { max: 102, label: 'Storm', desc: 'Trees uprooted' },
    { max: 117, label: 'Violent Storm', desc: 'Widespread damage' },
    { max: Infinity, label: 'Hurricane', desc: 'Devastating damage' },
  ];
  const bft = scales.findIndex(s => windSpeed < s.max);
  const scale = scales[Math.max(0, bft)];
  const pct = Math.min((windSpeed / 120) * 100, 100);
  const colors = ['#34d399', '#a3e635', '#fbbf24', '#fb923c', '#ef4444', '#c084fc'];
  const color = colors[Math.min(Math.floor(bft / 2), colors.length - 1)];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Beaufort Scale
        </span>
        <span style={{ color, fontWeight: '900', fontSize: '0.85rem' }}>
          Force {Math.max(0, bft)} — {scale.label}
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '6px' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, #34d399, ${color})` }}
        />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>{scale.desc}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN RADAR PAGE
// ═══════════════════════════════════════════════════════════════
export default function RadarPage() {
  const { token } = useAuthStore();
  const storeWeather = useWeatherStore(s => s.weather);
  const storeLocation = useWeatherStore(s => s.selectedLocation);

  const [location, setLocation] = useState(storeLocation || null);
  const [weather, setWeather] = useState(storeWeather || null);
  const [loading, setLoading] = useState(!storeWeather);

  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/weather/current-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_latitude: lat, current_longitude: lon }),
      });
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (storeWeather) { setWeather(storeWeather); setLoading(false); return; }
    navigator.geolocation?.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => setLoading(false)
    );
  }, []);

  const cur = weather?.current;
  const windSpeed = cur?.wind_speed ?? 0;
  const windDir = cur?.wind_direction ?? 0;
  const code = cur?.weather_code ?? 0;
  const temp = cur?.temperature ?? 20;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', letterSpacing: '-2px',
            background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>
            🌀 Wind Radar
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time wind flow visualization · animated particle field
          </p>
        </motion.div>

        {/* ── Location selector ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ maxWidth: '500px', marginBottom: '40px',
            borderRadius: '18px', position: 'relative', zIndex: 50,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)', backdropFilter: 'blur(20px)' }}
        >
          <LocationAutocomplete
            placeholder="Search a city to view wind radar..."
            onSelect={loc => {
              setLocation(loc);
              fetchWeather(loc.latitude, loc.longitude);
            }}
          />
        </motion.div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid rgba(52,211,153,0.15)', borderTopColor: '#34d399' }}
            />
          </div>
        )}

        {!loading && weather && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>

            {/* LEFT: Radar canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              style={{
                borderRadius: '28px', overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                backdropFilter: 'blur(20px)', padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Wind Flow — {location?.name || 'Current Location'}
                  </p>
                  <p style={{ color: '#34d399', fontWeight: '900', fontSize: '1.5rem' }}>
                    {Math.round(windSpeed)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>km/h</span>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite' }} />
                  <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '700' }}>LIVE</span>
                </div>
              </div>

              <div style={{ aspectRatio: '1', position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                <WindRadar windSpeed={windSpeed} windDirection={windDir} weatherCode={code} temperature={temp} />
              </div>
            </motion.div>

            {/* RIGHT: Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Compass + Wind info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                style={{
                  borderRadius: '24px', padding: '24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
                  🧭 Wind Direction
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <CompassRose direction={windDir} />
                  <div style={{ flex: 1 }}>
                    <BeaufortScale windSpeed={windSpeed} />
                  </div>
                </div>
              </motion.div>

              {/* Atmospheric conditions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                style={{
                  borderRadius: '24px', padding: '24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                  🌡️ Atmospheric Conditions
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {[
                    { icon: '🌡️', label: 'Temperature', value: `${Math.round(cur.temperature)}°C` },
                    { icon: '🤔', label: 'Feels Like', value: `${Math.round(cur.feels_like)}°C` },
                    { icon: '💧', label: 'Humidity', value: `${Math.round(cur.humidity)}%` },
                    { icon: '🔭', label: 'Pressure', value: `${Math.round(cur.pressure)} hPa` },
                    { icon: '👁️', label: 'Visibility', value: `${(cur.visibility / 1000).toFixed(1)} km` },
                    { icon: '☀️', label: 'UV Index', value: `${cur.uv_index ?? 'N/A'}` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{
                      padding: '12px', borderRadius: '14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                    }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                        {icon} {label}
                      </p>
                      <p style={{ color: 'var(--text-primary)', fontWeight: '900', fontSize: '1rem' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Condition card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                style={{
                  borderRadius: '24px', padding: '24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  🌤️ Current Condition
                </p>
                <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem', lineHeight: 1.5 }}>
                  {cur.condition_description}
                </p>
                {windSpeed > 40 && (
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      marginTop: '12px', padding: '10px 14px', borderRadius: '12px',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#ef4444', fontSize: '0.82rem', fontWeight: '700',
                    }}
                  >
                    ⚠️ High wind warning — {Math.round(windSpeed)} km/h
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {!loading && !weather && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '8rem 2rem' }}
          >
            <p style={{ fontSize: '4rem', marginBottom: '16px' }}>🌀</p>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '8px' }}>
              Search a city above
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Or enable location access to see your local wind radar.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
