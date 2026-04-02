import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiExternalLink, FiClock } from 'react-icons/fi';
import LocationAutocomplete from '../components/Search/LocationAutocomplete';
import { getWeatherNews } from '../services/newsAPI';
import { useWeatherStore } from '../store/weatherStore';

export default function NewsPage() {
  const defaultCity = useWeatherStore(s => s.selectedLocation?.name);
  const [selectedCity, setSelectedCity] = useState(defaultCity || null);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fetch if selectedCity is loaded
  useEffect(() => {
    if (!selectedCity) return;
    let isMounted = true;
    
    setIsLoading(true);
    setError('');
    
    getWeatherNews(selectedCity)
      .then(data => {
        if (isMounted) setNews(data.articles || []);
      })
      .catch(err => {
        if (isMounted) setError(err.message || 'Failed to load news for this location.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [selectedCity]);

  const handleLocationSelect = (loc) => {
    if (!loc) {
      setSelectedCity(null);
      setNews([]);
      return;
    }
    
    // We only need the city name for the news query
    setSelectedCity(loc.name);
  };

  return (
    <motion.div className="page-content page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Weather News
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Search for any city to see local breaking news and weather impacts.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '600px', marginBottom: '3rem' }}>
        <LocationAutocomplete defaultName={defaultCity} onSelect={handleLocationSelect} />
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-primary)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontWeight: '600' }}>Finding top stories for {selectedCity}...</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <p style={{ color: 'var(--red)', fontWeight: '700' }}>{error}</p>
          </motion.div>
        ) : !selectedCity ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-card)' }}>
            <FiMapPin size={48} style={{ color: 'var(--accent)', opacity: 0.5, margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Where do you want to look?</h3>
            <p style={{ color: 'var(--text-muted)' }}>Use the search bar above to select a city and uncover the ground reality.</p>
          </motion.div>
        ) : news.length === 0 ? (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No News Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>We couldn't find any recent weather news for {selectedCity}.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="grid" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '1.5rem' 
            }}
          >
            {news.map((article, idx) => (
              <motion.a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                key={idx}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  position: 'relative',
                  padding: 0,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                {/* Article Image */}
                <div style={{ width: '100%', height: '180px', background: 'var(--bg-input)', position: 'relative' }}>
                  {article.image ? (
                    <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>
                  )}
                  {/* Source Badge */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: 'var(--r-sm)' }}>
                    {article.source?.name || 'Local News'}
                  </div>
                </div>

                {/* Article Content */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    {article.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {article.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '700', borderTop: '1px solid var(--border-card)', paddingTop: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> Read Story</span>
                    <FiExternalLink />
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
