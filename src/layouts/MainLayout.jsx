import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Common/Header';
import ErrorBoundary from '../components/Common/ErrorBoundary';
import { useAlertChecker } from '../hooks/useAlertChecker';
import { useWeather } from '../hooks/useWeather';
import { useWeatherStore } from '../store/weatherStore';
import AtmosphericBg from '../components/Common/AtmosphericBg';

export default function MainLayout() {
  const selectedLocation = useWeatherStore(s => s.selectedLocation);
  
  // Keep weather data synced globally based on selected location
  useWeather(selectedLocation?.lat, selectedLocation?.lon);
  
  // Start the background alert checker
  useAlertChecker();

  return (
    <ErrorBoundary>
      <AtmosphericBg />
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position: 'relative', zIndex: 1 }}>
        <Header />
        
        {/* Global Toast Notification Container */}
        <Toaster position="top-right" reverseOrder={false} />

        <main style={{ flex:1 }} className="page-enter app-shell">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}
