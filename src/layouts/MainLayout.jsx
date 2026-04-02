import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from '../components/Common/Header';
import ErrorBoundary from '../components/Common/ErrorBoundary';
import { useAlertChecker } from '../hooks/useAlertChecker';

export default function MainLayout() {
  // Start the background alert checker
  useAlertChecker();

  return (
    <ErrorBoundary>
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <Header />
        
        {/* Global Toast Notification Container */}
        <Toaster position="top-right" reverseOrder={false} />

        <main style={{ flex:1 }} className="page-enter">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}
