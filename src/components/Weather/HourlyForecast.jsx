import { motion } from 'framer-motion';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTime } from '../../utils/formatters';
import { getWeatherIcon } from '../../utils/weatherHelpers';

const Tip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background:'var(--bg-dropdown)', border:'1px solid var(--border-input)', borderRadius:'var(--r-md)', padding:'10px 14px', boxShadow:'var(--shadow-md)' }}>
    <p style={{ color:'var(--accent)', fontWeight:'700', marginBottom:'4px' }}>{label}</p>
    <p style={{ color:'var(--text-primary)', fontWeight:'600' }}>{payload[0].value}°C</p>
  </div>
) : null;

export default function HourlyForecast({ hourly = [] }) {
  if (!hourly?.length) return null;

  const chartData = hourly.slice(0,24).map(i => ({
    time: formatTime(i.time),
    temp: Math.round(i.temperature),
  }));

  return (
    <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
      style={{ padding:'1.75rem' }}>
      <p className="card-title">⏱ Hourly · Next 24h</p>

      <div className="hourly-scroll">
        {hourly.slice(0,24).map((item, idx) => (
          <div key={idx} className={`hourly-card${idx===0?' current':''}`}>
            <p style={{ color:'var(--text-muted)', fontSize:'0.68rem', fontWeight:'700' }}>{formatTime(item.time)}</p>
            <p style={{ fontSize:'1.75rem', margin:'7px 0' }}>{getWeatherIcon(item.weather_code, item.is_day)}</p>
            <p style={{ color:'var(--accent)', fontSize:'1rem', fontWeight:'800' }}>{Math.round(item.temperature)}°</p>
            <p style={{ color:'var(--blue)', fontSize:'0.68rem', marginTop:'4px' }}>💧 {item.precipitation_probability}%</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.62rem', marginTop:'2px' }}>{Math.round(item.wind_speed)} km/h</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={175}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#64c8ff" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#64c8ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" />
          <XAxis dataKey="time" stroke="var(--border-input)" tick={{ fontSize:11, fill:'var(--text-muted)' }} />
          <YAxis stroke="var(--border-input)" tick={{ fontSize:11, fill:'var(--text-muted)' }} />
          <Tooltip content={<Tip />} />
          <Area type="monotone" dataKey="temp" stroke="#64c8ff" strokeWidth={2.5} fill="url(#tg)" dot={false} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
