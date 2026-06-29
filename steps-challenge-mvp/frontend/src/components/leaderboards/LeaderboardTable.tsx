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

const TrophyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill={color}>
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>
);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <TrophyIcon color="#F59E0B" />;
  if (rank === 2) return <TrophyIcon color="#9CA3AF" />;
  if (rank === 3) return <TrophyIcon color="#CD7F32" />;
  return <span style={{ fontWeight: 600, fontSize: '0.95rem', color: BLACK }}>{rank}</span>;
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
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: WHITE, margin: 0 }}>{title}</h2>
        {autoRefresh && (
          <span style={{ fontSize: '0.8rem', color: WHITE, opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
            Auto-refresh in {countdown}s <RefreshIcon />
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: WHITE }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 700, color: BLACK, width: '70px' }}>Rank</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>{nameHeader}</th>
              {type === 'teams' && (
                <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>Active Members</th>
              )}
              <th style={{ textAlign: 'right', padding: '10px 20px', fontSize: '0.875rem', fontWeight: 700, color: BLACK }}>Steps</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={type === 'teams' ? 4 : 3} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.875rem' }}>Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={type === 'teams' ? 4 : 3} style={{ textAlign: 'center', padding: '40px', color: '#ef4444', fontSize: '0.875rem' }}>{error}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={type === 'teams' ? 4 : 3} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.875rem' }}>No data available</td></tr>
            ) : (
              rows.map((entry, i) => (
                <tr
                  key={type === 'users' ? (entry as UserLeaderboardEntry).user_id : (entry as TeamLeaderboardEntry).team_name}
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <td style={{ padding: '10px 20px', width: '70px', verticalAlign: 'middle' }}>
                    <RankBadge rank={entry.rank} />
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '0.9rem', fontWeight: 500, color: BLACK, verticalAlign: 'middle' }}>
                    {type === 'users' ? (entry as UserLeaderboardEntry).full_name : (entry as TeamLeaderboardEntry).team_name}
                  </td>
                  {type === 'teams' && (
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 500, color: '#6b7280', verticalAlign: 'middle' }}>
                      {(entry as TeamLeaderboardEntry).active_members}
                    </td>
                  )}
                  <td style={{ padding: '10px 20px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600, color: BLACK, verticalAlign: 'middle' }}>
                    {formatNumber(entry.total_steps)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Full Leaderboard link */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '14px 20px', textAlign: 'center', backgroundColor: WHITE }}>
        <span style={{ color: PURPLE, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
          View Full Leaderboard
        </span>
      </div>
    </div>
  );
};

export default LeaderboardTable;

// Made with Bob
