import React from 'react';

const sizes = { sm:'28px', md:'44px', lg:'60px' };

export default function LoadingSpinner({ size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div style={{ position:'relative', width:s, height:s }}>
        <div style={{ position:'absolute', inset:0, border:'3px solid transparent', borderTopColor:'var(--accent)', borderRightColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.75s linear infinite' }} />
        <div style={{ position:'absolute', inset:'6px', border:'3px solid transparent', borderBottomColor:'var(--orange)', borderRadius:'50%', animation:'spin 0.75s linear infinite reverse' }} />
      </div>
    </div>
  );
}
