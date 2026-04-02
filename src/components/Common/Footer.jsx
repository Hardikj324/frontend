import React from 'react';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{ background:'var(--bg-header)', borderTop:'1px solid var(--border-primary)', padding:'2.5rem 1.5rem 1.5rem', marginTop:'auto' }}>
      <div style={{ maxWidth:'1340px', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'2rem', marginBottom:'2rem' }}>
          <div>
            <p style={{ color:'var(--accent)', fontWeight:'800', marginBottom:'8px' }}>Sky Sight</p>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', lineHeight:'1.6' }}>Real-time weather with interactive maps and alerts.</p>
          </div>
          <div>
            <p style={{ color:'var(--text-secondary)', fontWeight:'700', fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'10px' }}>Quick Links</p>
            {['Home','Forecast','Settings'].map(l => (
              <p key={l} style={{ marginBottom:'6px' }}><a href="#" style={{ color:'var(--text-muted)', fontSize:'0.875rem', transition:'color 0.2s' }} onMouseEnter={e=>e.target.style.color='var(--accent)'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>{l}</a></p>
            ))}
          </div>
          <div>
            <p style={{ color:'var(--text-secondary)', fontWeight:'700', fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'10px' }}>Connect</p>
            <div style={{ display:'flex', gap:'12px' }}>
              {[FiGithub, FiTwitter, FiMail].map((Icon, i) => (
                <a key={i} href="#" style={{ color:'var(--text-muted)', transition:'color 0.2s', display:'flex' }} onMouseEnter={e=>e.currentTarget.style.color='var(--accent)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop:'1px solid var(--border-card)', paddingTop:'1.25rem', textAlign:'center' }}>
          <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>© 2026 Sky Sight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
