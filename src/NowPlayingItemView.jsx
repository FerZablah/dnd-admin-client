import React from 'react';
import './NowPlayingItem.css'; // reuse your existing styles

/**
 * Pure presentational component for a "now playing" row.
 * No audio logic, no sockets – just UI + callbacks.
 */
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function NowPlayingItemView({
  // data / labels
  title,
  outputKey,          // "speakers" | "preview" | "radio"
  availableRoles = ['speakers', 'preview', 'radio'],

  // playback state
  isPlaying,
  isLooping,
  currentTime,
  duration,
  volume,             // 0–1

  // callbacks
  onPlayPause,
  onLoopToggle,
  onSeek,
  onVolumeChange,
  onRoleChange,
  onStop,
}) {
  const handleSeekClick = (event) => {
    if (!onSeek || !event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const newPos = Math.max(0, Math.min(1, ratio)) * (duration || 0);
    onSeek(newPos);
  };

  const handleVolumeInput = (event) => {
    if (!onVolumeChange) return;
    const v = parseFloat(event.target.value);
    if (!Number.isNaN(v)) onVolumeChange(v);
  };

  const handleRoleSelect = (event) => {
    if (!onRoleChange) return;
    const newKey = event.target.value;
    onRoleChange(newKey);
  };

  return (
    <article className="now-playing-item">
      <header className="now-playing-item__header">
        <div>
          <h3 className="now-playing-item__title">{title}</h3>
          <p className="now-playing-item__meta">
            Output:&nbsp;
            <select value={outputKey} onChange={handleRoleSelect}>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </p>
        </div>

        <button
          type="button"
          className="now-playing-item__stop-btn"
          onClick={onStop}
        >
          ✕
        </button>
      </header>

      <div className="now-playing-item__controls-row">
        <button
          type="button"
          className="now-playing-item__play-btn"
          onClick={onPlayPause}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          type="button"
          className={
            isLooping
              ? 'now-playing-item__loop-btn now-playing-item__loop-btn--active'
              : 'now-playing-item__loop-btn'
          }
          onClick={onLoopToggle}
        >
          Loop
        </button>

        <div
          className="now-playing-item__timeline"
          onClick={handleSeekClick}
        >
          <div
            className="now-playing-item__timeline-fill"
            style={{
              width:
                duration && duration > 0
                  ? `${(currentTime / duration) * 100}%`
                  : '0%',
            }}
          />
        </div>

        <div className="now-playing-item__time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="now-playing-item__volume-row">
        <label className="now-playing-item__volume-label">
          Volume
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeInput}
          />
        </label>
      </div>
    </article>
  );
}
