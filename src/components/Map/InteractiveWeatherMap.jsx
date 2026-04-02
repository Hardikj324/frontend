import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useWeatherStore } from '../../store/weatherStore';
import { useUIStore } from '../../store/uiStore';
import { getWeatherByCoordinates } from '../../services/weatherAPI';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiX, FiPlus, FiMinus } from 'react-icons/fi';

const layers = [
  { id:'temp',   label:'Temp',   icon:'🌡️' },
  { id:'radar',  label:'Radar',  icon:'🌧️' },
  { id:'wind',   label:'Wind',   icon:'💨' },
  { id:'clouds', label:'Clouds', icon:'☁️' },
];

export default function InteractiveWeatherMap() {
  const mapRef    = useRef(null);
  const mapEl     = useRef(null);
  const markersRef= useRef([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [activeLayer, setActiveLayer] = useState('temp');
  const { setWeather, weather }       = useWeatherStore();
  const { setMapZoom, setMapCenter }  = useUIStore();

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapEl.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [0, 20], zoom: 2, pitch: 30,
    });
    mapRef.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      setLoading(true);
      setSelectedLoc({ latitude: lat, longitude: lng });
      try {
        const data = await getWeatherByCoordinates(lat, lng);
        setWeather(data);
        const el = Object.assign(document.createElement('div'), {
          style: 'width:18px;height:18px;border-radius:50%;background:#64c8ff;border:3px solid white;box-shadow:0 0 14px #64c8ff;cursor:pointer;',
        });
        const marker = new maplibregl.Marker(el).setLngLat([lng, lat]).addTo(mapRef.current);
        markersRef.current.push(marker);
      } catch (err) { console.error(err); setSelectedLoc(null); }
      finally { setLoading(false); }
    });
    mapRef.current.on('zoomend', () => setMapZoom(mapRef.current.getZoom()));
    mapRef.current.on('moveend', () => { const c = mapRef.current.getCenter(); setMapCenter([c.lng, c.lat]); });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [setWeather, setMapZoom, setMapCenter]);

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    setSelectedLoc(null);
  };

  const mapStyle = { width:'100%', height:'560px', borderRadius:'var(--r-lg)', overflow:'hidden' };
  const ctrlBtn = (onClick, children, title) => (
    <button onClick={onClick} title={title}
      style={{ padding:'9px', background:'var(--bg-card)', border:'1px solid var(--border-input)', borderRadius:'var(--r-sm)', cursor:'pointer', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-sm)', transition:'background 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.background='var(--accent-hover)'}
      onMouseLeave={e=>e.currentTarget.style.background='var(--bg-card)'}>
      {children}
    </button>
  );

  return (
    <div className="card" style={{ padding:0, position:'relative', overflow:'hidden' }}>
      <div ref={mapEl} style={mapStyle} />

      {/* Info popup */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
            style={{ position:'absolute', top:'1rem', left:'1rem', background:'var(--bg-dropdown)', border:'1px solid var(--border-input)', borderRadius:'var(--r-md)', padding:'1rem 1.1rem', minWidth:'220px', boxShadow:'var(--shadow-lg)', backdropFilter:'blur(16px)', zIndex:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--accent)', fontWeight:'700', fontSize:'0.875rem' }}>
                <FiMapPin size={14} />
                {selectedLoc.latitude.toFixed(2)}°, {selectedLoc.longitude.toFixed(2)}°
              </div>
              <button onClick={() => setSelectedLoc(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'2px', display:'flex' }}>
                <FiX size={15} />
              </button>
            </div>

            {loading ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', padding:'8px 0' }}>Fetching weather…</p>
            ) : weather?.current ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {[
                  ['Temp',      `${weather.current.temperature}°C`,                  'var(--orange)'],
                  ['Condition', weather.current.condition_description,               'var(--text-primary)'],
                  ['Humidity',  `${weather.current.humidity}%`,                      'var(--accent)'],
                  ['Wind',      `${Math.round(weather.current.wind_speed)} km/h`,    'var(--blue)'],
                ].map(([l,v,color]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', background:'var(--accent-subtle)', padding:'6px 10px', borderRadius:'var(--r-sm)' }}>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{l}</span>
                    <span style={{ color, fontWeight:'700', fontSize:'0.82rem' }}>{v}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer controls */}
      <div style={{ position:'absolute', bottom:'1rem', left:'1rem', display:'flex', flexDirection:'column', gap:'6px', zIndex:10 }}>
        {layers.map(l => (
          <button key={l.id} onClick={() => setActiveLayer(l.id)}
            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', border:`1px solid ${activeLayer===l.id ? 'var(--accent)' : 'var(--border-input)'}`, borderRadius:'var(--r-md)', background: activeLayer===l.id ? 'var(--accent-hover)' : 'var(--bg-card)', color: activeLayer===l.id ? 'var(--accent)' : 'var(--text-secondary)', cursor:'pointer', fontSize:'0.8rem', fontWeight:'700', backdropFilter:'blur(12px)', boxShadow:'var(--shadow-sm)', transition:'all 0.2s' }}>
            <span>{l.icon}</span><span className="hide-mobile">{l.label}</span>
          </button>
        ))}
      </div>

      {/* Zoom + clear */}
      <div style={{ position:'absolute', bottom:'1rem', right:'1rem', display:'flex', flexDirection:'column', gap:'6px', zIndex:10 }}>
        {ctrlBtn(() => mapRef.current?.zoomIn(),  <FiPlus size={18}/>,  'Zoom in')}
        {ctrlBtn(() => mapRef.current?.zoomOut(), <FiMinus size={18}/>, 'Zoom out')}
        {markersRef.current.length > 0 && (
          <button onClick={clearMarkers}
            style={{ padding:'7px 10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--r-sm)', color:'var(--red)', cursor:'pointer', fontSize:'0.72rem', fontWeight:'700', boxShadow:'var(--shadow-sm)' }}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
