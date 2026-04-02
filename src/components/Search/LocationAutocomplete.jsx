import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiSearch, FiX } from 'react-icons/fi';

export default function LocationAutocomplete({ onSelect, defaultName = '' }) {
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen]           = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [selectedName, setSelected]   = useState(defaultName);
  const timer   = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (defaultName && !selectedName) {
      setSelected(defaultName);
    }
  }, [defaultName]);

  useEffect(() => {
    const handler = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setSuggestions([]); setIsOpen(false); return; }
    setIsLoading(true); setIsOpen(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en`);
        const d = await r.json();
        setSuggestions(d.results || []);
      } catch { setSuggestions([]); }
      finally { setIsLoading(false); }
    }, 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const select = (loc) => {
    const name = [loc.name, loc.admin1, loc.country].filter(Boolean).join(', ');
    setSelected(name); setQuery(''); setSuggestions([]); setIsOpen(false); onSelect(loc);
  };

  const clear = () => {
    setQuery(''); setSelected(''); setSuggestions([]); setIsOpen(false); onSelect(null);
  };

  return (
    <div ref={rootRef} style={{ position:'relative', width:'100%' }}>
      <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
        <FiSearch size={17} style={{ position:'absolute', left:'16px', color:'var(--accent)', pointerEvents:'none' }} />
        <input type="text" className="search-bar"
          placeholder={selectedName || 'Search city or location…'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
        />
        {isLoading ? (
          <div style={{ position:'absolute', right:'16px', width:'17px', height:'17px', border:'2px solid var(--border-primary)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        ) : (query || selectedName) ? (
          <button onClick={clear} style={{ position:'absolute', right:'12px', background:'var(--accent-subtle)', border:'none', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}>
            <FiX size={12} />
          </button>
        ) : null}
      </div>

      {selectedName && !query && (
        <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
          style={{ marginTop:'8px', display:'inline-flex', alignItems:'center', gap:'6px', padding:'4px 12px', borderRadius:'99px', background:'var(--accent-subtle)', border:'1px solid var(--border-input)' }}>
          <FiMapPin size={11} style={{ color:'var(--accent)' }} />
          <span style={{ color:'var(--accent)', fontSize:'0.78rem', fontWeight:'700' }}>{selectedName}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div initial={{ opacity:0, y:-8, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.14 }}
            className="search-dropdown" style={{ position:'absolute', top:'calc(100% + 10px)', left:0, right:0 }}>
            {suggestions.map((loc, idx) => (
              <button key={loc.id||idx} onClick={() => select(loc)} className="search-item">
                <div style={{ width:'30px', height:'30px', borderRadius:'var(--r-sm)', background:'var(--accent-subtle)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <FiMapPin size={13} style={{ color:'var(--accent)' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:'700', color:'var(--text-primary)', fontSize:'0.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {loc.name}{loc.admin1 && <span style={{ fontWeight:'400', color:'var(--text-secondary)' }}>, {loc.admin1}</span>}
                  </p>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:'1px' }}>
                    {loc.country}{loc.latitude && ` · ${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
        {isOpen && !isLoading && query && suggestions.length === 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="search-dropdown" style={{ position:'absolute', top:'calc(100% + 10px)', left:0, right:0, padding:'1.5rem', textAlign:'center' }}>
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>No places found for "<strong style={{ color:'var(--text-secondary)' }}>{query}</strong>"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
