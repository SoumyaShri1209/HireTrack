import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import GoogleSuccess from './pages/GoogleSuccess';
import Dashboard from './pages/Dashboard';
import JobFeed from './pages/JobFeed';
import Pipeline from './pages/Pipeline';
import Offers from './pages/Offers';
import Resume from './pages/Resume';
import SkillGap from './pages/SkillGap';
import Activity from './pages/Activity';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/google-success" element={<GoogleSuccess />} />
          <Route path="/auth/google-error" element={
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 20,
            }}>
              <div style={{ fontSize: 48 }}>⚠️</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, color: '#ff4d6d' }}>
                Google login failed
              </div>
              <a href="/login" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                ← Try again
              </a>
            </div>
          } />

          {/* ── Protected ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobFeed />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/skill-gap" element={<SkillGap />} />
              <Route path="/activity" element={<Activity />} />
            </Route>
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontFamily: 'Syne, sans-serif',
            fontSize: 13,
          },
          success: { iconTheme: { primary: '#00d084', secondary: '#000' } },
          error: { iconTheme: { primary: '#ff4d6d', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
};

export default App;
