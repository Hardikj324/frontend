import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiX } from 'react-icons/fi';
import { useDarkMode } from '../../hooks/useDarkMode';

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&accept-language=en`,
      { headers: { 'User-Agent': 'SkySightWeatherApp/1.0' } }
    );
    const d = await r.json();
    const name =
      d.address?.city ||
      d.address?.town ||
      d.address?.village ||
      d.address?.municipality ||
      d.address?.county ||
      d.address?.state ||
      d.name;
    const country = d.address?.country;
    if (name) return `${name}, ${country || ''}`.trim();
  } catch { }
  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}

export default function WeatherGlobe({ onLocationSelect, searchedLocation, userLocation }) {
  const globeRef = useRef();
  const { darkMode } = useDarkMode();
  const [pins, setPins] = useState([]);
  const [globeReady, setGlobeReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  //equirectangular map image
  const globeImage = darkMode
    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const bumpImage = '//unpkg.com/three-globe/example/img/earth-topology.png';

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = window.innerWidth <= 768 ? 350 : 460;
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true);
    if (!globeRef.current) return;
    const globe = globeRef.current;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.4;
    globe.controls().enableZoom = true;
    if (userLocation) {
      setTimeout(() => {
        globe.pointOfView(
          { lat: userLocation.latitude, lng: userLocation.longitude, altitude: 2.0 },
          1500
        );
      }, 500);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!globeRef.current || !searchedLocation || !globeReady) return;
    globeRef.current.controls().autoRotate = false;
    globeRef.current.pointOfView(
      { lat: searchedLocation.latitude, lng: searchedLocation.longitude, altitude: 1.5 },
      1200
    );
    const name =
      searchedLocation.name ||
      `${searchedLocation.latitude.toFixed(2)}°, ${searchedLocation.longitude.toFixed(2)}°`;
    setPins([{ lat: searchedLocation.latitude, lng: searchedLocation.longitude, name, color: '#5ab5ff' }]);
  }, [searchedLocation, globeReady]);

  const handleGlobeClick = useCallback(
    async ({ lat, lng }) => {
      if (!globeRef.current) return;
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 800);
      const cityName = await reverseGeocode(lat, lng);
      setPins([{ lat, lng, name: cityName, color: '#5ab5ff' }]);
      if (onLocationSelect) onLocationSelect({ latitude: lat, longitude: lng, name: cityName });
    },
    [onLocationSelect]
  );

  const clearPin = useCallback(() => {
    setPins([]);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1200);
    }
  }, []);

  const pinElement = useCallback((d) => {

    const root = document.createElement('div');
    root.style.cssText = `
      position: absolute;
      width: 0;
      height: 0;
      pointer-events: none;
    `;


    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: 14px;
      height: 14px;
      background: ${d.color || '#5ab5ff'};
      border: 2.5px solid white;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow:
        0 0 0 4px rgba(90, 181, 255, 0.2),
        0 0 18px ${d.color || '#5ab5ff'},
        0 2px 8px rgba(0, 0, 0, 0.7);
    `;


    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: 12px;
      left: 0;
      transform: translateX(-50%);
      padding: 4px 10px;
      background: rgba(8, 16, 36, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(90, 181, 255, 0.3);
      border-radius: 8px;
      color: #5ab5ff;
      font-size: 11px;
      font-weight: 800;
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: 0.02em;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    `;
    label.textContent = d.name;

    root.appendChild(dot);
    root.appendChild(label);
    return root;
  }, []);

  // Small positive altitude prevents z-fighting with the globe mesh surface.
  // Parallax drift at this value is <0.5px even at maximum zoom-out.
  const HTML_ALTITUDE = 0.005;

  const pointsData = useMemo(
    () => pins.map((p) => ({ lat: p.lat, lng: p.lng, size: 0.5, color: p.color || '#5ab5ff' })),
    [pins]
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-card)',
        }}
      >
        {dimensions.width > 0 && (
          <Globe
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl={globeImage}
            bumpImageUrl={bumpImage}
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            showAtmosphere={false}
            onGlobeReady={handleGlobeReady}
            onGlobeClick={handleGlobeClick}
            htmlElementsData={pins}
            htmlLat="lat"
            htmlLng="lng"
            htmlElement={pinElement}
            htmlAltitude={HTML_ALTITUDE}
            pointsData={pointsData}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={HTML_ALTITUDE}
            pointRadius="size"
            pointColor="color"
            pointsMerge={false}
            animateIn={true}
          />
        )}


        {/* Active pin badge */}
        <AnimatePresence>
          {pins.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute',
                top: '12px', left: '12px',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px',
                background: 'rgba(8, 16, 36, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(90, 181, 255, 0.28)',
                borderRadius: 'var(--radius-full)',
                color: '#5ab5ff',
                fontSize: '0.82rem',
                fontWeight: '700',
                zIndex: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <FiMapPin size={13} />
              <span>{pins[0].name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); clearPin(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '20px', height: '20px',
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '50%',
                  color: '#ef4444',
                  cursor: 'pointer',
                  marginLeft: '4px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
              >
                <FiX size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle hint */}
        {pins.length === 0 && globeReady && (
          <div
            style={{
              position: 'absolute',
              bottom: '90px', left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 16px',
              background: 'rgba(8, 16, 36, 0.78)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(90, 181, 255, 0.15)',
              borderRadius: 'var(--radius-full)',
              color: 'rgba(90, 181, 255, 0.75)',
              fontSize: '0.72rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              zIndex: 6,
              pointerEvents: 'none',
            }}
          >
            🌍 Click anywhere on the globe to check weather
          </div>
        )}
      </motion.div>
    </div>
  );
}