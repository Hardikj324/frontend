import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMapPin, FiHome, FiCalendar, FiBookmark, FiBell, FiSettings, FiLogOut, FiSun, FiMoon, FiUser, FiGlobe, FiMessageCircle } from 'react-icons/fi';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/forecast', icon: FiCalendar, label: 'Forecast' },
  { path: '/locations', icon: FiBookmark, label: 'Saved' },
  { path: '/alerts', icon: FiBell, label: 'Alerts' },
  { path: '/news', icon: FiGlobe, label: 'News' },
  { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function Header() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ── Desktop / tablet header ── */}
      <header style={{ background: 'var(--bg-header)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-primary)', position: 'sticky', top: 0, zIndex: 100, transition: 'background 0.3s' }}>
        <div className="header-inner" style={{ maxWidth: '1340px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#64c8ff,#0066cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiMapPin size={16} color="white" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: '900', background: 'linear-gradient(90deg,var(--accent),#a8dcff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.4px' }}>
              Sky Sight
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ alignItems: 'center', gap: '2px' }}>
            {navItems.map(({ path, icon: Icon, label }) => (
              <button key={path} onClick={() => navigate(path)}
                className={`nav-btn${loc.pathname === path ? ' active' : ''}`}>
                <Icon size={15} /><span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-icon" onClick={toggleDarkMode} title="Toggle theme">
              {darkMode ? <FiSun size={16} style={{ color: '#fbbf24', marginRight: '10px', marginLeft: '10px' }} /> : <FiMoon size={16} style={{ marginRight: '10px', marginLeft: '10px' }} />}
            </button>

            {user && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 11px 5px 5px', borderRadius: '99px', border: '1px solid var(--border-primary)', background: 'var(--accent-subtle)', cursor: 'pointer' }}>
                  <div style={{ width: '27px', height: '27px', borderRadius: '50%', background: 'linear-gradient(135deg,#64c8ff,#0066cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: '800', color: '#fff', marginRight: '7px', marginLeft: '7px' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hide-mobile" style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: '600' }}>{user.name}</span>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--bg-dropdown)', border: '1px solid var(--border-primary)', borderRadius: 'var(--r-md)', padding: '6px', minWidth: '150px', boxShadow: 'var(--shadow-lg)', zIndex: 200 }}>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--r-sm)', border: 'none', background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`mobile-nav-btn${loc.pathname === path ? ' active' : ''}`}>
              <Icon size={22} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
