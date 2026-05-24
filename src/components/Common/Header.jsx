import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiHome, FiCalendar, FiBookmark, FiBell,
  FiSettings, FiLogOut, FiSun, FiMoon, FiGlobe,
  FiMessageCircle, FiRadio, FiWind,
} from 'react-icons/fi';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/',           icon: FiHome,          label: 'Home',      color: '#64b5f6' },
  { path: '/forecast',   icon: FiCalendar,       label: 'Forecast',  color: '#a3e635' },
  { path: '/radar',      icon: FiWind,           label: 'Radar',     color: '#34d399' },
  { path: '/skystories', icon: FiGlobe,          label: 'Stories',   color: '#f472b6', badge: 'NEW' },
  { path: '/locations',  icon: FiBookmark,       label: 'Saved',     color: '#fbbf24' },
  { path: '/alerts',     icon: FiBell,           label: 'Alerts',    color: '#fb923c' },
  { path: '/news',       icon: FiRadio,          label: 'News',      color: '#c084fc' },
  { path: '/chat',       icon: FiMessageCircle,  label: 'Chat',      color: '#60a5fa' },
  { path: '/settings',   icon: FiSettings,       label: 'Settings',  color: '#94a3b8' },
];

export default function Header() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    setTimeout(() => window.addEventListener('click', handler), 100);
    return () => window.removeEventListener('click', handler);
  }, [menuOpen]);

  const activeItem = navItems.find(n => n.path === loc.pathname);

  return (
    <>
      {/* ── Desktop header ── */}
      <header style={{
        background: scrolled ? 'rgba(6,15,34,0.96)' : 'rgba(6,15,34,0.88)',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(100,200,255,0.18)' : 'rgba(100,200,255,0.08)'}`,
        position: 'sticky', top: 0, zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div className="header-inner" style={{
          maxWidth: '1440px', margin: '0 auto',
          padding: '0 1.25rem', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', height: '60px',
          gap: '12px',
        }}>

          {/* Logo */}
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'linear-gradient(135deg,#64c8ff 0%,#0066cc 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(100,200,255,0.35)',
            }}>
              <FiMapPin size={14} color="white" />
            </div>
            <span style={{
              fontSize: '1.15rem', fontWeight: '900',
              background: 'linear-gradient(90deg,#64c8ff,#a8dcff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              Sky Sight
            </span>
          </motion.button>

          {/* Desktop nav — scrollable */}
          <nav className="desktop-nav" style={{
            alignItems: 'center', gap: '8px',
            overflowX: 'auto', scrollbarWidth: 'none', flex: 1,
            padding: '0 10px',
          }}>
            {navItems.map(({ path, icon: Icon, label, color, badge }) => {
              const isActive = loc.pathname === path;
              return (
                <motion.button
                  key={path}
                  onClick={() => navigate(path)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 11px', borderRadius: '10px', border: 'none',
                    background: isActive ? `${color}18` : 'transparent',
                    color: isActive ? color : 'rgba(160,185,222,0.7)',
                    fontSize: '0.82rem', fontWeight: isActive ? '800' : '500',
                    cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span>{label}</span>
                  {badge && (
                    <span style={{
                      fontSize: '0.5rem', fontWeight: '900', color: '#fff',
                      background: '#f472b6', padding: '1px 5px', borderRadius: '99px',
                      letterSpacing: '0.04em', lineHeight: 1.6,
                    }}>{badge}</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      style={{
                        position: 'absolute', bottom: '-2px', left: '8px', right: '8px',
                        height: '2px', borderRadius: '99px', background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={toggleDarkMode}
              title="Toggle theme"
              style={{
                width: '34px', height: '34px', borderRadius: '9px',
                background: 'rgba(100,200,255,0.07)',
                border: '1px solid rgba(100,200,255,0.15)',
                color: darkMode ? '#fbbf24' : '#93c5fd',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {darkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
            </motion.button>

            {/* User menu */}
            {user && (
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '4px 10px 4px 4px', borderRadius: '99px',
                    border: '1px solid rgba(100,200,255,0.2)',
                    background: menuOpen ? 'rgba(100,200,255,0.12)' : 'rgba(100,200,255,0.06)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#64c8ff,#0066cc)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: '900', color: '#fff',
                    boxShadow: '0 0 10px rgba(100,200,255,0.4)',
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hide-mobile" style={{ fontSize: '0.82rem', color: 'rgba(226,236,255,0.85)', fontWeight: '700' }}>
                    {user.name}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        background: 'rgba(9,18,42,0.99)',
                        border: '1px solid rgba(100,200,255,0.15)',
                        borderRadius: '14px', padding: '8px', minWidth: '170px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(30px)',
                      }}
                    >
                      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(100,200,255,0.08)', marginBottom: '6px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Signed in as</p>
                        <p style={{ color: '#e2ecff', fontWeight: '700', fontSize: '0.88rem', marginTop: '2px' }}>{user.email || user.name}</p>
                      </div>
                      <motion.button
                        whileHover={{ background: 'rgba(239,68,68,0.12)' }}
                        onClick={() => { logout(); setMenuOpen(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
                          padding: '9px 12px', borderRadius: '9px',
                          border: 'none', background: 'transparent',
                          color: '#ef4444', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700',
                        }}
                      >
                        <FiLogOut size={14} /> Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map(({ path, icon: Icon, label, color }) => {
            const isActive = loc.pathname === path;
            return (
              <motion.button
                key={path}
                onClick={() => navigate(path)}
                whileTap={{ scale: 0.9 }}
                className={`mobile-nav-btn${isActive ? ' active' : ''}`}
                style={{ color: isActive ? color : undefined }}
              >
                <Icon size={22} />
                {label}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
