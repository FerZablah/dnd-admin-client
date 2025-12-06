import React, { useEffect, useState, useRef } from 'react';
import NowPlayingItemView from './NowPlayingItemView';
import {
  selectTrackForClients,
  playForClients,
  pauseForClients,
  seekForClients,
  stopForClients,
  setLoopForClients,
} from './audioSyncAdmin';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Radio controller:
 * - No *audible* local playback
 * - Hidden <audio> only to read duration from metadata
 * - All actions (play/pause/seek/loop/stop) go to the server via Socket.IO
 * - Uses the same visual UI as speakers/preview through NowPlayingItemView
 */
export default function NowPlayingRadioItem({ item, onStop, onChangeOutputKey }) {
  const audioId = item.id;

  // What the backend/client use as trackId
  const trackId =
    item.track?.fileName ||
    item.track?.filename ||
    item.track?.id ||
    item.track?.path ||
    item.track?.key;

  // Local "mirror" of the state we send to clients
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(item.resumeAt || 0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // visual only (clients control their own volume)
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const title =
    item.track?.alias ||
    item.track?.name ||
    item.track?.title ||
    'Untitled';

  // Hidden audio to read duration from metadata
  const metaAudioRef = useRef(null);

  // When mounted or track changes, bind this channel to that track on the server
  useEffect(() => {
    if (audioId && trackId) {
      selectTrackForClients(audioId, trackId);
    }
  }, [audioId, trackId]);

    useEffect(() => {
    if (!isPlaying) return;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const stepSeconds = 0.5; // how much to advance each tick
    const intervalId = setInterval(() => {
      setCurrentTime((prev) => {
        let next = prev + stepSeconds;

        // Clamp to duration / loop if needed
        if (next > duration) {
          return isLooping ? 0 : duration;
        }
        return next;
      });
    }, stepSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, duration, isLooping]);

  // Load metadata in a hidden <audio> so we know the real duration
  useEffect(() => {
    const el = metaAudioRef.current;
    if (!el || !trackId) return;

    const src = `${BACKEND_URL}/media/audio/${trackId}`;
    if (el.src !== src) {
      el.src = src;
    }

    const handleLoadedMetadata = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDuration(el.duration);
        // Optional debug:
        console.log('[RADIO] loaded metadata duration =', el.duration);
      }
    };

    el.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [trackId]);

  const handlePlayPause = () => {
    if (!audioId) return;

    if (isPlaying) {
      console.log('[RADIO] pause at', currentTime);
      pauseForClients(audioId, currentTime);
      setIsPlaying(false);
    } else {
      console.log('[RADIO] play from', currentTime);
      playForClients(audioId, currentTime);
      setIsPlaying(true);
    }
  };

  const handleLoopToggle = () => {
    if (!audioId) return;
    const next = !isLooping;
    setIsLooping(next);
    setLoopForClients(audioId, next);
  };

  const handleSeek = (newPos) => {
    if (!audioId) return;
    console.log(
      '[RADIO] handleSeek',
      'audioId =', audioId,
      'newPos =', newPos,
      'duration =', duration,
    );
    setCurrentTime(newPos);
    seekForClients(audioId, newPos);
  };

    useEffect(() => {
    if (!audioId || !trackId) return;
    if (hasAutoStarted) return;

    setHasAutoStarted(true);
    setIsPlaying(true);
    playForClients(audioId, currentTime);
  }, [audioId, trackId, currentTime, hasAutoStarted]);

  const handleVolumeChange = (v) => {
    // purely for admin UI feedback – does NOT change client volume
    setVolume(v);
  };

  const handleRoleChange = (newKey) => {
    if (!onChangeOutputKey) return;
    if (newKey === item.outputKey) return;

    // Pass currentTime so the new controller can resume from here
    onChangeOutputKey(newKey, currentTime);
  };

  const handleStopClick = () => {
    if (audioId) {
      stopForClients(audioId);
    }
    if (onStop) onStop();
  };

  return (
    <>
      {/* Hidden audio element: only used to read duration via metadata */}
      <audio
        ref={metaAudioRef}
        style={{ display: 'none' }}
        // no autoPlay, no explicit play() calls – just metadata
      />
      <NowPlayingItemView
        title={title}
        outputKey={item.outputKey}
        availableRoles={['speakers', 'preview', 'radio']}
        isPlaying={isPlaying}
        isLooping={isLooping}
        currentTime={currentTime}
        duration={duration}          
        onPlayPause={handlePlayPause}
        onLoopToggle={handleLoopToggle}
        onSeek={handleSeek}          
        onVolumeChange={handleVolumeChange}
        onRoleChange={handleRoleChange}
        onStop={handleStopClick}
      />
    </>
  );
}
