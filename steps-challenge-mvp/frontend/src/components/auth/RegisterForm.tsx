import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teamsAPI } from '../../services/api';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
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

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    team_name: '',
    password: '',
    confirmPassword: '',
  });
  const [teams, setTeams] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamList = await teamsAPI.getAvailableTeams();
        setTeams(teamList);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!formData.team_name) { setError('Please select a team'); return; }
    const emailLower = formData.email.toLowerCase();
    if (!emailLower.includes('merative') && !emailLower.includes('ibm')) {
      setError('Registration is only open to Merative or IBM email addresses');
      return;
    }
    setLoading(true);
    try {
      await register({ full_name: formData.full_name, email: formData.email, team_name: formData.team_name, password: formData.password });
    } catch (err: any) {
      if (err.message === 'PENDING_APPROVAL') {
        setRegistered(true);
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '40px 32px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: BLACK, margin: '0 0 12px' }}>Registration Submitted!</h2>
        <p style={{ fontSize: '0.9rem', color: '#374151', margin: '0 0 8px', lineHeight: 1.6 }}>
          Your account for <strong>{formData.email}</strong> has been created and is now <strong>pending admin approval</strong>.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 28px', lineHeight: 1.6 }}>
          You'll be able to log in once an admin approves your account. This usually happens within 24 hours.
        </p>
        {onSwitchToLogin && (
          <button onClick={onSwitchToLogin} style={{ backgroundColor: PURPLE, color: WHITE, padding: '12px 32px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Back to Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px', width: '100%', boxSizing: 'border-box' }}>

      {/* Avatar + Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: PURPLE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={WHITE} strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: BLACK, margin: 0 }}>Create Your Account</h2>
        <p style={{ fontSize: '0.875rem', color: BLACK, marginTop: '4px' }}>Join the challenge and make every step count!</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="full_name" style={labelStyle}>Full Name</label>
          <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} required style={inputStyle} placeholder="Enter your full name" />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>Email Address</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="Enter your IBM or Merative email" />
        </div>

        <div>
          <label htmlFor="team_name" style={labelStyle}>Team Name</label>
          <select id="team_name" name="team_name" value={formData.team_name} onChange={handleChange} required style={inputStyle}>
            <option value="">Select your team</option>
            {teams.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required minLength={6} style={{ ...inputStyle, paddingRight: '44px' }} placeholder="Create a password" />
            <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af' }}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required minLength={6} style={{ ...inputStyle, paddingRight: '44px' }} placeholder="Confirm your password" />
            <button type="button" onClick={() => setShowConfirmPassword(v => !v)} tabIndex={-1} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af' }}>
              <EyeIcon open={showConfirmPassword} />
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: PURPLE, color: WHITE, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px' }}>
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>

      {onSwitchToLogin && (
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.875rem', color: BLACK }}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} style={{ color: PURPLE, background: 'none', border: 'none', padding: 0, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            Login
          </button>
        </p>
      )}
    </div>
  );
};

export default RegisterForm;

// Made with Bob
