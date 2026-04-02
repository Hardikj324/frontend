import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error) { return { hasError:true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }

  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', textAlign:'center', background:'var(--gradient-body)' }}>
        <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>⚠️</div>
        <h1 style={{ fontSize:'1.6rem', fontWeight:'900', color:'var(--red)', marginBottom:'10px' }}>Something went wrong</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem', maxWidth:'420px', fontSize:'0.9rem' }}>{this.state.error?.message}</p>
        <button onClick={() => window.location.reload()} className="btn btn-ghost btn-lg">
          Reload Page
        </button>
      </div>
    );
    return this.props.children;
  }
}
