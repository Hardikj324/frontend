import { motion } from 'framer-motion';
import React from 'react';
import { getWeatherIcon } from '../../utils/weatherHelpers';
import { FiX } from 'react-icons/fi';

export default function WeatherPopup({ weather, coordinates, onClose }) {
  if (!weather || !coordinates) return null;
  const c = weather.current;

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:'1.5rem' }}>
      <motion.div initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.85, opacity:0 }}
        onClick={e=>e.stopPropagation()}
        className="card" style={{ padding:'2rem', maxWidth:'380px', width:'100%', boxShadow:'var(--shadow-lg)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
          <div>
            <p style={{ color:'var(--text-muted)', fontSize:'0.72rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'4px' }}>Selected Location</p>
            <p style={{ fontWeight:'800', color:'var(--accent)', fontSize:'1.05rem' }}>
              {coordinates.latitude.toFixed(3)}°, {coordinates.longitude.toFixed(3)}°
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'2.8rem', lineHeight:1 }}>{getWeatherIcon(c?.weather_code, c?.is_day)}</span>
            <button onClick={onClose} style={{ background:'var(--accent-subtle)', border:'none', borderRadius:'50%', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}>
              <FiX size={14} />
            </button>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'1.25rem' }}>
          <div style={{ background:'var(--accent-subtle)', borderRadius:'var(--r-md)', padding:'12px 14px' }}>
            <p style={{ color:'var(--text-muted)', fontSize:'0.68rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'3px' }}>Condition</p>
            <p style={{ color:'var(--text-primary)', fontWeight:'700' }}>{c?.condition_description}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[
              ['Temperature', `${Math.round(c?.temperature)}°C`, 'var(--orange)'],
              ['Humidity',    `${c?.humidity}%`,                 'var(--accent)'],
              ['Wind',        `${Math.round(c?.wind_speed)} km/h`, 'var(--blue)'],
              ['UV Index',    `${c?.uv_index?.toFixed(1)}`,      'var(--orange)'],
            ].map(([l,v,color]) => (
              <div key={l} style={{ background:'var(--accent-subtle)', borderRadius:'var(--r-sm)', padding:'10px 12px' }}>
                <p style={{ color:'var(--text-muted)', fontSize:'0.65rem', fontWeight:'700', textTransform:'uppercase', marginBottom:'2px' }}>{l}</p>
                <p style={{ color, fontWeight:'800', fontSize:'1.1rem' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="btn btn-ghost" style={{ width:'100%', justifyContent:'center' }}>Close</button>
      </motion.div>
    </motion.div>
  );
}
