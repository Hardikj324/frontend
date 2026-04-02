import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';

export default function LocationSearch({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const submit = (e) => { e.preventDefault(); if (query.trim()) onSearch(query); };

  return (
    <form onSubmit={submit} style={{ width:'100%' }}>
      <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
        <FiSearch size={17} style={{ position:'absolute', left:'16px', color:'var(--accent)', pointerEvents:'none' }} />
        <input type="text" className="search-bar" placeholder="Search for a location…"
          value={query} onChange={e=>setQuery(e.target.value)} disabled={isLoading} />
        <AnimatePresence>
          {query && (
            <motion.button type="button" onClick={() => setQuery('')}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:'absolute', right:'12px', background:'var(--accent-subtle)', border:'none', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-secondary)' }}>
              <FiX size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
