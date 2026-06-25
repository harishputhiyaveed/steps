import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

const PURPLE = '#4B3B8C';
const BLACK = '#000000';
const WHITE = '#ffffff';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '0.875rem',
  color: BLACK,
  backgroundColor: WHITE,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 700,
  fontSize: '0.875rem',
  color: BLACK,
  marginBottom: '6px',
};

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.12-3.364M6.53 6.533A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.116 5.195M15 12a3 3 0 11-4.243-4.243M3 3l18 18" />
    </svg>
  );

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px', width: '100%', boxSizing: 'border-box' }}>

      {/* Avatar + Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={WHITE} strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: BLACK, margin: 0 }}>Welcome Back</h2>
        <p style={{ fontSize: '0.875rem', color: BLACK, marginTop: '4px' }}>Sign in to track your steps</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" style={labelStyle}>Email Address</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="Enter your email address" />
        </div>

        <div>
          <label htmlFor="login-password" style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: '44px' }} placeholder="Enter your password" />
            <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af' }}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: PURPLE, color: WHITE, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px' }}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      {onSwitchToRegister && (
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: BLACK }}>
          Don't have an account?{' '}
          <button onClick={onSwitchToRegister} style={{ color: PURPLE, background: 'none', border: 'none', padding: 0, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            Register
          </button>
        </p>
      )}

    </div>
  );
};

export default LoginForm;

// Made with Bob
