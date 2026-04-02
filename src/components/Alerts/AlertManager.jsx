import { motion } from 'framer-motion';
import React from 'react';
import AlertBuilder from './AlertBuilder';
import AlertCard from './AlertCard';
import { useAlerts } from '../../hooks/useAlerts';
import { FiBellOff } from 'react-icons/fi';

export default function AlertManager() {
  const { alerts, removeAlert, updateAlert } = useAlerts();

  const toggle = (id) => {
    const a = alerts.find(x => x.id === id);
    if (a) updateAlert(id, { isActive: !a.isActive });
  };

  return (
    <motion.div className="card" initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
      style={{ padding:'1.75rem' }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontWeight:'800', color:'var(--text-primary)', fontSize:'1.15rem', marginBottom:'4px' }}>Manage Alerts</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Get notified when specific weather conditions are met.</p>
      </div>

      <AlertBuilder />

      <div style={{ marginTop:'2rem' }}>
        <p style={{ fontWeight:'800', color:'var(--text-secondary)', fontSize:'0.875rem', paddingBottom:'12px', borderBottom:'1px solid var(--border-card)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'0.07em' }}>
          Your Alerts ({alerts.length})
        </p>

        {alerts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem 1rem', background:'var(--accent-subtle)', borderRadius:'var(--r-md)', border:'1px solid var(--border-card)' }}>
            <FiBellOff size={36} style={{ color:'var(--text-muted)', margin:'0 auto 12px' }} />
            <p style={{ color:'var(--text-primary)', fontWeight:'700', marginBottom:'6px' }}>No alerts yet</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Create your first alert above.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {alerts.map(a => <AlertCard key={a.id} alert={a} onToggle={toggle} onDelete={removeAlert} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
