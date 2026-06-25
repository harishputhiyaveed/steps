import React, { useState } from 'react';
import { stepsAPI } from '../../services/api';
import { getTodayDate } from '../../utils/formatters';

interface StepEntryFormProps {
  onSuccess?: () => void;
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

const StepEntryForm: React.FC<StepEntryFormProps> = ({ onSuccess }) => {
  const [date, setDate] = useState(getTodayDate());
  const [steps, setSteps] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const stepsNumber = parseInt(steps, 10);
    if (isNaN(stepsNumber) || stepsNumber <= 0) {
      setError('Please enter a valid number of steps');
      return;
    }

    setLoading(true);
    try {
      await stepsAPI.createEntry({ date, steps: stepsNumber });
      setSuccess('Steps added successfully!');
      setSteps('');
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add steps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', backgroundColor: PURPLE }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: WHITE, margin: 0 }}>Add Steps</h2>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', padding: '12px 16px', borderRadius: '12px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <div>
          <label htmlFor="step-date" style={labelStyle}>Date</label>
          <input id="step-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required max={getTodayDate()} style={inputStyle} />
        </div>

        <div>
          <label htmlFor="step-count" style={labelStyle}>Number of Steps</label>
          <input id="step-count" type="number" value={steps} onChange={(e) => setSteps(e.target.value)} required min="1" placeholder="e.g. 10000" style={inputStyle} />
        </div>

        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', backgroundColor: PURPLE, color: WHITE, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Adding…' : 'Add Steps'}
        </button>
      </div>
    </div>
  );
};

export default StepEntryForm;

// Made with Bob
