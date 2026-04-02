import { motion } from 'framer-motion';
import React from 'react';
import { formatDate, formatTemperature } from '../../utils/formatters';
import { getWeatherIcon } from '../../utils/weatherHelpers';

export default function DailyForecast({ daily = [] }) {
  if (!daily?.length) return null;

  return (
    <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
      style={{ padding:'1.75rem' }}>
      <p className="card-title">📅 7-Day Forecast</p>

      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
        {daily.slice(0,7).map((item, idx) => (
          <motion.div key={idx} className={`daily-row${idx===0?' today':''}`}
            initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.04 }}>
            <div>
              <p style={{ color: idx===0 ? 'var(--accent)' : 'var(--text-primary)', fontWeight: idx===0 ? '700':'500', fontSize:'0.875rem' }}>
                {idx===0 ? 'Today' : formatDate(item.date).split(',')[0]}
              </p>
              <p className="daily-condition" style={{ color:'var(--text-muted)', fontSize:'0.7rem', marginTop:'1px' }}>{item.condition_description}</p>
            </div>
            <span style={{ fontSize:'1.55rem' }}>{getWeatherIcon(item.weather_code, true)}</span>
            <span style={{ color:'var(--blue)', fontSize:'0.78rem', fontWeight:'600' }}>💧{item.precipitation_probability_max}%</span>
            <span style={{ color:'var(--orange)', fontWeight:'800', fontSize:'0.9rem' }}>{formatTemperature(item.temperature_max)}</span>
            <span style={{ color:'var(--blue)', fontWeight:'600', fontSize:'0.9rem', opacity:0.75 }}>{formatTemperature(item.temperature_min)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
