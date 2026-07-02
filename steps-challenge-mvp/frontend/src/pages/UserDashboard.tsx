import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StepEntryForm from '../components/dashboard/StepEntryForm';
import UserStats from '../components/dashboard/UserStats';
import MyEntries from '../components/dashboard/MyEntries';
import LeaderboardTable from '../components/leaderboards/LeaderboardTable';
import PhotoUpload from '../components/photos/PhotoUpload';
import PhotoCarousel from '../components/photos/PhotoCarousel';
import { leaderboardsAPI } from '../services/api';
import charityWeekLogo from '../assets/Charity Week Logo.png';

const PURPLE = '#4B3B8C';
const WHITE = '#ffffff';
const BLACK = '#000000';
const TARGET = 6_900_000;
const formatNumber = (n: number) => n.toLocaleString();

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const data = await leaderboardsAPI.getUserLeaderboard();
        const sum = data.reduce((acc, u) => acc + u.total_steps, 0);
        setTotalSteps(sum);
      } catch {
        // silently fail
      }
    };
    fetchTotal();
    const interval = setInterval(fetchTotal, 60000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const pct = Math.min((totalSteps / TARGET) * 100, 100);
  const remaining = Math.max(TARGET - totalSteps, 0);

  const handleStepAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>

      {/* Header */}
      <header style={{ backgroundColor: WHITE, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={charityWeekLogo} alt="Charity Week 2026" style={{ height: '48px', width: 'auto' }} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000000', margin: 0 }}>🏃 Charity Steps Challenge</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Welcome back, {user?.full_name}!</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {user?.is_admin && (
              <button
                onClick={() => navigate('/admin')}
                style={{ backgroundColor: PURPLE, color: WHITE, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
              >
                ⚙️ Admin Panel
              </button>
            )}
            <button
              onClick={logout}
              style={{ backgroundColor: '#ef4444', color: WHITE, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main — two column layout matching landing page */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '5%', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* LEFT — poster + steps counter (same as landing page) */}
          <div style={{ flex: '1 1 400px', minWidth: '280px' }}>
            <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: BLACK, margin: 0 }}>🏃 Steps Challenge</h2>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>Track your steps and compete with your team!</p>
              </div>

              {/* Steps Counter */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>Total Steps</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>Target: {formatNumber(TARGET)}</span>
                </div>
                <div style={{ border: '2px solid #000000', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', marginBottom: '12px', backgroundColor: '#f9fafb' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: PURPLE, letterSpacing: '-0.02em' }}>
                    {formatNumber(totalSteps)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '2px' }}>steps logged so far</span>
                </div>
                <div style={{ backgroundColor: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, backgroundColor: PURPLE, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: PURPLE }}>{pct.toFixed(1)}% complete</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>
                    {remaining > 0 ? <>{formatNumber(remaining)} steps to go</> : '🎉 Target reached!'}
                  </span>
                </div>
              </div>

              {/* Poster */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={charityWeekLogo} alt="Charity Week 2026" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              </div>

            </div>
          </div>

          {/* RIGHT — forms + leaderboards */}
          <div style={{ flex: '1 1 340px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <StepEntryForm onSuccess={handleStepAdded} />
            <UserStats refreshTrigger={refreshTrigger} />
            <PhotoUpload onSuccess={handleStepAdded} />
            <PhotoCarousel currentUserId={user?.id} isAdmin={user?.is_admin} onDelete={handleStepAdded} />
            <LeaderboardTable type="users" autoRefresh={true} refreshInterval={60000} refreshTrigger={refreshTrigger} />
            <LeaderboardTable type="teams" autoRefresh={true} refreshInterval={60000} refreshTrigger={refreshTrigger} />
          </div>

        </div>

        {/* My Entries — full width below */}
        <div style={{ marginTop: '28px' }}>
          <MyEntries refreshTrigger={refreshTrigger} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: WHITE, boxShadow: '0 -1px 4px rgba(0,0,0,0.06)', marginTop: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          © 2026 Charity Steps Challenge. Keep stepping towards your goal!
        </div>
      </footer>

    </div>
  );
};

export default UserDashboard;

// Made with Bob
