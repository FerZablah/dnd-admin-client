// src/components/NowPlayingItem.jsx
import React, { useEffect, useRef, useState } from "react";
import "./NowPlayingItem.css";

function formatTime(seconds) {
  if (!isFinite(seconds)) return "--:--";
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const OUTPUT_ROLES = [
  { key: "speakers", label: "Speakers" },
  { key: "preview", label: "Preview" },
  { key: "radio", label: "Radio" },
];

function NowPlayingItem({
  item,
  outputDevice,
  onStop,
  onChangeOutputKey,
  initialPosition = 0, // resume position from parent
}) {
  const audioRef = useRef(null);
  const progressRailRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.track.durationSec || 0);
  const [hasEnded, setHasEnded] = useState(false);
  const [volume, setVolume] = useState(1);

  // Main setup: sink, volume, listeners, initial seek, play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setHasEnded(true);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    const setup = async () => {
      // route to correct device (role -> device resolved in parent)
      if (
        outputDevice &&
        outputDevice.id &&
        outputDevice.id !== "default" &&
        typeof audio.setSinkId === "function"
      ) {
        try {
          await audio.setSinkId(outputDevice.id);
        } catch (err) {
          console.warn("[NowPlayingItem] setSinkId failed", err);
        }
      }

      // initial volume
      audio.volume = volume;

      // seek to resume position (if any)
      if (initialPosition && Number.isFinite(initialPosition)) {
        try {
          audio.currentTime = initialPosition;
        } catch (err) {
          console.warn("Failed to seek to initialPosition", err);
        }
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Autoplay failed, user interaction may be required", err);
        setIsPlaying(!audio.paused);
      }
    };

    setup();

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [item.id, outputDevice?.id, initialPosition]);

  // Keep DOM volume in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  // Auto-remove 5 minutes after natural end
  useEffect(() => {
    if (!hasEnded) return;
    const timeoutId = setTimeout(() => {
      onStop();
    }, 5 * 60 * 1000);
    return () => clearTimeout(timeoutId);
  }, [hasEnded, onStop]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasEnded(false);
        })
        .catch((err) =>
          console.warn("Play failed, maybe blocked by browser", err)
        );
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newLoop = !isLooping;
    audio.loop = newLoop;
    setIsLooping(newLoop);
  };

  const handleSeek = (event) => {
    const rail = progressRailRef.current;
    const audio = audioRef.current;
    if (!rail || !audio || !duration) return;

    const rect = rail.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const clampedRatio = Math.min(1, Math.max(0, ratio));
    const newTime = clampedRatio * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value); // 0–100
    setVolume(Math.min(1, Math.max(0, v / 100)));
  };

  // When role changes, send currentTime up so parent can store resumeAt
  const handleRoleChange = (e) => {
    const newKey = e.target.value;
    if (newKey === item.outputKey) return;

    const audio = audioRef.current;
    const pos = audio ? audio.currentTime : 0;

    if (typeof onChangeOutputKey === "function") {
      onChangeOutputKey(newKey, pos);
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="now-playing-item">
      <audio
        ref={audioRef}
        src={`http://localhost:3000/media/audio/${item.track.fileName}`}
        preload="metadata"
      />

      <div className="np-main">
        <div className="np-title-row">
          <div className="np-title">{item.track.alias}</div>

          <div className="np-role-wrapper">
            <select
              className="np-role-select"
              value={item.outputKey}
              onChange={handleRoleChange}
            >
              {OUTPUT_ROLES.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="np-progress-rail"
          ref={progressRailRef}
          onClick={handleSeek}
        >
          <div
            className="np-progress-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="np-meta-row">
          <span className="np-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="np-volume">
            <span className="np-volume-icon">🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(volume * 100)}
              onChange={handleVolumeChange}
              className="np-volume-input"
            />
          </div>

          <div className="np-controls">
            <button
              type="button"
              className={"np-control-button" + (isLooping ? " active" : "")}
              onClick={toggleLoop}
              title="Loop"
            >
              ⟳
            </button>

            <button
              type="button"
              className="np-control-button"
              onClick={togglePlayPause}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              type="button"
              className="np-control-button danger"
              onClick={onStop}
              title="Stop and remove"
            >
              ⏹
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NowPlayingItem;
