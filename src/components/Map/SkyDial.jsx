import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getWeatherDescription, getWeatherIcon } from '../../utils/weatherHelpers';
import { useDarkMode } from '../../hooks/useDarkMode';

function fmtTime(iso) {
    if (!iso) return '--:-- --';
    const d = new Date(iso);
    const h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:00 ${ampm}`;
}

function polarToXY(deg, r, cx, cy) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ArcPath({ idx }) {
    if (idx === 0) return null;
    const cx = 126, cy = 126, r = 112;
    const sweep = (idx / 24) * 360;
    const end = polarToXY(sweep, r, cx, cy);
    const large = sweep > 180 ? 1 : 0;
    return (
        <path
            d={`M 126 14 A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="3"
            strokeLinecap="round"
        />
    );
}

function TickMarks() {
    const cx = 126, cy = 126, r = 120;
    const labels = ['NOW', '6AM', 'NOON', '6PM'];
    return (
        <>
            {Array.from({ length: 24 }, (_, i) => {
                const ang = (i / 24) * 360 - 90;
                const rad = ang * Math.PI / 180;
                const isMajor = i % 6 === 0;
                const len = isMajor ? 10 : 5;
                const x1 = cx + r * Math.cos(rad);
                const y1 = cy + r * Math.sin(rad);
                const x2 = cx + (r - len) * Math.cos(rad);
                const y2 = cy + (r - len) * Math.sin(rad);
                return (
                    <g key={i}>
                        <line
                            x1={x1.toFixed(1)} y1={y1.toFixed(1)}
                            x2={x2.toFixed(1)} y2={y2.toFixed(1)}
                            stroke={isMajor ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
                            strokeWidth={isMajor ? 1.5 : 0.75}
                            strokeLinecap="round"
                        />
                        {isMajor && (() => {
                            const lx = cx + (r + 16) * Math.cos(rad);
                            const ly = cy + (r + 16) * Math.sin(rad);
                            return (
                                <text
                                    x={lx.toFixed(1)} y={ly.toFixed(1)}
                                    textAnchor="middle" dominantBaseline="middle"
                                    fontSize="7" fontFamily="monospace"
                                    fill="currentColor"
                                    style={{ opacity: 0.5 }}
                                    letterSpacing="0.08em"
                                >
                                    {labels[i / 6]}
                                </text>
                            );
                        })()}
                    </g>
                );
            })}
        </>
    );
}

export default function SkyDial({ hourlyForecast = [] }) {
    const { darkMode } = useDarkMode();
    const data = hourlyForecast?.length > 0
        ? hourlyForecast.slice(0, 24)
        : Array(24).fill(null).map((_, i) => ({
            temperature: 24 + Math.round(Math.sin(i / 24 * Math.PI * 2) * 5),
            time: null,
            weather_code: 0,
            is_day: i >= 6 && i <= 20 ? 1 : 0
        }));

    const [currentIndex, setCurrentIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [hinted, setHinted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const dragRingRef = useRef(null);
    const draggingRef = useRef(false);
    const prevAngleRef = useRef(null);
    const accRotRef = useRef(0);
    const currentIndexRef = useRef(0);

    const getAngle = useCallback((e) => {
        const ring = dragRingRef.current;
        if (!ring) return 0;
        const rect = ring.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const px = e.touches ? e.touches[0].clientX : e.clientX;
        const py = e.touches ? e.touches[0].clientY : e.clientY;
        return Math.atan2(py - cy, px - cx) * 180 / Math.PI;
    }, []);

    const onStart = useCallback((e) => {
        draggingRef.current = true;
        setIsDragging(true);
        prevAngleRef.current = getAngle(e);
        if (!hinted) setHinted(true);
        e.preventDefault();
    }, [getAngle, hinted]);

    const onMove = useCallback((e) => {
        if (!draggingRef.current) return;
        e.preventDefault();
        const angle = getAngle(e);
        let delta = angle - prevAngleRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        prevAngleRef.current = angle;

        let newRot = accRotRef.current + delta;
        if (newRot < 0) newRot = 0;
        if (newRot > 345) newRot = 345;
        accRotRef.current = newRot;

        setRotation(newRot);

        const newIdx = Math.min(23, Math.max(0, Math.round(newRot / 15)));
        if (newIdx !== currentIndexRef.current) {
            currentIndexRef.current = newIdx;
            setCurrentIndex(newIdx);
        }
    }, [getAngle]);

    const onEnd = useCallback(() => {
        draggingRef.current = false;
        setIsDragging(false);
        prevAngleRef.current = null;
    }, []);

    useEffect(() => {
        const ring = dragRingRef.current;
        if (!ring) return;
        ring.addEventListener('mousedown', onStart);
        ring.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
        return () => {
            ring.removeEventListener('mousedown', onStart);
            ring.removeEventListener('touchstart', onStart);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchend', onEnd);
        };
    }, [onStart, onMove, onEnd]);

    const current = data[currentIndex] || {};
    const timeText = current.time ? fmtTime(current.time) : `${String(currentIndex).padStart(2, '0')}:00`;
    const tempText = current.temperature != null ? `${Math.round(current.temperature)}°` : '--°';
    const condText = current.weather_code != null ? getWeatherDescription(current.weather_code) : 'Clear';
    const iconStr = current.weather_code != null ? getWeatherIcon(current.weather_code, current.is_day) : '🌤';
    const isNight = current.is_day === 0;
    const desc = condText.toLowerCase();
    const isRain = desc.includes('rain') || desc.includes('shower') || desc.includes('drizzle') || desc.includes('thunder');

    const cardBg = darkMode
        ? (isNight
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' // Night
            : isRain 
                ? 'linear-gradient(135deg, #475569 0%, #334155 100%)' // Rain
                : 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)') // Day/Clear
        : 'var(--bg-card)'; // Theme background for light mode

    const knobStyle = {
        position: 'absolute',
        inset: 0,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: '50% 50%',
        pointerEvents: 'none',
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            minHeight: '480px',
            fontFamily: "'Plus Jakarta Sans', 'system-ui', sans-serif",
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            background: cardBg,
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.6s ease',
            color: darkMode ? '#ffffff' : 'var(--text-primary)',
        }}>
            {/* Top shimmer line */}
            <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
                background: 'linear-gradient(90deg,transparent,rgba(79,195,247,0.6),transparent)',
                pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{
                position: 'absolute', top: 24, left: 28, right: 28,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
                <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                        Hourly Forecast
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'inherit', letterSpacing: '-0.02em', marginTop: 2 }}>
                        Sky Dial
                    </div>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                    padding: '4px 10px', borderRadius: 20,
                }}>
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%', background: 'currentColor',
                        animation: 'skydial-pulse 1.8s infinite',
                    }} />
                    <span style={{ fontSize: 10, color: 'inherit', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LIVE</span>
                </div>
            </div>

            {/* Dial */}
            <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>

                {/* Outer subtle ring */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />

                {/* Tick marks SVG */}
                <svg style={{ position: 'absolute', inset: 8, width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', pointerEvents: 'none', color: darkMode ? '#fff' : 'var(--text-muted)' }} viewBox="0 0 252 252">
                    <TickMarks />
                </svg>

                {/* Arc SVG */}
                <svg style={{ position: 'absolute', inset: 14, width: 'calc(100% - 28px)', height: 'calc(100% - 28px)', pointerEvents: 'none' }} viewBox="0 0 252 252">
                    <circle cx="126" cy="126" r="112" fill="none" stroke="currentColor" style={{ opacity: 0.06 }} strokeWidth="3" />
                    <ArcPath idx={currentIndex} />
                </svg>

                {/* Rotating knob SVG */}
                <svg style={{ ...knobStyle, inset: 14, width: 'calc(100% - 28px)', height: 'calc(100% - 28px)', zIndex: 11 }} viewBox="0 0 252 252">
                    <circle cx="126" cy="14" r="10" fill="rgba(255,255,255,0.2)" />
                    <circle cx="126" cy="14" r="6" fill={isDragging ? '#ffffff' : 'rgba(255,255,255,0.8)'} style={{ transition: 'fill 0.2s' }} />
                    <circle cx="126" cy="14" r="3" fill="var(--bg-card)" />
                </svg>

                {/* Invisible drag ring — full circle, captures pointer events */}
                <div
                    ref={dragRingRef}
                    style={{
                        position: 'absolute',
                        inset: -10,
                        borderRadius: '50%',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        zIndex: 20,
                        touchAction: 'none',
                    }}
                />

                {/* Dashed visual ring */}
                <div style={{
                    position: 'absolute', inset: 14, borderRadius: '50%',
                    border: `2px dashed ${isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
                    transition: 'border-color 0.2s',
                    pointerEvents: 'none',
                }} />

                {/* Center face */}
                <div style={{
                    width: 162, height: 162, borderRadius: '50%', zIndex: 5,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5), 0 8px 30px rgba(0,0,0,0.4)',
                    pointerEvents: 'none', userSelect: 'none',
                    position: 'relative',
                }}>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 4, transition: 'all 0.3s' }}>
                        {timeText}
                    </div>
                    <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 2, filter: darkMode ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none', transition: 'all 0.3s' }}>
                        {iconStr}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: 'inherit', letterSpacing: '-0.04em', lineHeight: 1, transition: 'all 0.3s' }}>
                        {tempText}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, letterSpacing: '0.08em', fontFamily: 'monospace', maxWidth: 110, lineHeight: 1.3, transition: 'all 0.3s' }}>
                        {condText.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Hint */}
            {!hinted && (
                <div style={{
                    fontFamily: 'monospace', fontSize: 9, color: 'var(--text-muted)',
                    letterSpacing: '0.15em', marginTop: 8, transition: 'opacity 0.8s',
                }}>
                    ↺ DRAG RING TO SCRUB TIME
                </div>
            )}

            {/* Bottom strip */}
            <div style={{
                position: 'absolute', bottom: 24, left: 28, right: 28,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                    <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Hour progress
                    </div>
                    <div style={{ height: 2, background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'visible', position: 'relative' }}>
                        <div style={{
                            height: '100%',
                            width: `${(currentIndex / 23) * 100}%`,
                            background: darkMode ? 'linear-gradient(90deg,rgba(255,255,255,0.3),#ffffff)' : 'linear-gradient(90deg,rgba(0,0,0,0.1),var(--accent))',
                            borderRadius: 2,
                            transition: 'width 0.15s ease',
                            position: 'relative',
                        }}>
                            <div style={{
                                position: 'absolute', right: 0, top: -3,
                                width: 6, height: 8, background: darkMode ? '#ffffff' : 'var(--accent)',
                                borderRadius: 3, boxShadow: darkMode ? '0 0 6px #ffffff' : 'none',
                            }} />
                        </div>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 500, color: 'inherit', marginTop: 6, transition: 'all 0.15s' }}>
                        {timeText}
                    </div>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 300, color: 'var(--text-muted)', style: { opacity: 0.3 }, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {String(currentIndex).padStart(2, '0')}
                </div>
            </div>

            <style>{`
                @keyframes skydial-pulse {
                    0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,255,255,0.5)}
                    50%{opacity:0.5;box-shadow:0 0 0 4px transparent}
                }
            `}</style>
        </div>
    );
}