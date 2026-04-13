import React, { useRef, useEffect, useMemo } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useWeatherStore } from '../../store/weatherStore';

export default function AtmosphericBg() {
  const { darkMode } = useDarkMode();
  const weather = useWeatherStore(s => s.weather);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const weatherCode = weather?.current?.weather_code ?? 0;
  const isDay = weather?.current?.is_day ?? true;

  const theme = useMemo(() => {
    if (!darkMode) {
      if (weatherCode === 0 || weatherCode === 1) return { layers: ['#e0f2fe', '#bae6fd'], particles: 'sun', accent: '#f59e0b' };
      if (weatherCode >= 95) return { layers: ['#ede9fe', '#ddd6fe'], particles: 'lightning', accent: '#8b5cf6' };
      if (weatherCode >= 71 && weatherCode <= 77) return { layers: ['#eff6ff', '#dbeafe'], particles: 'snow', accent: '#60a5fa' };
      if (weatherCode >= 50) return { layers: ['#dbeafe', '#bfdbfe'], particles: 'rain', accent: '#3b82f6' };
      return { layers: ['#f1f5f9', '#e2e8f0'], particles: 'cloud', accent: '#64748b' };
    }
    if (!isDay) return { layers: ['#020818', '#060d20'], particles: 'star', accent: '#4f8ef7' };
    if (weatherCode === 0 || weatherCode === 1) return { layers: ['#0f1b3d', '#1a3a6b'], particles: 'sun', accent: '#fbbf24' };
    if (weatherCode >= 95) return { layers: ['#07090f', '#0b1525'], particles: 'lightning', accent: '#a855f7' };
    if (weatherCode >= 71 && weatherCode <= 77) return { layers: ['#0e1929', '#162840'], particles: 'snow', accent: '#bfdbfe' };
    if (weatherCode >= 50) return { layers: ['#080d1a', '#111c30'], particles: 'rain', accent: '#60a5fa' };
    return { layers: ['#0b1428', '#162240'], particles: 'cloud', accent: '#64b5f6' };
  }, [weatherCode, isDay, darkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    let particles = [];
    const W = () => canvas.width;
    const H = () => canvas.height;
    const COUNT = theme.particles === 'rain' ? 120 : theme.particles === 'snow' ? 60 : 80;

    const init = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W(), y: Math.random() * H(),
        size: Math.random() * 2.5 + 0.5,
        speedX: theme.particles === 'rain' ? (Math.random() - 0.4) * 2 : (Math.random() - 0.5) * 0.3,
        speedY: theme.particles === 'rain' ? Math.random() * 10 + 5
          : theme.particles === 'snow' ? Math.random() * 0.8 + 0.2
          : Math.random() * 0.15 + 0.05,
        opacity: Math.random() * 0.7 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
      }));
    };
    init();

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Draw gradient bg
      const grd = ctx.createLinearGradient(0, 0, 0, H());
      grd.addColorStop(0, theme.layers[0]);
      grd.addColorStop(1, theme.layers[1]);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W(), H());

      // Subtle radial glow centre
      const radial = ctx.createRadialGradient(W() * 0.5, H() * 0.3, 0, W() * 0.5, H() * 0.3, W() * 0.55);
      radial.addColorStop(0, theme.accent + '18');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W(), H());

      particles.forEach(p => {
        p.twinkle += p.twinkleSpeed;
        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.twinkle));

        if (theme.particles === 'rain') {
          ctx.strokeStyle = `rgba(147,197,253,${alpha * 0.5})`;
          ctx.lineWidth = p.size * 0.7;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + 18);
          ctx.stroke();
        } else if (theme.particles === 'snow') {
          ctx.fillStyle = `rgba(219,234,254,${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + 1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // stars / ambient
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        p.x += p.speedX; p.y += p.speedY;
        if (p.y > H() + 20) { p.y = -10; p.x = Math.random() * W(); }
        if (p.x > W() + 10 || p.x < -10) p.x = Math.random() * W();
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  // Using position fixed with zIndex -1 places it behind all application content
  return (
    <canvas 
      ref={canvasRef}
      style={{ 
        position: 'fixed', inset: 0, width: '100%', height: '100%', 
        zIndex: -1, pointerEvents: 'none',
      }} 
    />
  );
}
