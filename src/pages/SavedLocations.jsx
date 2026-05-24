import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiRefreshCw, FiMapPin, FiPlus, FiAlertCircle, FiEdit2, FiX, FiWind, FiDroplet } from 'react-icons/fi';
import { getSavedLocationsWeather } from '../services/weatherAPI';
import { saveLocations } from '../services/locationsAPI';
import SaveLocationModal from '../components/SaveLocationModal';
import { getWeatherIcon } from '../utils/weatherHelpers';
import { formatTemperature } from '../utils/formatters';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// ── Individual location card ──────────────────────────────────────
function LocationCard({ location, index, onEdit, onDelete, onClick }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const c = location.current_weather_data?.current;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Remove "${location.name}"?`)) return;
    setDeleting(true);
    setDeleteError('');
    try {
      // Pass all current locations so parent can remove this one and save the rest
      await onDelete(index);
    } catch (err) {
      setDeleteError(err.message || 'Failed to remove');
      setTimeout(() => setDeleteError(''), 3000);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, type: 'spring', bounce: 0.3 }}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{ position: 'relative', cursor: 'pointer' }}
      onClick={onClick}>

      {/* Card */}
      <div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>

        {/* Action buttons (top-right) */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 2 }}
          onClick={e => e.stopPropagation()}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onEdit(index); }} title="Edit city"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-input)', background: 'var(--bg-card)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FiEdit2 size={14} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDelete} disabled={deleting} title="Remove"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FiX size={14} />
          </motion.button>
        </div>

        <div>
          {/* Location name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', paddingRight: '72px' }}>
            <div style={{ padding: '6px', background: 'var(--accent-subtle)', borderRadius: '50%' }}>
              <FiMapPin size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <p style={{ fontWeight: '900', fontSize: '1.15rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{location.name}</p>
          </div>

          {/* Weather content */}
          {c ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-2px', background: 'linear-gradient(135deg, var(--text-primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatTemperature(c.temperature)}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '600', marginTop: '8px' }}>
                    {c.condition_description}
                  </p>
                </div>
                <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ fontSize: '3.5rem', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
                  {getWeatherIcon(c.weather_code, c.is_day)}
                </motion.span>
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '1.25rem', borderTop: '1px solid var(--border-card)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '10px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                  <FiDroplet size={14} style={{ color: 'var(--blue)' }}/>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{c.humidity}%</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '10px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                  <FiWind size={14} style={{ color: 'gray' }}/>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{Math.round(c.wind_speed)} km/h</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600' }}>
              Weather data unavailable
            </div>
          )}
        </div>

        {/* Delete error */}
        {deleteError && (
          <p style={{ color: 'var(--red)', fontSize: '0.8rem', textAlign: 'center', marginTop: '12px', fontWeight: '700' }}>
            ❌ {deleteError}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function SavedLocationsPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // which slot to edit

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getSavedLocationsWeather();
      setLocations(data?.locations || []);
    } catch (err) {
      setError(err.message || 'Failed to load saved locations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Open modal for editing a specific slot
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setModalOpen(true);
  };

  // Open modal for adding new
  const handleAdd = () => {
    setEditIndex(null);
    setModalOpen(true);
  };

  // Delete a specific slot — keep all cities except the deleted one, then save
  const handleDelete = async (idx) => {
    const remaining = locations.filter((_, i) => i !== idx);
    const slots = [
      remaining[0]?.name || null,
      remaining[1]?.name || null,
      remaining[2]?.name || null,
      remaining[3]?.name || null,
    ];
    // Hit the update API with only the remaining cities
    await saveLocations(slots[0], slots[1], slots[2], slots[3]);
    // Refresh the list from server so UI is in sync
    await load();
  };

  // Click card → go to home with that city pre-loaded
  const handleCardClick = (loc) => {
    navigate(`/?city=${encodeURIComponent(loc.name)}&lat=${loc.latitude}&lng=${loc.longitude}`);
  };

  const canAdd = locations.length < 4;

  return (
    <>
      <motion.div className="page-content page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

        {/* Header bar */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-md)', background: 'var(--accent-subtle)', border: '1px solid var(--border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiStar size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>Saved Locations</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{locations.length}/4 slots used</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={load} disabled={loading} className="btn btn-ghost btn-sm">
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            {canAdd && (
              <button onClick={handleAdd} className="btn btn-primary btn-sm">
                <FiPlus size={14} /> Add Location
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading && locations.length === 0 ? (
            <motion.div key="loading" exit={{ opacity: 0 }} style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <LoadingSpinner size="lg" />
            </motion.div>

          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ maxWidth: '400px', margin: '0 auto', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 'var(--r-xl)', padding: '3rem 2rem', textAlign: 'center' }}>
              <FiAlertCircle size={40} style={{ color: 'var(--red)', margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--red)', fontWeight: '800', marginBottom: '8px' }}>Failed to load</h3>
              <p style={{ color: 'rgba(239,68,68,0.7)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={load} className="btn btn-danger btn-lg" style={{ margin: '0 auto' }}>Try Again</button>
            </motion.div>

          ) : locations.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', background: 'var(--bg-card)', border: '2px dashed var(--border-input)', borderRadius: 'var(--r-xl)', padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--accent-subtle)', border: '1px solid var(--border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FiMapPin size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>No saved locations</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '2rem', lineHeight: '1.65', fontSize: '0.9rem' }}>
                Save up to 4 cities to quickly check their weather anytime.
              </p>
              <button onClick={handleAdd} className="btn btn-primary btn-lg">
                <FiPlus size={18} /> Add Your First City
              </button>
            </motion.div>

          ) : (
            <motion.div key="grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <AnimatePresence>
                {locations.map((loc, idx) => (
                  <LocationCard
                    key={loc.name + idx}
                    location={loc}
                    index={idx}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={() => handleCardClick(loc)}
                  />
                ))}
              </AnimatePresence>

              {/* "Add more" ghost card if slots remain */}
              {canAdd && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleAdd}
                  style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', border: '2px dashed var(--border-input)', borderRadius: 'var(--r-lg)', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                  <FiPlus size={28} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '700' }}>Add City ({4 - locations.length} left)</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <SaveLocationModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditIndex(null); }}
        onSaved={load}
        editIndex={editIndex}
        currentLocations={locations}
      />
    </>
  );
}