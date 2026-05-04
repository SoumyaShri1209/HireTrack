import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// This page handles the redirect from Google OAuth
const GoogleSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      refreshUser().then(() => {
        toast.success('Logged in with Google!');
        navigate('/dashboard');
      });
    } else {
      toast.error('Google login failed');
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>Signing you in…</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
