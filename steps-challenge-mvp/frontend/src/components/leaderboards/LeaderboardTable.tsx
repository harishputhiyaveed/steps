import React, { useEffect, useState } from 'react';
import { leaderboardsAPI } from '../../services/api';
import { formatNumber } from '../../utils/formatters';
import type { UserLeaderboardEntry, TeamLeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  type: 'users' | 'teams';
  autoRefresh?: boolean;
  refreshInterval?: number;
  refreshTrigger?: number;
}

const TOP_N = 10;
const PURPLE = '#4B3B8C';
const BLACK = '#000000';
const WHITE = '#ffffff';

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const num = <span style={{ fontWeight: 600, color: BLACK }}>{rank}</span>;
  if (rank === 1) return <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '1.2rem', color: '#F59E0B' }}>🏆</span>{num}</span>;
  if (rank === 2) return <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>🏆</span>{num}</span>;
  if (rank === 3) return <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '1.2rem', color: '#CD7F32' }}>🏆</span>{num}</span>;
  return <span style={{ fontWeight: 600, color: BLACK }}>{rank}</span>;
};

const RefreshIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ display: 'inline-block', marginLeft: '4px' }}>
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  type,
  autoRefresh = true,
  refreshInterval = 60000,
  refreshTrigger = 0,
}) => {
  const [userLeaderboard, setUserLeaderboard] = useState<UserLeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(refreshInterval / 1000);

  const fetchLeaderboard = async () => {
    try {
      if (type === 'users') {
        const data = await leaderboardsAPI.getUserLeaderboard();
        setUserLeaderboard(data);
      } else {
        const data = await leaderboardsAPI.getTeamLeaderboard();
        setTeamLeaderboard(data);
      }
      setError(null);
      setCountdown(refreshInterval / 1000);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [type, autoRefresh, refreshInterval, refreshTrigger]);

  useEffect(() => {
    if (!autoRefresh) return;
    const tick = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? refreshInterval / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [autoRefresh, refreshInterval]);

  const title = type === 'users' ? 'Individual Leaderboard' : 'Team Leaderboard';
  const nameHeader = type === 'users' ? 'User Name' : 'Team Name';
  const rows = type === 'users' ? userLeaderboard.slice(0, TOP_N) : teamLeaderboard.slice(0, TOP_N);

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: PURPLE }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>{title}</h2>
        {autoRefresh && (
          <span style={{ fontSize: '0.875rem', color: WHITE, opacity: 0.9, display: 'flex', alignItems: 'center' }}>
            Auto-refresh in {countdown}s <RefreshIcon />
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: WHITE }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.875rem', fontWeight: 600, color: BLACK, width: '80px' }}>Rank</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.875rem', fontWeight: 600, color: BLACK }}>{nameHeader}</th>
              <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '0.875rem', fontWeight: 600, color: BLACK }}>Steps</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#ef4444', fontSize: '0.875rem' }}>{error}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.875rem' }}>No data available</td></tr>
            ) : (
              rows.map((entry, i) => (
                <tr
                  key={type === 'users' ? (entry as UserLeaderboardEntry).user_id : (entry as TeamLeaderboardEntry).team_name}
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                >
                  <td style={{ padding: '12px 20px', width: '80px' }}>
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: BLACK }}>
                    {type === 'users' ? (entry as UserLeaderboardEntry).full_name : (entry as TeamLeaderboardEntry).team_name}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: BLACK }}>
                    {formatNumber(entry.total_steps)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;

// Made with Bob
