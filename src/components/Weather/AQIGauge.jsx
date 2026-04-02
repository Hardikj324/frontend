import { motion } from 'framer-motion';
import React from 'react';
import { getAQILevel, getHealthRecommendation } from '../../utils/weatherHelpers';

export default function AQIGauge({ airQuality }) {
  if (!airQuality) return null;
  const aqi = airQuality.aqi_pm25;
  if (aqi === null || aqi === undefined) return null;

  const level   = getAQILevel(aqi);
  const rec     = getHealthRecommendation(aqi);
  const pct     = Math.min((aqi/300)*100, 100);
  const circ    = 2*Math.PI*38;
  const dash    = circ - (pct/100)*circ;

  const pollutants = [
    { l:'PM2.5', v:airQuality.pm25,             u:'µg/m³' },
    { l:'PM10',  v:airQuality.pm10,              u:'µg/m³' },
    { l:'NO₂',   v:airQuality.nitrogen_dioxide,  u:'ppb'   },
    { l:'O₃',    v:airQuality.ozone,             u:'ppb'   },
  ].filter(p => p.v != null);

  return (
    <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
      style={{ padding:'1.75rem' }}>
      <p className="card-title">💨 Air Quality Index</p>

      <div className="aqi-grid">
        {/* Gauge */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
          <svg width="110" height="110" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent-subtle)" strokeWidth="8" />
            <motion.circle cx="50" cy="50" r="38" fill="none" stroke={level.color} strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset:circ }} animate={{ strokeDashoffset:dash }}
              transition={{ duration:1.5, ease:'easeOut' }}
              style={{ filter:`drop-shadow(0 0 8px ${level.color}55)` }} />
            <text x="50" y="46" textAnchor="middle" style={{ fill:level.color, fontSize:'16px', fontWeight:'900' }}>{Math.round(aqi)}</text>
            <text x="50" y="60" textAnchor="middle" style={{ fill:'var(--text-muted)', fontSize:'8px', fontWeight:'700' }}>AQI</text>
          </svg>
          <p style={{ color:level.color, fontWeight:'800', fontSize:'0.85rem' }}>{level.label}</p>
        </div>

        {/* Right */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <div style={{ background:level.color+'14', border:`1px solid ${level.color}28`, borderRadius:'var(--r-md)', padding:'12px 14px' }}>
            <p style={{ color:level.color, fontWeight:'800', fontSize:'0.85rem', marginBottom:'4px' }}>{rec.icon} {rec.title}</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', lineHeight:'1.55' }}>{rec.advice}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {pollutants.map(({ l, v, u }) => (
              <div key={l} className="stat-card">
                <p className="stat-label">{l}</p>
                <p className="stat-value">{v?.toFixed(1)} <span style={{ fontSize:'0.62rem', color:'var(--text-muted)', fontWeight:'500' }}>{u}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
