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

      <div className="settings-inner">
        {/* Profile */}
        {user && (
          <motion.div className="card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ padding:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.25rem' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'var(--r-sm)', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FiUser size={16} style={{ color:'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize:'1.1rem', fontWeight:'800', color:'var(--text-primary)' }}>Profile</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[['Name', user.name], ['Email', user.email]].map(([l,v]) => (
                <div key={l} style={{ background:'var(--accent-subtle)', padding:'12px 16px', borderRadius:'var(--r-md)', border:'1px solid var(--border-card)' }}>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.68rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'3px' }}>{l}</p>
                  <p style={{ color:'var(--text-primary)', fontWeight:'700', fontSize:'1rem' }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Saved Locations Settings component */}
        <SavedLocations />

        {/* Theme */}
        <motion.div className="card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.07 }}
          style={{ padding:'0' }}>
          <div className="settings-row">
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'var(--r-md)', background:'var(--accent-subtle)', border:'1px solid var(--border-input)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
                {darkMode ? <FiMoon size={20}/> : <FiSun size={20}/>}
              </div>
              <div>
                <p style={{ fontWeight:'800', color:'var(--text-primary)', fontSize:'1rem' }}>Appearance</p>
                <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:'2px' }}>{darkMode ? 'Dark mode' : 'Light mode'} active</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className={`toggle${darkMode?' on':''}`} />
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button onClick={logout} className="btn btn-danger btn-lg" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
          style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem' }}>
          <FiLogOut size={18}/> Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
}
