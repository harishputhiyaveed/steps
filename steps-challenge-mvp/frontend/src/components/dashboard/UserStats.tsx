import React, { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { formatNumber } from '../../utils/formatters';
import type { UserStats as UserStatsType } from '../../types';

interface UserStatsProps {
  refreshTrigger?: number;
}

const PURPLE = '#4B3B8C';
const BLACK = '#000000';
const WHITE = '#ffffff';

const UserStats: React.FC<UserStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await userAPI.getMyStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', backgroundColor: PURPLE }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>My Stats</h2>
      </div>

      {/* Body */}
      <div style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', padding: '16px 0' }}>Loading…</p>
        ) : error || !stats ? (
          <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.875rem', padding: '16px 0' }}>{error || 'No data'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Name</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: BLACK, margin: '2px 0 0' }}>{stats.full_name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Team</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: BLACK, margin: '2px 0 0' }}>{stats.team_name}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Total Steps</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: PURPLE, margin: '2px 0 0' }}>{formatNumber(stats.total_steps)}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>My Rank</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: PURPLE, margin: '2px 0 0' }}>#{stats.user_rank}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Team Rank</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: PURPLE, margin: '2px 0 0' }}>#{stats.team_rank}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStats;

// Made with Bob
