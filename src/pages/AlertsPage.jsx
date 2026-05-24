import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import AlertManager from '../components/Alerts/AlertManager';
import { FiBell, FiZap, FiShield, FiAlertTriangle } from 'react-icons/fi';

const TIPS = [
  { icon: '🌡️', title: 'Temperature Alerts', desc: 'Get notified when temperatures spike or plummet beyond your comfort zone.' },
  { icon: '🌧️', title: 'Rain & Storm Warnings', desc: 'Never get caught without an umbrella — receive rainfall alerts instantly.' },
  { icon: '💨', title: 'Wind Advisories', desc: 'High-wind advisories keep you safe during outdoor activities.' },
  { icon: '🌫️', title: 'Air Quality Alerts', desc: 'Monitor PM2.5 and AQI levels to protect your health.' },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('manage');

  return (
    <div className="page-content page-enter" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Decorative BG orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -30, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)',
            top: '10%', left: '-5%',
          }}
        />
        <motion.div
          animate={{ x: [0, -15, 10, 0], y: [0, 20, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 70%)',
            top: '30%', right: '0%',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(251,146,60,0.06))',
              border: '1px solid rgba(251,146,60,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(251,146,60,0.15)',
            }}>
              <FiBell size={24} style={{ color: '#fb923c' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                Weather Alerts
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
                Personalized weather triggers — always kept in the loop
              </p>
            </div>
          </div>

          {/* Alert type quick stats */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {[
              { icon: FiZap, label: 'Smart Triggers', value: 'Real-time', color: '#fbbf24' },
              { icon: FiShield, label: 'Auto-monitoring', value: 'Background', color: '#34d399' },
              { icon: FiAlertTriangle, label: 'Push Alerts', value: 'Instant', color: '#fb923c' },
            ].map(({ icon: Icon, label, value, color }) => (
              <motion.div key={label}
                whileHover={{ scale: 1.03, y: -2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', borderRadius: '14px',
                  background: `${color}0a`, border: `1px solid ${color}20`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <p style={{ color: `rgba(255,255,255,0.35)`, fontSize: '0.62rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ color, fontWeight: '800', fontSize: '0.82rem' }}>{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
            {[
              { key: 'manage', label: '🔔 Manage Alerts' },
              { key: 'tips',   label: '💡 Alert Tips' },
            ].map(({ key, label }) => (
              <motion.button key={key}
                onClick={() => setActiveTab(key)}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 20px', borderRadius: '10px', cursor: 'pointer',
                  background: activeTab === key ? 'rgba(251,146,60,0.15)' : 'transparent',
                  color: activeTab === key ? '#fb923c' : 'rgba(255,255,255,0.45)',
                  fontWeight: '800', fontSize: '0.85rem',
                  border: activeTab === key ? '1px solid rgba(251,146,60,0.3)' : '1px solid transparent',
                  transition: 'all 0.22s',
                }}
              >{label}</motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── TABS CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'manage' ? (
            <motion.div key="manage"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            >
              <AlertManager />
            </motion.div>
          ) : (
            <motion.div key="tips"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}
            >
              {TIPS.map(({ icon, title, desc }, i) => (
                <motion.div key={title}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    padding: '24px', borderRadius: '20px',
                    background: 'rgba(251,146,60,0.04)',
                    border: '1px solid rgba(251,146,60,0.15)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <p style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</p>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.05rem', marginBottom: '8px' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>{desc}</p>
                </motion.div>
              ))}

              {/* Pro tip card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: TIPS.length * 0.08 }}
                style={{
                  padding: '24px', borderRadius: '20px', gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg, rgba(251,146,60,0.1), rgba(192,132,252,0.06))',
                  border: '1px solid rgba(251,146,60,0.2)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🚀</p>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: '900', fontSize: '1.1rem', marginBottom: '8px' }}>
                  Pro Tip: Combine Multiple Conditions
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Set compound alerts like <strong style={{ color: '#fb923c' }}>Temperature &gt; 35°C AND UV &gt; 8</strong> to get pinpoint notifications for extreme heat days.
                  Stack rain forecasts with wind speed alerts to prepare for storm conditions.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
