import React, { useState } from 'react';
import { photoAPI } from '../../services/api';

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

interface PhotoUploadProps {
  onSuccess: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const ALLOWED = ['image/jpeg', 'image/png', 'image/tiff'];
  const MIN = 10 * 1024;
  const MAX = 1 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    setSuccess(false);
    if (!ALLOWED.includes(f.type)) { setError('Only JPEG, PNG and TIFF images are allowed'); return; }
    if (f.size < MIN) { setError('Image must be larger than 10 KB'); return; }
    if (f.size > MAX) { setError('Image must be smaller than 1 MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select an image'); return; }
    setLoading(true);
    setError('');
    try {
      await photoAPI.uploadPhoto(file, caption);
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setCaption('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', backgroundColor: PURPLE }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: WHITE, margin: 0 }}>📸 Add to Photo Wall</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.875rem' }}>
              Photo uploaded successfully!
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: BLACK, marginBottom: '6px' }}>
              Photo <span style={{ fontWeight: 400, color: '#6b7280' }}>(JPEG, PNG or TIFF · 10 KB – 1 MB)</span>
            </label>
            <input type="file" accept=".jpg,.jpeg,.png,.tif,.tiff" onChange={handleFileChange} style={inputStyle} />
          </div>

          {preview && (
            <div style={{ textAlign: 'center' }}>
              <img src={preview} alt="Preview" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '10px', objectFit: 'contain', border: '1px solid #e5e7eb' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: BLACK, marginBottom: '6px' }}>
              Caption <span style={{ fontWeight: 400, color: '#6b7280' }}>(optional)</span>
            </label>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} style={inputStyle} placeholder="Add a caption…" />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            style={{ width: '100%', padding: '11px', borderRadius: '10px', backgroundColor: PURPLE, color: WHITE, fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: loading || !file ? 'not-allowed' : 'pointer', opacity: loading || !file ? 0.6 : 1 }}
          >
            {loading ? 'Uploading…' : 'Upload Photo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhotoUpload;

// Made with Bob
