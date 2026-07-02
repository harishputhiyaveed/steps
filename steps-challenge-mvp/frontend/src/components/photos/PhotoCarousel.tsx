import React, { useEffect, useState, useRef } from 'react';
import { photoAPI } from '../../services/api';
import type { PhotoEntry } from '../../types';

const PURPLE = '#4B3B8C';
const WHITE = '#ffffff';
const BLACK = '#000000';
const INTERVAL = 30000;

interface PhotoCarouselProps {
  currentUserId?: number;
  isAdmin?: boolean;
  onDelete?: () => void;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ currentUserId, isAdmin, onDelete }) => {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPhotos = async () => {
    try {
      const data = await photoAPI.getPhotos();
      setPhotos(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  useEffect(() => {
    if (photos.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % photos.length);
    }, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [photos]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % photos.length);
    }, INTERVAL);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this photo?')) return;
    setDeleting(true);
    try {
      await photoAPI.deletePhoto(photos[current].id);
      const updated = photos.filter((_, i) => i !== current);
      setPhotos(updated);
      setCurrent(prev => Math.min(prev, updated.length - 1));
      if (onDelete) onDelete();
    } catch {
      alert('Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return null;
  if (photos.length === 0) return null;

  const photo = photos[current];
  const canDelete = isAdmin || currentUserId === photo.user_id;

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'hidden', width: '100%' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', backgroundColor: PURPLE, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: WHITE, margin: 0 }}>📸 Photo Wall</h2>
        <span style={{ fontSize: '0.8rem', color: WHITE, opacity: 0.85 }}>{current + 1} / {photos.length}</span>
      </div>

      {/* Image */}
      <div style={{ position: 'relative', backgroundColor: '#000', textAlign: 'center' }}>
        <img
          key={photo.id}
          src={photo.image_url}
          alt={photo.caption || 'Photo wall image'}
          style={{ width: '100%', maxHeight: '340px', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* Caption + uploader + delete */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {photo.caption && (
            <p style={{ fontSize: '0.95rem', color: BLACK, margin: '0 0 6px', fontStyle: 'italic' }}>"{photo.caption}"</p>
          )}
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
            Uploaded by <strong style={{ color: PURPLE }}>{photo.full_name}</strong>
          </p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1, whiteSpace: 'nowrap', marginLeft: '12px' }}
          >
            {deleting ? 'Deleting…' : '🗑 Delete'}
          </button>
        )}
      </div>

      {/* Dot navigation */}
      {photos.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px 20px 16px' }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? '20px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: i === current ? PURPLE : '#d1d5db',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoCarousel;

// Made with Bob
