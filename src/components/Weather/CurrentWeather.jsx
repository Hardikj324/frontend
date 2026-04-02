import { motion } from 'framer-motion';
import React from 'react';
import { useWeatherStore } from '../../store/weatherStore';
import { formatTemperature, formatHumidity, formatWindSpeed, formatPressure, formatUVIndex } from '../../utils/formatters';
import { getWeatherIcon, getTemperatureWarning } from '../../utils/weatherHelpers';

const stats = (c) => [
  { label:'Humidity',   value:formatHumidity(c.humidity),                color:'var(--accent)'  },
  { label:'Wind',       value:formatWindSpeed(c.wind_speed),             color:'var(--blue)'    },
  { label:'Wind Dir',   value:`${Math.round(c.wind_direction)}°`,        color:'var(--blue)'    },
  { label:'Pressure',   value:formatPressure(c.pressure),                color:'var(--accent)'  },
  { label:'UV Index',   value:String(formatUVIndex(c.uv_index)),         color:'var(--orange)'  },
  { label:'Visibility', value:`${(c.visibility/1000).toFixed(1)} km`,    color:'var(--accent)'  },
  { label:'Time of Day',value:c.is_day ? '☀️ Day' : '🌙 Night',         color:'var(--purple)'  },
];

export default function CurrentWeather() {
  const weather        = useWeatherStore(s => s.weather);
  const loading        = useWeatherStore(s => s.loading);
  const formattedUpdate= useWeatherStore(s => s.getFormattedLastUpdated());

  if (loading) return (
    <div className="card" style={{ padding:'2rem', display:'grid', gap:'1rem' }}>
      {[80,60,40].map(h => <div key={h} className="skeleton" style={{ height:`${h}px` }} />)}
    </div>
  );

  if (!weather) return (
    <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
      <p style={{ color:'var(--text-muted)' }}>No weather data available</p>
    </div>
  );

  const { current } = weather;
  const warn = getTemperatureWarning(current.temperature);

  return (
    <motion.div className="card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      style={{ padding:'2rem', position:'relative', overflow:'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', background:'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)', pointerEvents:'none' }} />

      {warn.level !== 'normal' && (
        <div style={{ marginBottom:'1.2rem', padding:'10px 16px', borderRadius:'var(--r-sm)', background:warn.color+'18', borderLeft:`3px solid ${warn.color}` }}>
          <p style={{ color:warn.color, fontWeight:'700', fontSize:'0.875rem' }}>{warn.message}</p>
        </div>
      )}

      {/* Hero row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.72rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'8px' }}>
            Current · Updated {formattedUpdate}
          </p>
          <p className="temp-hero" style={{ fontSize:'4.8rem', fontWeight:'900', lineHeight:1, background:'linear-gradient(135deg,var(--accent),#a8dcff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            {formatTemperature(current.temperature)}
          </p>
          <p style={{ color:'var(--text-secondary)', marginTop:'6px', fontSize:'1rem', fontWeight:'600' }}>{current.condition_description}</p>
          <p style={{ color:'var(--text-muted)', marginTop:'3px', fontSize:'0.82rem' }}>Feels like {formatTemperature(current.feels_like)}</p>
        </div>
        <div className="weather-emoji" style={{ fontSize:'5.5rem', lineHeight:1, filter:'drop-shadow(0 0 18px rgba(100,200,255,0.28))' }}>
          {getWeatherIcon(current.weather_code, current.is_day)}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'0.7rem' }}>
        {stats(current).map(({ label, value, color }, i) => (
          <motion.div key={label} className="stat-card" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
            <p className="stat-label">{label}</p>
            <p className="stat-value" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
