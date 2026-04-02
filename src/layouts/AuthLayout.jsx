import React from 'react';
import { Outlet } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

export default function AuthLayout() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--gradient-body)', backgroundAttachment:'fixed', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'18%', left:'8%',  width:'280px', height:'280px', background:'radial-gradient(circle,rgba(100,200,255,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'12%', right:'6%', width:'360px', height:'360px', background:'radial-gradient(circle,rgba(0,100,200,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', justifyContent:'center', marginBottom:'2.25rem' }}>
          <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,#64c8ff,#0066cc)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FiMapPin size={20} color="white" />
          </div>
          <span style={{ fontSize:'1.7rem', fontWeight:'900', background:'linear-gradient(90deg,#64c8ff,#a8dcff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Sky Sight
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
