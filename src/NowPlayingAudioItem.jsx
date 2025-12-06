// src/NowPlayingRadioItem.jsx
import React, { useEffect, useState } from 'react';
import NowPlayingItemView from './NowPlayingItemView';
import {
  selectTrackForClients,
  playForClients,
  pauseForClients,
  seekForClients,
  stopForClients,
  setLoopForClients,
} from './audioSyncAdmin';

export default function NowPlayingRadioItem({
  item,
  onStop,
  onChangeOutputKey,
}) {
  // use the item id as the channel id, or change if you prefer fixed ids
  const audioId = item.id;
  const trackId = item.track?.id || item.track?.fileName || item.track?.path;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(item.resumeAt || 0);
  const [duration] = useState(item.track?.durationSec || 0);
  const [volume, setVolume] = useState(1); // purely visual on admin side

  // Bind this channel to this track when it mounts or when track changes
  useEffect(() => {
    if (audioId && trackId) {
      selectTrackForClients(audioId, trackId);
    }
  }, [audioId, trackId]);

  const handlePlayPause = () => {
    if (!audioId) return;

    if (isPlaying) {
      pauseForClients(audioId, currentTime);
      setIsPlaying(false);
    } else {
      playForClients(audioId, currentTime);
      setIsPlaying(true);
    }
  };

  const handleLoopToggle = () => {
    if (!audioId) return;
    const newLoop = !isLooping;
    setIsLooping(newLoop);
    setLoopForClients(audioId, newLoop);
  };

  const handleSeek = (newPos) => {
    if (!audioId) return;
    setCurrentTime(newPos);
    seekForClients(audioId, newPos);
  };

  const handleVolumeChange = (v) => {
    // clients handle their own volume; this is just for local UI feel
    setVolume(v);
  };

  const handleRoleChange = (newKey) => {
    if (!onChangeOutputKey) return;
    if (newKey === item.outputKey) return;
    // pass currentTime so when you swap away from radio,
    // the new local controller can resume from here
    onChangeOutputKey(newKey, currentTime);
  };

  const handleStopClick = () => {
    if (audioId) {
      stopForClients(audioId);
    }
    if (onStop) onStop();
  };

  const title =
    item.track?.alias ||
    item.track?.name ||
    item.track?.title ||
    'Untitled';

  return (
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
  );
}
