// src/components/YoutubeInputsModal.jsx
import React, { useEffect, useRef, useState } from "react";
import "./YoutubeInputsModal.css";
import {
  downloadChaptersMp3,
  downloadVideoMp3,
  fetchYoutubeChapters,
} from "./youtubeApi";
import { fetchCategories } from "./categoryApi";
import { fetchProjects } from "./projectApi";
import { toast } from "react-toastify";

function extractYoutubeId(value) {
  if (!value) return "";
  const trimmed = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1);
    }
    const v = url.searchParams.get("v");
    if (v) return v;
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/embed/")[1].split(/[/?]/)[0];
    }
  } catch (err) {
    // not a valid URL
  }

  return "";
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "--:--";
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// --- Backend helpers ---

async function fetchChaptersForVideo(id) {
  try {
    const result = await fetchYoutubeChapters(id);
    return result.chapters;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Download full video (optionally with alias/category/project)
async function downloadFullVideo(videoId, options) {
  return downloadVideoMp3({
    videoId: videoId.trim(),
    alias: options.alias,
    categoryId: options.categoryId,
    projectId: options.projectId,
  });
}

// Download only selected chapters (with aliases/category/project)
async function downloadChaptersForVideo(videoId, payload) {
  return downloadChaptersMp3({
    videoId: videoId.trim(),
    chapters: payload.chapters.map((ch) => {
      let alias = "";
      if(ch.alias && ch.alias !== ""){
        alias = ch.alias;
      }
      else{
        alias = ch.title;
      }
      return(
        {
          ...ch,
          start: Number(ch.start),
          end: Number(ch.end),
          alias: alias.trim(),
        }
      )
    }),
    categoryId: payload.categoryId || null,
    projectId: payload.projectId || null,
  });
}

function YoutubeInputsModal({ isOpen, onClose }) {
  const [url, setUrl] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  // selection + alias state
  const [selectedChapters, setSelectedChapters] = useState({});
  const [chapterAliases, setChapterAliases] = useState({});
  const [fullVideoAlias, setFullVideoAlias] = useState("");

  // Category + project (from backend)
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState("");

  const id = extractYoutubeId(url);

  // YouTube player stuff
  const [ytApiReady, setYtApiReady] = useState(false);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Helper to reset modal state
  const resetModalState = () => {
    setUrl("");
    setChapters([]);
    setChaptersLoading(false);
    setSelectedChapters({});
    setChapterAliases({});
    setFullVideoAlias("");
    setSelectedCategoryId("");
    setSelectedProjectId("");
    setMetaError("");
  };

  // Load categories & projects when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setMetaLoading(true);
    setMetaError("");

    (async () => {
      try {
        const [cats, projs] = await Promise.all([
          fetchCategories(), // [{ id, name }, ...]
          fetchProjects(),   // [{ id, name }, ...]
        ]);

        if (cancelled) return;

        setCategories(cats || []);
        setProjects(projs || []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setMetaError("Failed to load categories/projects.");
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Load the YouTube IFrame API script
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setYtApiReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      setYtApiReady(true);
    };
  }, [isOpen]);

  // Create / update the YT player when API + video id are ready
  useEffect(() => {
    if (!isOpen) return;
    if (!ytApiReady) return;
    if (!id) return;
    if (!playerContainerRef.current) return;

    const YT = window.YT;
    if (!YT || !YT.Player) return;

    if (!playerRef.current) {
      playerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: id,
        playerVars: {
          modestbranding: 1,
          rel: 0,
        },
      });
    } else {
      playerRef.current.loadVideoById(id);
    }
  }, [id, ytApiReady, isOpen]);

  // Destroy player when modal closes
  useEffect(() => {
    if (isOpen) return;
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, [isOpen]);

  // Fetch chapters whenever we have a valid video id
  useEffect(() => {
    if (!isOpen) return;
    if (!id) {
      setChapters([]);
      setSelectedChapters({});
      setChapterAliases({});
      return;
    }

    let cancelled = false;
    setChaptersLoading(true);

    fetchChaptersForVideo(id)
      .then((chs) => {
        if (cancelled) return;
        setChapters(chs || []);
        const sel = {};
        const aliases = {};
        (chs || []).forEach((c) => {
          sel[c.id] = false;
          aliases[c.id] = "";
        });
        setSelectedChapters(sel);
        setChapterAliases(aliases);
      })
      .finally(() => {
        if (!cancelled) setChaptersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isOpen]);

  const handleCheckboxToggle = (chapterId) => {
    setSelectedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleAliasChange = (chapterId, value) => {
    setChapterAliases((prev) => ({
      ...prev,
      [chapterId]: value,
    }));
  };

  const handlePlayChapter = (startSeconds) => {
    const player = playerRef.current;
    if (!player || typeof player.seekTo !== "function") return;

    player.seekTo(startSeconds, true);
    if (typeof player.playVideo === "function") {
      player.playVideo();
    }
  };

  const selectedCount = Object.values(selectedChapters).filter(Boolean).length;

  const handleDownloadClick = async () => {
    if (!id) return;

    if (!selectedCategoryId) {
      toast.error("Please select a category before downloading.");
      return;
    }

    const categoryId = selectedCategoryId
      ? Number.isNaN(Number(selectedCategoryId))
        ? selectedCategoryId
        : Number(selectedCategoryId)
      : null;
    const projectId = selectedProjectId
      ? Number.isNaN(Number(selectedProjectId))
        ? selectedProjectId
        : Number(selectedProjectId)
      : null;

    try {
      if (selectedCount > 0) {
        const selected = chapters
          .filter((ch) => selectedChapters[ch.id])
          .map((ch) => ({
            ...ch,
            alias: chapterAliases[ch.id] || "",
          }));

        await downloadChaptersForVideo(id, {
          chapters: selected,
          categoryId,
          projectId,
        });
      } else {
        await downloadFullVideo(id, {
          alias: fullVideoAlias || "",
          categoryId,
          projectId,
        });
      }

      toast.success("Download complete.");
      resetModalState();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Download failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="yt-modal-backdrop" onClick={onClose}>
      <div className="yt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="yt-modal-header">
          <h3>Inputs (YouTube)</h3>
          <button
            type="button"
            className="yt-modal-close"
            onClick={() => {
              resetModalState();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <div className="yt-modal-body">
          <div className="yt-modal-form">
            <label className="yt-modal-label">YouTube video URL</label>
            <input
              type="text"
              className="yt-modal-input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="yt-modal-help">
              Paste any YouTube URL or video ID. A preview will appear below.
            </div>
          </div>

          <div className="yt-modal-preview">
            {id ? (
              <div className="yt-modal-player-wrapper">
                <div ref={playerContainerRef} />
              </div>
            ) : (
              <div className="yt-modal-placeholder">
                Paste a YouTube URL to see a preview.
              </div>
            )}
          </div>

          <div className="yt-chapters-section">
            {/* Category / Project row */}
            <div className="yt-meta-row">
              <div className="yt-meta-field">
                <label className="yt-meta-label">Category</label>
                <select
                  className="yt-meta-select"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={metaLoading || categories.length === 0}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="yt-meta-field">
                <label className="yt-meta-label">
                  Project (optional)
                </label>
                <select
                  className="yt-meta-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={metaLoading || projects.length === 0}
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {metaError && (
              <div className="yt-meta-error">
                {metaError}
              </div>
            )}

            <div className="yt-chapters-header">
              <span>Chapters</span>
              {chaptersLoading && (
                <span className="yt-chapters-loading">Loading…</span>
              )}
            </div>

            {id && chapters.length === 0 && !chaptersLoading && (
              <div className="yt-chapters-empty">
                No chapters found. Download button will grab the full video.
              </div>
            )}

            {!id && (
              <div className="yt-chapters-empty">
                Enter a video URL to load chapters.
              </div>
            )}

            {chapters.length > 0 && (
              <div className="yt-chapters-list">
                {chapters.map((ch) => (
                  <div key={ch.id} className="yt-chapter-row">
                    <label className="yt-chapter-left">
                      <input
                        type="checkbox"
                        checked={!!selectedChapters[ch.id]}
                        onChange={() => handleCheckboxToggle(ch.id)}
                      />
                      <span className="yt-chapter-title">
                        {ch.title}
                      </span>
                    </label>

                    <input
                      type="text"
                      className="yt-chapter-alias-input"
                      placeholder="Alias (optional)"
                      value={chapterAliases[ch.id] || ""}
                      onChange={(e) =>
                        handleAliasChange(ch.id, e.target.value)
                      }
                    />

                    <div className="yt-chapter-right">
                      <span className="yt-chapter-time">
                        {formatTime(ch.start)}
                      </span>
                      <button
                        type="button"
                        className="yt-chapter-play"
                        onClick={() => handlePlayChapter(ch.start)}
                      >
                        Play
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="yt-download-row">
              <div className="yt-download-left">
                {id && (
                  <div className="yt-full-alias">
                    <label className="yt-full-alias-label">
                      Full video alias (used when downloading whole video)
                    </label>
                    <input
                      type="text"
                      className="yt-full-alias-input"
                      placeholder="Full video alias (optional)"
                      value={fullVideoAlias}
                      onChange={(e) =>
                        setFullVideoAlias(e.target.value)
                      }
                    />
                  </div>
                )}
                <span className="yt-download-info">
                  {!id
                    ? "Enter a video to enable download"
                    : !selectedCategoryId
                    ? "Select a category to enable download"
                    : selectedCount > 0
                    ? `${selectedCount} chapter${
                        selectedCount > 1 ? "s" : ""
                      } selected`
                    : "No chapters selected – full video will be downloaded"}
                </span>
              </div>

              <button
                type="button"
                className="yt-download-button"
                disabled={!id || !selectedCategoryId || metaLoading}
                onClick={handleDownloadClick}
              >
                {selectedCount > 0
                  ? "Download selected chapters"
                  : "Download full video"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YoutubeInputsModal;
