import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../../services/authAPI';
import { useAuthStore } from '../../store/authStore';
import { validateEmail } from '../../utils/validators';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!validateEmail(email)) { setError('Please enter a valid email'); return; }
    setLoading(true);
    try {
      const r = await login(email, password);
      storeLogin({ email, name: email.split('@')[0] }, r.access_token, r.refresh_token);
      navigate('/');
    } catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--r-xl)', padding: '2.5rem', backdropFilter: 'blur(24px)', boxShadow: 'var(--shadow-lg)' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>Welcome back</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Sign in to your Sky Sight account</p>

      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert-error" style={{ marginBottom: '1.25rem' }}>
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label style={{ color: 'var(--text-label)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '7px' }}>Email</label>
          <div className="input-group">
            <span className="input-icon-left"><FiMail size={16} /></span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="input input-with-icon" disabled={loading} />
          </div>
        </div>
        <div>
          <label style={{ color: 'var(--text-label)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '7px' }}>Password</label>
          <div className="input-group">
            <span className="input-icon-left"><FiLock size={16} /></span>
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="input input-with-icon" style={{ paddingRight: '44px' }} disabled={loading} />
            <button type="button" onClick={() => setShow(!show)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '0.4rem' }}>
          {loading ? 'Signing in…' : <><span>Sign In</span><FiArrowRight size={16} /></>}
        </button>
      </form>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.75rem' }}>
        No account?{' '}
        <button onClick={() => navigate('/signup')} style={{ color: 'var(--accent)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Sign up</button>
      </p>
    </motion.div>
  );
}
