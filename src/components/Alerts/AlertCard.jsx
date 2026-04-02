import { motion } from 'framer-motion';
import React from 'react';
import { FiTrash2, FiPower } from 'react-icons/fi';

const icons = {
  temperature_high: '🔥', temperature_low: '❄️',
  rain: '🌧️', high_wind: '💨', aqi_high: '😷',
};

export default function AlertCard({ alert, onToggle, onDelete }) {
  const icon = icons[alert.type] || '🔔';
  return (
    <motion.div
      initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, scale:0.95 }}
      style={{
        position:'relative', overflow:'hidden',
        background:'var(--bg-card)', borderRadius:'var(--r-md)',
        border:`1px solid ${alert.isActive ? 'var(--border-input)' : 'var(--border-card)'}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'1rem 1.1rem', opacity: alert.isActive ? 1 : 0.65,
        transition:'border-color 0.2s, opacity 0.2s',
      }}>
      {/* Active accent bar */}
      {alert.isActive && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'var(--accent)', borderRadius:'2px 0 0 2px' }} />}

      <div style={{ display:'flex', alignItems:'center', gap:'14px', flex:1, paddingLeft:'6px' }}>
        <div style={{ width:'42px', height:'42px', borderRadius:'50%', background: alert.isActive ? 'var(--accent-subtle)' : 'var(--bg-input)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontWeight:'700', color:'var(--text-primary)', fontSize:'0.95rem', marginBottom:'4px' }}>{alert.name}</p>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ padding:'2px 9px', borderRadius:'var(--r-sm)', background:'var(--accent-subtle)', color:'var(--text-secondary)', fontSize:'0.72rem', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Threshold: {alert.threshold}
            </span>
            {!alert.isActive && <span style={{ color:'var(--red)', fontSize:'0.72rem', fontWeight:'700' }}>Disabled</span>}
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'6px' }}>
        <button onClick={() => onToggle(alert.id)} title={alert.isActive ? 'Disable' : 'Enable'}
          style={{ padding:'8px', borderRadius:'var(--r-sm)', border:'none', cursor:'pointer', transition:'all 0.2s',
            background: alert.isActive ? 'var(--accent-subtle)' : 'var(--bg-input)',
            color: alert.isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
          <FiPower size={16} />
        </button>
        <button onClick={() => onDelete(alert.id)} title="Delete"
          style={{ padding:'8px', borderRadius:'var(--r-sm)', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer', background:'rgba(239,68,68,0.08)', color:'var(--red)', transition:'all 0.2s' }}>
          <FiTrash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
