import { motion } from 'framer-motion';
import React from 'react';
import { getWeatherIcon } from '../../utils/weatherHelpers';
import { formatTemperature } from '../../utils/formatters';
import { FiMapPin, FiWind, FiDroplet } from 'react-icons/fi';

export default function WeatherCard({ weather, location, onClick }) {
  if (!weather) return null;
  const c = weather.current;

  return (
    <motion.div whileHover={{ y:-5 }} whileTap={{ scale:0.98 }} onClick={onClick}
      className="card card-hover" style={{ padding:'1.5rem', cursor: onClick ? 'pointer' : 'default', height:'100%' }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--accent)', marginBottom:'3px' }}>
            <FiMapPin size={14} />
            <p style={{ fontWeight:'800', fontSize:'1rem' }}>{location}</p>
          </div>
          {c?.latitude && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.72rem' }}>{c.latitude?.toFixed(2)}°, {c.longitude?.toFixed(2)}°</p>
          )}
        </div>
        <span style={{ fontSize:'3rem', lineHeight:1, filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.2))' }}>
          {getWeatherIcon(c?.weather_code, c?.is_day)}
        </span>
      </div>

      <div style={{ marginBottom:'1rem' }}>
        <p style={{ fontSize:'2.6rem', fontWeight:'900', color:'var(--text-primary)', letterSpacing:'-1px' }}>
          {formatTemperature(c?.temperature)}
        </p>
        <p style={{ color:'var(--text-secondary)', fontWeight:'500', marginTop:'3px', fontSize:'0.9rem' }}>
          {c?.condition_description}
        </p>
      </div>

      <div style={{ display:'flex', gap:'8px', paddingTop:'1rem', borderTop:'1px solid var(--border-card)' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', background:'var(--accent-subtle)', padding:'8px', borderRadius:'var(--r-sm)', color:'var(--accent)' }}>
          <FiDroplet size={13} />
          <span style={{ fontSize:'0.82rem', fontWeight:'700' }}>{c?.humidity}%</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', background:'var(--accent-subtle)', padding:'8px', borderRadius:'var(--r-sm)', color:'var(--accent)' }}>
          <FiWind size={13} />
          <span style={{ fontSize:'0.82rem', fontWeight:'700' }}>{Math.round(c?.wind_speed)} km/h</span>
        </div>
      </div>
    </motion.div>
  );
}
