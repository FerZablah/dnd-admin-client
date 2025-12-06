import React, { useEffect, useRef, useState } from 'react';
import NowPlayingItemView from './NowPlayingItemView';
import './NowPlayingItem.css';

function NowPlayingItem({ item, outputDevice, onStop, onChangeOutputKey }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(item.resumeAt || 0);
  const [duration, setDuration] = useState(item.track?.durationSec || 0);
  const [volume, setVolume] = useState(1);

  // ----- Helpers to read track info -----

  const title =
    item.track?.alias ||
    item.track?.name ||
    item.track?.title ||
    'Untitled';

  const trackSrc = `http://localhost:3000/media/audio/${item.track.fileName}`;

  // ----- Sink (output device) -----
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Try several possible shapes:
    // - { deviceId: '...' }  (what I assumed)
    // - { id: '...' }        (what enumerateDevices() uses)
    // - '...'                (plain sinkId string)
    const sinkId =
      (outputDevice && outputDevice.deviceId) ||
      (outputDevice && outputDevice.id) ||
      (typeof outputDevice === 'string' ? outputDevice : null);

    if (!sinkId) {
      console.debug('[NowPlayingItem] no sinkId for outputDevice:', outputDevice);
      return;
    }

    if (typeof audio.setSinkId !== 'function') {
      console.debug('[NowPlayingItem] setSinkId not supported in this browser');
      return;
    }

    audio
      .setSinkId(sinkId)
      .then(() => {
        console.debug('[NowPlayingItem] setSinkId OK:', sinkId);
      })
      .catch((err) => {
        console.error('[NowPlayingItem] setSinkId failed:', err);
      });
  }, [outputDevice]);

  // ----- Attach audio event listeners -----
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      // resume from item.resumeAt if set:
      if (item.resumeAt && item.resumeAt > 0) {
        audio.currentTime = item.resumeAt;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [item.resumeAt]);

  // ----- React to isPlaying -----
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio
        .play()
        .catch((err) => {
          console.warn('Admin local play() failed:', err);
        });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // ----- React to volume & loop -----
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = isLooping;
  }, [isLooping]);

  // ----- UI callbacks passed down to View -----

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleLoopToggle = () => {
    setIsLooping((prev) => !prev);
  };

  const handleSeek = (newPos) => {
    const audio = audioRef.current;
    setCurrentTime(newPos);
    if (audio) {
      audio.currentTime = newPos;
      // keep playing if already playing
      if (isPlaying) {
        audio
          .play()
          .catch((err) =>
            console.warn('play() after seek failed (admin):', err),
          );
      }
    }
  };

  const handleVolumeChange = (v) => {
    setVolume(v);
  };

  const handleRoleChange = (newKey) => {
    if (!onChangeOutputKey) return;
    if (newKey === item.outputKey) return;
    // pass current position so SoundControlPanel can store resumeAt
    onChangeOutputKey(newKey, currentTime);
  };

  const handleStopClick = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (onStop) onStop();
  };

  return (
    <>
      {/* Hidden local audio element for this item */}
      <audio
        ref={audioRef}
        src={trackSrc}
        style={{ display: 'none' }}
      // autoplay is handled by isPlaying effect
      />
      <NowPlayingItemView
        title={title}
        outputKey={item.outputKey}
        availableRoles={['speakers', 'preview', 'radio']}
        isPlaying={isPlaying}
        isLooping={isLooping}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
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

export default NowPlayingItem;
