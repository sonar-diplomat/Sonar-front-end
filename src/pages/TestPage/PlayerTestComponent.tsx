import React, { useState, useEffect } from 'react';
import { usePlayer } from '@shared/store/features/player';
import { usePlayTrack } from '@shared/lib/audio';
import { useGetTrackQuery } from '@shared/api/rtkApi';
import { MicroPlayer } from '@widgets/MicroPlayer';

export const PlayerTestComponent: React.FC = () => {
  const [trackId, setTrackId] = useState<string>('');
  const [testTrackId, setTestTrackId] = useState<number | null>(null);

  const playTrack = usePlayTrack();
  const { currentTrack, isPlaying, currentTime, duration } = usePlayer();

  const { data: track, isLoading, error, refetch } = useGetTrackQuery(testTrackId!, {
    skip: testTrackId === null,
  });

  // Log detailed track information when it loads
  useEffect(() => {
    if (track) {
      console.log('[PlayerTest] Track loaded:', {
        id: track.id,
        title: track.title,
        duration: track.duration,
      });
    }
  }, [track]);

  const handleTestTrack = () => {
    const id = parseInt(trackId, 10);
    if (!isNaN(id) && id > 0) {
      setTestTrackId(id);
    }
  };

  const handlePlay = () => {
    if (track) {
      console.log('[PlayerTest] Playing track:', track);
      playTrack(track);
    }
  };

  const handleRefetch = () => {
    if (testTrackId !== null) {
      refetch();
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div style={{
      padding: '24px',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
      borderRadius: '12px',
      margin: '20px 0',
      backgroundColor: 'var(--surface-color, rgba(0, 0, 0, 0.3))',
      color: 'var(--text-color, #ffffff)'
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        🎵 Audio Player Test
      </h2>

      {/* Track Input Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '12px'
        }}>
          1. Fetch Track
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestTrack()}
            placeholder="Enter track ID (e.g., 1)"
            style={{
              padding: '10px 12px',
              width: '200px',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
              borderRadius: '6px',
              backgroundColor: 'var(--input-bg, rgba(255, 255, 255, 0.05))',
              color: 'inherit',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleTestTrack}
            disabled={!trackId || isLoading}
            style={{
              padding: '10px 20px',
              cursor: trackId && !isLoading ? 'pointer' : 'not-allowed',
              backgroundColor: trackId && !isLoading ? '#0d6efd' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              opacity: trackId && !isLoading ? 1 : 0.6
            }}
          >
            {isLoading ? 'Loading...' : 'Fetch Track'}
          </button>
          {testTrackId !== null && (
            <button
              onClick={handleRefetch}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                cursor: !isLoading ? 'pointer' : 'not-allowed',
                backgroundColor: !isLoading ? '#6c757d' : '#495057',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                opacity: !isLoading ? 1 : 0.6
              }}
            >
              🔄 Refresh
            </button>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            color: '#ff6b6b'
          }}>
            <strong>❌ Error:</strong> {(error as any).message || 'Failed to fetch track'}
          </div>
        )}

        {track && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
            borderRadius: '8px',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '16px' }}>✅ Track Found</strong>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: '8px',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              <span style={{ opacity: 0.7 }}>ID:</span>
              <span>{track.id}</span>

              <span style={{ opacity: 0.7 }}>Title:</span>
              <span style={{ fontWeight: '500' }}>{track.title}</span>

              <span style={{ opacity: 0.7 }}>Duration:</span>
              <span>{track.duration || 'Unknown'}</span>

              <span style={{ opacity: 0.7 }}>Streaming Method:</span>
              <span style={{
                fontWeight: '500',
                color: '#0d6efd'
              }}>
                🌐 API Stream
              </span>
            </div>

            <button
              onClick={handlePlay}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '15px',
                width: '100%'
              }}
            >
              ▶️ Play This Track
            </button>
          </div>
        )}
      </div>

      {/* MicroPlayer Section */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '12px'
        }}>
          2. MicroPlayer
        </h3>
        {currentTrack ? (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
            borderRadius: '8px',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))'
          }}>
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Now Playing:</strong>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>
                Track ID: {currentTrack.id}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                opacity: 0.8
              }}>
                <span>Status: {isPlaying ? '▶️ Playing' : '⏸️ Paused'}</span>
                <span>Time: {formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>
            <MicroPlayer />
          </div>
        ) : (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
            borderRadius: '8px',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
            opacity: 0.6
          }}>
            No track loaded. Fetch and play a track to test the player.
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(13, 110, 253, 0.3)'
      }}>
        <h4 style={{
          marginTop: 0,
          marginBottom: '12px',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          📝 How to Use:
        </h4>
        <ol style={{
          marginLeft: '20px',
          marginBottom: '16px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <li>Enter a valid track ID from your database</li>
          <li>Click "Fetch Track" to load track metadata</li>
          <li>Review the track information (streaming method, audio files, etc.)</li>
          <li>Click "Play This Track" to start playback</li>
          <li>Use the MicroPlayer controls to play/pause/seek</li>
          <li>Check browser console (F12) for detailed streaming logs</li>
        </ol>

        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(13, 110, 253, 0.3)',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          <strong>💡 Streaming:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
            <li>All tracks are streamed from <code>api/Track/{'{trackId}'}/stream</code></li>
            <li>Requires Bearer token authentication (automatic)</li>
            <li>Audio is fetched as blob and cached for playback</li>
          </ul>
        </div>

        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          <strong>⚠️ Troubleshooting:</strong>
          <ul style={{ marginLeft: '20px', marginTop: '8px', marginBottom: 0 }}>
            <li>Ensure you're logged in (authentication required)</li>
            <li>Check Network tab in DevTools for streaming API errors</li>
            <li>Verify track exists in database</li>
            <li>Check that audio file is accessible on server</li>
            <li>Look for <code>[AudioPlayer]</code> logs in console</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

