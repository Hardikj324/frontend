import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { saveLocations, getUserLocations } from '../../services/locationsAPI';
import { FiSave, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function SavedLocations() {
  const [slots, setSlots]   = useState({ slot1:'', slot2:'', slot3:'', slot4:'' });
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(false);
  const [msg, setMsg]             = useState('');
  const [msgOk, setMsgOk]         = useState(true);

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = async () => {
    setFetching(true);
    try {
      const d = await getUserLocations();
      setSlots({ slot1:d.slot1_name||'', slot2:d.slot2_name||'', slot3:d.slot3_name||'', slot4:d.slot4_name||'' });
    } catch(e) { console.error(e); }
    finally { setFetching(false); }
  };

  const save = async () => {
    setLoading(true);
    try {
      await saveLocations(slots.slot1, slots.slot2, slots.slot3, slots.slot4);
      setMsg('Locations saved!'); setMsgOk(true);
    } catch(e) { setMsg(e.message||'Failed'); setMsgOk(false); }
    finally { setLoading(false); setTimeout(() => setMsg(''), 3000); }
  };

  if (fetching) return (
    <div className="card" style={{ padding:'3rem', display:'flex', justifyContent:'center' }}>
      <LoadingSpinner />
    </div>
  );

  const inputStyle = {
    width:'100%', background:'var(--bg-input)', border:'1.5px solid var(--border-input)',
    borderRadius:'var(--r-md)', padding:'11px 14px', color:'var(--text-primary)',
    fontSize:'0.9rem', outline:'none', fontFamily:'inherit', transition:'border-color 0.2s',
  };

  return (
    <motion.div className="card" initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} style={{ padding:'1.75rem' }}>
      <p className="card-title">⭐ Saved Locations</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'0.9rem', marginBottom:'1.1rem' }}>
        {['slot1','slot2','slot3','slot4'].map((s, i) => (
          <div key={s}>
            <label style={{ color:'var(--text-label)', fontSize:'0.68rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:'6px' }}>Slot {i+1}</label>
            <input type="text" name={s} value={slots[s]} placeholder={`City name, e.g. Delhi`}
              onChange={e => setSlots({...slots, [s]:e.target.value})}
              style={inputStyle} disabled={loading}
              onFocus={e=>e.target.style.borderColor='var(--border-input-focus)'}
              onBlur={e=>e.target.style.borderColor='var(--border-input)'}
            />
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={save} disabled={loading} className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>
          <FiSave size={15}/> {loading ? 'Saving…' : 'Save'}
        </button>
        <button onClick={() => setSlots({slot1:'',slot2:'',slot3:'',slot4:''})} disabled={loading} className="btn btn-danger">
          <FiTrash2 size={15}/>
        </button>
        <button onClick={fetchLocations} disabled={loading||fetching} className="btn btn-ghost">
          <FiRefreshCw size={15} className={fetching?'animate-spin':''} />
        </button>
      </div>

      {msg && (
        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
          style={{ marginTop:'10px', padding:'10px 14px', borderRadius:'var(--r-sm)', textAlign:'center', fontWeight:'700', fontSize:'0.875rem',
            background: msgOk ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
            border:`1px solid ${msgOk ? 'rgba(52,211,153,0.3)':'rgba(239,68,68,0.25)'}`,
            color: msgOk ? 'var(--green)' : 'var(--red)' }}>
          {msgOk ? '✅' : '❌'} {msg}
        </motion.div>
      )}
    </motion.div>
  );
}
