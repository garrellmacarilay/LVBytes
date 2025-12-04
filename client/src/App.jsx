import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { EvacuationCenters } from './components/EvacuationCenters';
import { LandingPage } from './components/LandingPage';
import { ReportIncident } from './components/ReportIncident';
import OfflineOverlay from './components/OfflineOverlay';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Convert Firebase user to app user format
        setUser({
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email,
          isVerified: currentUser.emailVerified,
          address: 'Location not set' // This could be stored in Firebase or user profile
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOffline && <OfflineOverlay onRetry={() => window.location.reload()} />}
      
      <Router>
        <Routes>
          {/* Landing Page at Root - Default route */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
          />
          
          {/* Login/Auth Route - redirect to dashboard if already logged in */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <AuthForm />} 
          />
          
          {/* Protected Routes - require authentication */}
          <Route 
            element={
              user ? (
                <Layout user={user} isOffline={isOffline} />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/evacuation" element={<EvacuationCenters />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/report" element={<ReportIncident />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;