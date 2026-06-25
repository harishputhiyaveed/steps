import React, { useState, useEffect } from 'react';
import { stepsAPI } from '../../services/api';
import { formatNumber } from '../../utils/formatters';
import type { StepEntry, StepEntryCreate } from '../../types';

interface MyEntriesProps {
  refreshTrigger?: number;
}

const PURPLE = '#4B3B8C';
const BLACK = '#000000';
const WHITE = '#ffffff';

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: BLACK,
  outline: 'none',
};

const MyEntries: React.FC<MyEntriesProps> = ({ refreshTrigger = 0 }) => {
  const [entries, setEntries] = useState<StepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEntry, setEditingEntry] = useState<StepEntry | null>(null);
  const [editFormData, setEditFormData] = useState<StepEntryCreate>({ date: '', steps: 0 });

  useEffect(() => { fetchEntries(); }, [refreshTrigger]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await stepsAPI.getMySteps();
      setEntries(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: StepEntry) => {
    setEditingEntry(entry);
    setEditFormData({ date: entry.date, steps: entry.steps });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditFormData({ date: '', steps: 0 });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    try {
      await stepsAPI.updateEntry(editingEntry.id, editFormData);
      await fetchEntries();
      setEditingEntry(null);
      setEditFormData({ date: '', steps: 0 });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update entry');
    }
  };

  const handleDelete = async (entryId: number, date: string) => {
    if (!confirm(`Are you sure you want to delete the entry for ${new Date(date).toLocaleDateString()}?`)) return;
    try {
      await stepsAPI.deleteEntry(entryId);
      await fetchEntries();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete entry');
    }
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

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', backgroundColor: PURPLE }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>
          My Step Entries {!loading && `(${entries.length})`}
        </h2>
      </div>

      {/* Body */}
      <div style={{ padding: '0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', padding: '40px' }}>Loading entries…</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.875rem', padding: '40px' }}>{error}</p>
        ) : entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', padding: '40px' }}>No entries yet. Start logging your steps above!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    {editingEntry?.id === entry.id ? (
                      <>
                        <td style={tdStyle}>
                          <input type="date" value={editFormData.date} onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })} style={inputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <input type="number" value={editFormData.steps} onChange={(e) => setEditFormData({ ...editFormData, steps: parseInt(e.target.value) || 0 })} min="0" style={{ ...inputStyle, width: '90px' }} />
                        </td>
                        <td style={tdStyle}>{new Date(entry.created_at).toLocaleString()}</td>
                        <td style={tdStyle}>
                          <button onClick={handleSaveEdit} style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', marginRight: '10px' }}>Save</button>
                          <button onClick={handleCancelEdit} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={tdStyle}>{new Date(entry.date).toLocaleDateString()}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: PURPLE }}>{formatNumber(entry.steps)}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{new Date(entry.created_at).toLocaleString()}</td>
                        <td style={tdStyle}>
                          <button onClick={() => handleEdit(entry)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', marginRight: '10px' }}>Edit</button>
                          <button onClick={() => handleDelete(entry.id, entry.date)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEntries;

// Made with Bob
