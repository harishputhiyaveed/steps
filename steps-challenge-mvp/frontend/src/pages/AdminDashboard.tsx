import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { formatNumber } from '../utils/formatters';
import type { AdminUser, AdminStats, StepEntry } from '../types';
import charityWeekLogo from '../assets/Charity Week Logo.png';

const PURPLE = '#4B3B8C';
const BLACK = '#000000';
const WHITE = '#ffffff';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
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

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 16px',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: BLACK,
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '0.875rem',
  color: BLACK,
  borderBottom: '1px solid #f3f4f6',
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userEntries, setUserEntries] = useState<StepEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [showEntriesModal, setShowEntriesModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'steps' | 'team'>('steps');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterTeam, setFilterTeam] = useState<string>('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([adminAPI.getAllUsers(), adminAPI.getStats()]);
      setUsers(usersData);
      setStats(statsData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEntries = async (u: AdminUser) => {
    setSelectedUser(u);
    setShowEntriesModal(true);
    setEntriesLoading(true);
    try {
      const entries = await adminAPI.getUserSteps(u.id);
      setUserEntries(entries);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to load user entries');
    } finally {
      setEntriesLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await adminAPI.deleteStepEntry(entryId);
      if (selectedUser) setUserEntries(await adminAPI.getUserSteps(selectedUser.id));
      await fetchData();
      alert('Entry deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete entry');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their step entries.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      await fetchData();
      alert(`User "${userName}" deleted successfully`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const closeModal = () => {
    setShowEntriesModal(false);
    setSelectedUser(null);
    setUserEntries([]);
  };

  const filteredAndSortedUsers = users
    .filter(u => {
      const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTeam = filterTeam === 'all' || u.team_name === filterTeam;
      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.full_name.localeCompare(b.full_name);
      else if (sortBy === 'steps') comparison = a.total_steps - b.total_steps;
      else if (sortBy === 'team') comparison = a.team_name.localeCompare(b.team_name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (!user?.is_admin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>Access Denied</h1>
          <p style={{ fontSize: '0.875rem', color: BLACK }}>You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>

      {/* Header */}
      <header style={{ backgroundColor: WHITE, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={charityWeekLogo} alt="Charity Week 2026" style={{ height: '48px', width: 'auto' }} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: BLACK, margin: 0 }}>🔐 Admin Dashboard</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Welcome, {user?.full_name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#6b7280', color: WHITE, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              User Dashboard
            </button>
            <button onClick={logout} style={{ backgroundColor: '#ef4444', color: WHITE, padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: '0.875rem' }}>Loading admin data…</div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Users', value: stats.total_users },
                  { label: 'Total Steps', value: formatNumber(stats.total_steps) },
                  { label: 'Total Entries', value: stats.total_entries },
                  { label: 'Teams', value: stats.teams.length },
                ].map(({ label, value }) => (
                  <div key={label} style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', backgroundColor: PURPLE }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: WHITE, margin: 0 }}>{label}</p>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '1.75rem', fontWeight: 700, color: PURPLE, margin: 0 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', backgroundColor: PURPLE }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>Filters</h2>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Search</label>
                  <input type="text" placeholder="Search by name or email…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Filter by Team</label>
                  <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} style={inputStyle}>
                    <option value="all">All Teams</option>
                    {stats?.teams.map(team => <option key={team} value={team}>Team {team}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={inputStyle}>
                    <option value="steps">Total Steps</option>
                    <option value="name">Name</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Order</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} style={inputStyle}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', backgroundColor: PURPLE }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>
                  All Users ({filteredAndSortedUsers.length})
                </h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Team</th>
                      <th style={thStyle}>Total Steps</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={tdStyle}>{u.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{u.full_name}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{u.email}</td>
                        <td style={tdStyle}>{u.team_name}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: PURPLE }}>{formatNumber(u.total_steps)}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: u.is_admin ? '#ede9fe' : '#f3f4f6', color: u.is_admin ? PURPLE : '#374151' }}>
                            {u.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => handleViewEntries(u)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', marginRight: '10px' }}>View Entries</button>
                          {!u.is_admin && (
                            <button onClick={() => handleDeleteUser(u.id, u.full_name)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: WHITE, boxShadow: '0 -1px 4px rgba(0,0,0,0.06)', marginTop: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          © 2026 Charity Steps Challenge. Admin Panel
        </div>
      </footer>

      {/* Entries Modal */}
      {showEntriesModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.20)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', backgroundColor: PURPLE, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>
                Entries for {selectedUser.full_name} ({userEntries.length})
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: WHITE, fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {entriesLoading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.875rem' }}>Loading entries…</p>
              ) : userEntries.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '0.875rem' }}>No entries found</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Steps</th>
                      <th style={thStyle}>Logged At</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td style={tdStyle}>{new Date(entry.date).toLocaleDateString()}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: PURPLE }}>{formatNumber(entry.steps)}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{new Date(entry.created_at).toLocaleString()}</td>
                        <td style={tdStyle}>
                          <button onClick={() => handleDeleteEntry(entry.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
              <button onClick={closeModal} style={{ backgroundColor: '#6b7280', color: WHITE, padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

// Made with Bob
