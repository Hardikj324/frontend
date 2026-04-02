import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBell } from 'react-icons/fi';

export default function AlertNotification({ notifications = [], onClose }) {
  return (
    <div style={{ position:'fixed', top:'76px', right:'1.5rem', zIndex:500, display:'flex', flexDirection:'column', gap:'10px', maxWidth:'340px', width:'100%' }}>
      <AnimatePresence mode="popLayout">
        {notifications.map(n => (
          <motion.div key={n.id}
            initial={{ opacity:0, x:60, scale:0.92 }} animate={{ opacity:1, x:0, scale:1 }} exit={{ opacity:0, x:60, scale:0.92 }}
            style={{ background:'var(--bg-dropdown)', border:'2px solid var(--orange)', borderRadius:'var(--r-md)', padding:'14px 16px', boxShadow:'var(--shadow-lg)', backdropFilter:'blur(16px)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
              <FiBell size={18} style={{ color:'var(--orange)', marginTop:'2px', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:'700', color:'var(--text-primary)', marginBottom:'3px', fontSize:'0.9rem' }}>{n.title}</p>
                <p style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{n.message}</p>
              </div>
              <button onClick={() => onClose(n.id)}
                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'2px', flexShrink:0 }}>
                <FiX size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
