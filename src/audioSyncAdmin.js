// src/audioSyncAdmin.js
import { socket } from './socket';

/**
 * Tell clients which file this audio slot should use.
 * audioId: string  (e.g. "music-main", "sfx-rain")
 * trackId: string  (e.g. "battle_theme.mp3")
 */
export function selectTrackForClients(audioId, trackId) {
  if (!audioId || !trackId) return;
  socket.emit('admin:audio:select', { audioId, trackId });
}

/**
 * Start playing this audio at given position (seconds).
 */
export function playForClients(audioId, positionSeconds) {
  if (!audioId || typeof positionSeconds !== 'number') return;
  socket.emit('admin:audio:play', { audioId, position: positionSeconds });
}

/**
 * Pause this audio at given position.
 */
export function pauseForClients(audioId, positionSeconds) {
  if (!audioId || typeof positionSeconds !== 'number') return;
  socket.emit('admin:audio:pause', { audioId, position: positionSeconds });
}

/**
 * Seek this audio to a new position (seconds).
 */
export function seekForClients(audioId, positionSeconds) {
  if (!audioId || typeof positionSeconds !== 'number') return;
  socket.emit('admin:audio:seek', { audioId, position: positionSeconds });
}

/**
 * Stop this audio (clients should pause and reset to 0).
 */
export function stopForClients(audioId) {
  if (!audioId) return;
  socket.emit('admin:audio:stop', { audioId });
}

/**
 * Set loop flag for this audio.
 * loop: boolean
 */
export function setLoopForClients(audioId, loop) {
  if (!audioId) return;
  socket.emit('admin:audio:setLoop', { audioId, loop: !!loop });
}
