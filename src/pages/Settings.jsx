import { motion } from 'framer-motion';
import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiSettings, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import SavedLocations from '../components/Search/SavedLocations';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuthStore();

  return (
    <motion.div className="page-content page-enter" initial={{ opacity:0 }} animate={{ opacity:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'2rem' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'var(--r-md)', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border-input)' }}>
          <FiSettings size={20} style={{ color:'var(--accent)' }} />
        </div>
        <h1 style={{ fontSize:'2rem', fontWeight:'900', color:'var(--text-primary)' }}>Settings</h1>
      </div>

      <div className="settings-inner" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Profile */}
        {user && (
          <motion.div className="card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ padding:'1.75rem', marginBottom: '1.5rem', background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'1.5rem' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', border: '1px solid var(--accent)' }}>
                <FiUser size={24} style={{ color:'var(--accent)' }} />
              </div>
              <div>
                <h2 style={{ fontSize:'1.2rem', fontWeight:'900', color:'var(--text-primary)' }}>My Profile</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your account details</p>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[['Name', user.name], ['Email', user.email]].map(([l,v]) => (
                <div key={l} style={{ background:'var(--bg-input)', padding:'14px 18px', borderRadius:'var(--r-md)', border:'1px solid var(--border-input)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em' }}>{l}</p>
                  <p style={{ color:'var(--text-primary)', fontWeight:'800', fontSize:'1.05rem' }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Saved Locations Settings component */}
        <SavedLocations />

        {/* Theme */}
        <motion.div className="card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, type: 'spring' }}
          style={{ padding:'0', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div className="settings-row" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'var(--accent-subtle)', border:'1px solid var(--border-input)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
                {darkMode ? <FiMoon size={22}/> : <FiSun size={22}/>}
              </div>
              <div>
                <p style={{ fontWeight:'900', color:'var(--text-primary)', fontSize:'1.1rem' }}>Appearance</p>
                <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'2px' }}>{darkMode ? 'Dark mode' : 'Light mode'} is currently active</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className={`toggle${darkMode?' on':''}`} />
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button onClick={logout} className="btn btn-danger btn-lg" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          style={{ width:'100%', justifyContent:'center', padding: '16px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '0.02em', border: '1.5px solid rgba(239,68,68,0.3)' }}>
          <FiLogOut size={20}/> Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
}
