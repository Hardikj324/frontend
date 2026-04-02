import { motion } from 'framer-motion';
import React from 'react';
import AlertManager from '../components/Alerts/AlertManager';
import { FiBell } from 'react-icons/fi';

export default function AlertsPage() {
  return (
    <motion.div className="page-content page-enter" initial={{ opacity:0 }} animate={{ opacity:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'2rem' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'var(--r-md)', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border-input)' }}>
          <FiBell size={20} style={{ color:'var(--accent)' }} />
        </div>
        <h1 style={{ fontSize:'2rem', fontWeight:'900', color:'var(--text-primary)' }}>Weather Alerts</h1>
      </div>
      <AlertManager />
    </motion.div>
  );
}
