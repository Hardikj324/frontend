import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiMapPin, FiPlus, FiEdit2, FiCheck } from 'react-icons/fi';
import { saveLocations } from '../services/locationsAPI'; import { API_BASE_URL } from '../utils/constants';

// Inline city search (no dep on LocationAutocomplete to keep modal self-contained)
function CitySearch({ onSelect, placeholder = 'Search a city…' }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = React.useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true); setOpen(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en`);
        const d = await r.json();
        setResults(d.results || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 320);
  }, [q]);

  const pick = (loc) => {
    onSelect(loc);
    setQ(''); setResults([]); setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <FiSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', pointerEvents: 'none' }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', background: 'var(--bg-input)', border: '1.5px solid var(--border-input)', borderRadius: 'var(--r-md)', padding: '10px 12px 10px 36px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={e => { e.target.style.borderColor = 'var(--border-input-focus)'; if (results.length) setOpen(true); }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; setTimeout(() => setOpen(false), 150); }}
        />
        {loading && <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', border: '2px solid var(--border-card)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)', borderRadius: 'var(--r-md)', overflow: 'hidden', zIndex: 99, boxShadow: 'var(--shadow-lg)' }}>
            {results.map((loc, i) => (
              <button key={loc.id || i} onMouseDown={() => pick(loc)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: 'none', borderTop: i > 0 ? '1px solid var(--border-card)' : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <FiMapPin size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.875rem' }}>
                    {loc.name}{loc.admin1 ? `, ${loc.admin1}` : ''}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{loc.country}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────
export default function SaveLocationModal({ isOpen, onClose, onSaved }) {
  const MAX = 4;
  const [cities, setCities] = useState([]);   // [{ name, latitude, longitude, country }]
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editIdx, setEditIdx] = useState(null);  // which slot is being edited

  // Load existing saved cities when modal opens
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/weather/saved-locations`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        if (!r.ok) return;
        const d = await r.json();
        const loaded = (d.locations || []).map(l => ({
          name: l.name,
          latitude: l.latitude,
          longitude: l.longitude,
          country: '',
        }));
        setCities(loaded);
      } catch { /* start empty */ }
    })();
  }, [isOpen]);

  const addCity = (loc) => {
    if (editIdx !== null) {
      // Replace the city at editIdx
      setCities(prev => prev.map((c, i) => i === editIdx ? { name: loc.name, latitude: loc.latitude, longitude: loc.longitude, country: loc.country } : c));
      setEditIdx(null);
    } else {
      if (cities.length >= MAX) return;
      const already = cities.some(c => c.name.toLowerCase() === loc.name.toLowerCase());
      if (already) { setError(`"${loc.name}" is already added`); setTimeout(() => setError(''), 2500); return; }
      setCities(prev => [...prev, { name: loc.name, latitude: loc.latitude, longitude: loc.longitude, country: loc.country }]);
    }
  };

  const removeCity = (idx) => {
    setCities(prev => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const slots = [cities[0]?.name || null, cities[1]?.name || null, cities[2]?.name || null, cities[3]?.name || null];
      await saveLocations(...slots);
      onSaved();   // tell parent to refresh
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(4px)' }}>

        <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.25 }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--r-xl)', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(20px)' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Manage Locations</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '3px' }}>{cities.length}/{MAX} slots used</p>
            </div>
            <button onClick={onClose} style={{ background: 'var(--accent-subtle)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <FiX size={16} />
            </button>
          </div>

          {/* Search — only show if editing a slot OR there's room */}
          {(editIdx !== null || cities.length < MAX) && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ color: 'var(--text-label)', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                {editIdx !== null ? `Replace slot ${editIdx + 1}` : 'Add a city'}
              </p>
              <CitySearch
                onSelect={addCity}
                placeholder={editIdx !== null ? `Search new city for slot ${editIdx + 1}…` : 'Search city name…'}
              />
              {editIdx !== null && (
                <button onClick={() => setEditIdx(null)}
                  style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  Cancel edit
                </button>
              )}
            </div>
          )}

          {/* Saved cities list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
            {cities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--accent-subtle)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-input)' }}>
                <FiMapPin size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No cities added yet. Search above to add.</p>
              </div>
            )}

            {cities.map((city, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: editIdx === idx ? 'var(--accent-hover)' : 'var(--accent-subtle)', border: `1px solid ${editIdx === idx ? 'var(--accent)' : 'var(--border-card)'}`, borderRadius: 'var(--r-md)', transition: 'all 0.2s' }}>

                {/* Slot number */}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900', color: '#fff', flexShrink: 0 }}>
                  {idx + 1}
                </div>

                {/* City name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</p>
                  {city.country && <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{city.country}</p>}
                </div>

                {/* Edit button */}
                <button onClick={() => setEditIdx(editIdx === idx ? null : idx)} title="Edit this slot"
                  style={{ padding: '6px', borderRadius: 'var(--r-sm)', border: 'none', background: editIdx === idx ? 'var(--accent)' : 'var(--bg-input)', color: editIdx === idx ? '#fff' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}>
                  {editIdx === idx ? <FiCheck size={14} /> : <FiEdit2 size={14} />}
                </button>

                {/* Delete button */}
                <button onClick={() => removeCity(idx)} title="Remove"
                  style={{ padding: '6px', borderRadius: 'var(--r-sm)', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}>
                  <FiX size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Slots full notice */}
          {cities.length >= MAX && editIdx === null && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              All 4 slots used. Edit ✏️ or remove ✕ a city to make room.
            </p>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginBottom: '1rem', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--r-sm)', color: 'var(--red)', fontSize: '0.85rem', fontWeight: '600' }}>
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || cities.length === 0} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
              {saving ? 'Saving…' : `Save ${cities.length > 0 ? `(${cities.length})` : ''} Locations`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
