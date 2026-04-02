import { motion } from 'framer-motion';
import React from 'react';

export default function WeatherStory({ weather }) {
  const story = React.useMemo(() => {
    if (!weather) return '';
    const { current, air_quality } = weather;
    const { temperature: temp, condition_description: cond, wind_speed: ws } = current;
    const aqi = air_quality?.aqi_pm25;
    let n = '';
    if (temp>=35) n='🔥 Scorching hot! '; else if (temp>=25) n='☀️ Warm & pleasant. ';
    else if (temp>=15) n='🌤️ Mild & comfortable. '; else if (temp>=5) n='🧊 Cool & crisp. '; else n='🥶 Freezing cold! ';
    const cl = cond.toLowerCase();
    if (cl.includes('clear')||cl.includes('sunny')) n+='Perfect for outdoors. ';
    else if (cl.includes('cloudy')) n+='Cloudy skies today. ';
    else if (cl.includes('rain')) n+='Rainy — grab an umbrella! ';
    else if (cl.includes('snow')) n+='Snowy — bundle up! ';
    else if (cl.includes('storm')||cl.includes('thunder')) n+='Storm incoming — stay safe! ';
    else if (cl.includes('fog')) n+='Foggy — drive carefully! ';
    if (ws>40) n+='Strong winds blowing. '; else if (ws>20) n+='Moderate breeze. '; else if (ws<5) n+='Still and calm air. ';
    if (aqi!=null) {
      if (aqi<=50) n+='✅ Air quality is excellent!';
      else if (aqi<=100) n+='⚠️ Air quality acceptable.';
      else if (aqi<=150) n+='⚠️ Sensitive groups take care.';
      else n+='❌ Poor air — limit outdoors.';
    }
    return n;
  }, [weather]);

  if (!story) return null;

  return (
    <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
      style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', borderRadius:'var(--r-lg)', padding:'1.25rem 1.5rem', display:'flex', gap:'14px', backdropFilter:'blur(20px)', boxShadow:'var(--shadow-sm)' }}
      className="card-hover">
      <span style={{ fontSize:'1.4rem', flexShrink:0, marginTop:'1px' }}>📖</span>
      <div>
        <p style={{ color:'var(--text-label)', fontSize:'0.68rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'5px' }}>Weather Insight</p>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.95rem', lineHeight:'1.65' }}>{story}</p>
      </div>
    </motion.div>
  );
}
