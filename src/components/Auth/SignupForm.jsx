import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { signup, login } from '../../services/authAPI';
import { useAuthStore } from '../../store/authStore';
import { validateEmail, validatePassword } from '../../utils/validators';

const Field = ({ icon: Icon, label, type, value, onChange, placeholder, extra = '', loading }) => (
  <div>
    <label style={{ color: 'var(--text-label)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '7px' }}>{label}</label>
    <div className="input-group">
      <span className="input-icon-left"><Icon size={16} /></span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`input input-with-icon ${extra}`} disabled={loading} />
    </div>
  </div>
);

export default function SignupForm() {
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!name || !email || !password || !confirm) { setError('Fill all fields'); return; }
    if (!validateEmail(email)) { setError('Invalid email'); return; }
    if (!validatePassword(password)) { setError('Password must be 8–72 characters'); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      const r = await login(email, password);
      storeLogin({ email, name }, r.access_token, r.refresh_token);
      navigate('/');
    } catch (err) { setError(err.message || 'Signup failed.'); }
    finally { setLoading(false); }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--r-xl)', padding: '2.5rem', backdropFilter: 'blur(24px)', boxShadow: 'var(--shadow-lg)' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>Create account</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Join Sky Sight for free</p>

      {error && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</motion.div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <Field icon={FiUser} label="Name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" loading={loading} />
        <Field icon={FiMail} label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" loading={loading} />
        <div>
          <label style={{ color: 'var(--text-label)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '7px' }}>Password</label>
          <div className="input-group">
            <span className="input-icon-left"><FiLock size={16} /></span>
            <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters"
              className="input input-with-icon" style={{ paddingRight: '44px' }} disabled={loading} />
            <button type="button" onClick={() => setShow(!show)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label style={{ color: 'var(--text-label)', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '7px' }}>Confirm Password</label>
          <div className="input-group">
            <span className="input-icon-left"><FiLock size={16} /></span>
            <input type={show2 ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
              className="input input-with-icon" style={{ paddingRight: '44px' }} disabled={loading} />
            <button type="button" onClick={() => setShow2(!show2)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              {show2 ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '0.4rem' }}>
          {loading ? 'Creating…' : <><span>Create Account</span><FiArrowRight size={16} /></>}
        </button>
      </form>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.75rem' }}>
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} style={{ color: 'var(--accent)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>Sign in</button>
      </p>
    </motion.div>
  );
}
