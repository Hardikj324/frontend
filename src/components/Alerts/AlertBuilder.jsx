import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX } from 'react-icons/fi';
import { ALERT_THRESHOLDS } from '../../utils/constants';
import { useAlerts } from '../../hooks/useAlerts';
import { validateAlertThreshold } from '../../utils/validators';

const alertTypes = [
  { value:'temperature_high', label:'🔥 High Temperature', key:'TEMP_HIGH' },
  { value:'temperature_low',  label:'❄️ Low Temperature',  key:'TEMP_LOW'  },
  { value:'rain',             label:'🌧️ Rain Expected',    key:'RAIN'      },
  { value:'high_wind',        label:'💨 High Wind',        key:'WIND'      },
  { value:'aqi_high',         label:'😷 High AQI',         key:'AQI_HIGH'  },
];

const unitOf = (type) => {
  if (type.includes('temperature')) return '°C';
  if (type.includes('rain'))        return '%';
  if (type.includes('wind'))        return 'km/h';
  if (type.includes('aqi'))         return 'AQI';
  return '';
};

const fieldStyle = {
  width:'100%', background:'var(--bg-card)', border:'1px solid var(--border-card)',
  borderRadius:'var(--r-md)', padding:'11px 14px', color:'var(--text-primary)',
  fontSize:'0.9rem', outline:'none', fontFamily:'inherit', transition:'border-color 0.2s',
};

export default function AlertBuilder() {
  const { addAlert } = useAlerts();
  const [open, setOpen]         = useState(false);
  const [type, setType]         = useState('temperature_high');
  const [threshold, setThresh]  = useState(ALERT_THRESHOLDS.TEMP_HIGH);
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');

  const handleAdd = async () => {
    if (!validateAlertThreshold(type, threshold)) { setMsg('❌ Invalid threshold value'); return; }
    setLoading(true);
    try {
      addAlert({ type, threshold, name: name || alertTypes.find(a=>a.value===type).label, isActive:true });
      setMsg('✅ Alert created!');
      setTimeout(() => { setType('temperature_high'); setThresh(ALERT_THRESHOLDS.TEMP_HIGH); setName(''); setOpen(false); setMsg(''); }, 1400);
    } catch { setMsg('❌ Failed to create alert'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} className={`btn btn-lg${open ? ' btn-ghost' : ' btn-primary'}`} style={{ width:'100%', justifyContent:'center' }}>
        {open ? <><FiX size={18}/> Cancel</> : <><FiPlus size={18}/> Create New Alert</>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            style={{ overflow:'hidden', marginTop:'1rem' }}>
            <div style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)', borderRadius:'var(--r-lg)', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

              {/* Name */}
              <div>
                <label style={{ color:'var(--text-label)', fontSize:'0.68rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'6px' }}>Alert Name (Optional)</label>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="My custom alert name"
                  style={fieldStyle} onFocus={e=>e.target.style.borderColor='var(--border-input-focus)'} onBlur={e=>e.target.style.borderColor='var(--border-card)'} />
              </div>

              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <label style={{ color:'var(--text-label)', fontSize:'0.68rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'6px' }}>Alert Type</label>
                  <select value={type} onChange={e=>setType(e.target.value)} style={fieldStyle}
                    onFocus={e=>e.target.style.borderColor='var(--border-input-focus)'} onBlur={e=>e.target.style.borderColor='var(--border-card)'}>
                    {alertTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color:'var(--text-label)', fontSize:'0.68rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'6px' }}>Threshold ({unitOf(type)})</label>
                  <input type="number" value={threshold} onChange={e=>setThresh(parseFloat(e.target.value))} style={fieldStyle}
                    onFocus={e=>e.target.style.borderColor='var(--border-input-focus)'} onBlur={e=>e.target.style.borderColor='var(--border-card)'} />
                </div>
              </div>

              {msg && (
                <div style={{ padding:'10px 14px', borderRadius:'var(--r-sm)', textAlign:'center', fontWeight:'700', fontSize:'0.875rem',
                  background: msg.includes('✅') ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${msg.includes('✅') ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.25)'}`,
                  color: msg.includes('✅') ? 'var(--green)' : 'var(--red)' }}>
                  {msg}
                </div>
              )}

              <button onClick={handleAdd} disabled={loading} className="btn btn-ghost" style={{ justifyContent:'center' }}>
                {loading ? 'Creating…' : <><FiPlus size={16}/> Save Alert</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
