import React, { useState, useEffect } from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import LoginForm from '../components/auth/LoginForm';
import LeaderboardTable from '../components/leaderboards/LeaderboardTable';
import PhotoCarousel from '../components/photos/PhotoCarousel';
import { leaderboardsAPI } from '../services/api';
import charityWeekLogo from '../assets/Charity Week Logo.png';

const WHITE = '#ffffff';
const BLACK = '#000000';
const PURPLE = '#4B3B8C';
const TARGET = 6_900_000;

const formatNumber = (n: number) => n.toLocaleString();

const LandingPage: React.FC = () => {
  const [authView, setAuthView] = useState<'register' | 'login'>('register');
  const [totalSteps, setTotalSteps] = useState<number>(0);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const data = await leaderboardsAPI.getUserLeaderboard();
        const sum = data.reduce((acc, u) => acc + u.total_steps, 0);
        setTotalSteps(sum);
      } catch {
        // silently fail — counter just stays at 0
      }
    };
    fetchTotal();
    const interval = setInterval(fetchTotal, 60000);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.min((totalSteps / TARGET) * 100, 100);
  const remaining = Math.max(TARGET - totalSteps, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>

      {/* Extension Banner */}
      <div style={{ backgroundColor: '#7c3aed', color: WHITE, textAlign: 'center', padding: '30px 24px', fontSize: '2.7rem', fontWeight: 600, letterSpacing: '0.01em' }}>
        📣 We are now extending the Steps Challenge to <strong>20th July at 6 PM UK Time</strong> — keep stepping! 🏃
      </div>

      {/* Header */}
      <header style={{ backgroundColor: WHITE, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={charityWeekLogo} alt="Charity Week 2026" style={{ height: '48px', width: 'auto' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: BLACK, margin: 0 }}>🏃 Charity Steps Challenge</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Track your steps and compete with your team!</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '5%', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* LEFT — poster card */}
          <div style={{ width: '100%', minWidth: '280px', flex: '1 1 400px' }}>
            <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: BLACK, margin: 0 }}>🏃 Steps Challenge</h2>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>Track your steps and compete with your team!</p>
              </div>

              {/* Steps Counter */}
              <div style={{ marginBottom: '20px' }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>Total Steps</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>Target: {formatNumber(TARGET)}</span>
                </div>

                {/* Big number with black border */}
                <div style={{ border: '2px solid #000000', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', marginBottom: '12px', backgroundColor: '#f9fafb' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: PURPLE, letterSpacing: '-0.02em' }}>
                    {formatNumber(totalSteps)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '2px' }}>steps logged so far</span>
                </div>

                {/* Progress bar */}
                <div style={{ backgroundColor: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: PURPLE, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                </div>

                {/* Below bar labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: PURPLE }}>{pct.toFixed(1)}% complete</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>
                    {remaining > 0 ? <>{formatNumber(remaining)} steps to go</> : '🎉 Target reached!'}
                  </span>
                </div>
              </div>

              {/* Poster fills remaining space */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={charityWeekLogo} alt="Charity Week 2026" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              </div>

            </div>

            {/* Team Leaderboard below the card */}
            <LeaderboardTable type="teams" autoRefresh={true} refreshInterval={60000} />
          </div>

          {/* RIGHT — auth form + leaderboards */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Photo Wall Banner */}
            <div style={{ backgroundColor: '#eef0ff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #d4d8ff' }}>
              <span style={{ display: 'inline-block', backgroundColor: PURPLE, color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.05em', marginBottom: '10px' }}>NEW!</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 2px', lineHeight: 1.15 }}>Upload your</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: PURPLE, margin: '0 0 10px', lineHeight: 1.15 }}>walks! 🚶</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="none" viewBox="0 0 24 24" stroke={PURPLE} strokeWidth={1.4} style={{ flexShrink: 0, opacity: 0.85 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div style={{ height: '2px', background: `linear-gradient(to right, ${PURPLE}, transparent)`, marginBottom: '10px', borderRadius: '999px' }} />
              <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>
                You can now upload photos from your walks to our photo wall — <strong style={{ color: PURPLE }}>the best picture also wins a prize!</strong>
              </p>
            </div>

            {authView === 'register' ? (
              <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
            ) : (
              <LoginForm onSwitchToRegister={() => setAuthView('register')} />
            )}
            <PhotoCarousel />
            <LeaderboardTable type="users" autoRefresh={true} refreshInterval={60000} />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: WHITE, boxShadow: '0 -1px 4px rgba(0,0,0,0.06)', marginTop: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          © 2026 Charity Steps Challenge. Track your steps, support a cause!
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

// Made with Bob
