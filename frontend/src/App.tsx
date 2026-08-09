import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Profile = React.lazy(() => import('./pages/Profile'));

const Settings = React.lazy(() => import('./pages/Settings'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));

function App() {
  return (
    <>
      <div className="mesh-bg" />
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white"><div className="animate-pulse">Loading Heralune...</div></div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/legal" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
