// src/components/SoundControlPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./SoundControlPanel.css";
import CategorySidebar from "./CategorySidebar";
import OutputSelector from "./OutputSelector";
import TrackList from "./TrackList";
import NowPlayingPanel from "./NowPlayingPanel";
import { fetchCategories } from "./categoryApi";
import { fetchProjects } from "./projectApi";

const OUTPUT_STORAGE_KEY = "soundDeck.outputConfig";

function SoundControlPanel() {
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");
  // Load categories & projects from backend
  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      setMetaLoading(true);
      setMetaError("");

      try {
        const [catRes, projRes] = await Promise.all([
          fetchCategories(), // returns [{ id, name }, ...]
          fetchProjects(),   // returns [{ id, name }, ...]
        ]);

        if (!isMounted) return;

        // Shape categories like the previous SAMPLE_CATEGORIES
        const shapedCategories = catRes.map((c) => ({
          id: String(c.id),
          name: c.name,
          tracks: c.audios, // for now; you can populate from another endpoint later
        }));

        const shapedProjects = projRes.map((p) => ({
          id: String(p.id),
          name: p.name,
          tracks: p.audios, // for now; you can populate from another endpoint later
        }));

        setCategories(shapedCategories);
        setProjects(shapedProjects);

        // Default selections
        if (shapedCategories.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(shapedCategories[0].id);
        }
        if (projRes.length > 0 && !selectedProjectId) {
          setSelectedProjectId(String(projRes[0].id));
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setMetaError("Failed to load categories/projects.");
      } finally {
        if (isMounted) setMetaLoading(false);
      }
    }

    loadMeta();

    return () => {
      isMounted = false;
    };
  }, []); // load once

  const [outputConfig, setOutputConfig] = useState(() => {
    if (typeof window === "undefined") {
      return {
        speakers: { id: "default", label: "System default output" },
        preview: { id: "default", label: "System default output" },
      };
    }

    try {
      const stored = window.localStorage.getItem(OUTPUT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          speakers: parsed.speakers || {
            id: "default",
            label: "System default output",
          },
          preview: parsed.preview || {
            id: "default",
            label: "System default output",
          },
        };
      }
    } catch (err) {
      console.warn("Failed to read output config from localStorage", err);
    }

    return {
      speakers: { id: "default", label: "System default output" },
      preview: { id: "default", label: "System default output" },
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        OUTPUT_STORAGE_KEY,
        JSON.stringify(outputConfig)
      );
    } catch (err) {
      console.warn("Failed to write output config to localStorage", err);
    }
  }, [outputConfig]);

  // Stack of currently playing audio elements (per track & output)
  const [nowPlaying, setNowPlaying] = useState([]);

  const selectedCategory = useMemo(
    () =>
      categories.find((c) => c.id === selectedCategoryId) ||
      categories[0] ||
      null,
    [categories, selectedCategoryId]
  );

  const selectedProject = useMemo(
    () =>
      projects.find((c) => c.id === selectedProjectId) ||
      projects[0] ||
      null,
    [projects, selectedProjectId]
  );

  const handleChangeOutput = (targetKey, device) => {
    setOutputConfig((prev) => ({
      ...prev,
      [targetKey]: device,
    }));
  };

  const handleStartPlayback = (track, outputKey) => {
    const id =
      track.id +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 6);

    setNowPlaying((prev) => [
      ...prev,
      {
        id,
        track,
        outputKey, // "speakers" | "preview"
        startedAt: Date.now(),
      },
    ]);
  };

  const handleStopPlayback = (id) => {
    setNowPlaying((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeItemOutputKey = (itemId, newKey, position) => {
    setNowPlaying((prev) =>
      prev.map((p) =>
        p.id === itemId
          ? { ...p, outputKey: newKey, resumeAt: position }
          : p
      )
    );
  };

  if (metaLoading) {
    return (
      <div className="sound-control">
        <div>Loading categories & projects...</div>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="sound-control">
        <div style={{ color: "red" }}>{metaError}</div>
      </div>
    );
  }
  
  return (
    <div className="sound-control">
      <CategorySidebar
        categories={categories}
        selectedId={selectedCategory?.id}
        onSelect={setSelectedCategoryId}
      />

      <div className="sound-control-main">
        <div className="sound-control-top">
          {/* Project selector (using /projects API) */}
          <div className="sound-control-top-left">
            {projects.length > 0 && (
              <label style={{ marginRight: "12px" }}>
                Project:&nbsp;
                <select
                  value={selectedProjectId || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value || null)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="sound-control-top-right">
            <OutputSelector
              outputConfig={outputConfig}
              onChangeOutput={handleChangeOutput}
            />
            <TrackList
              category={selectedCategory}
              onPlaySpeakers={(track) => handleStartPlayback(track, "speakers")}
              onPlayPreview={(track) => handleStartPlayback(track, "preview")}
              onPlayRadio={(track) => {
                // TODO: later you can use selectedProjectId + category to drive radio
                console.log("Play on radio (stub):", {
                  trackId: track.id,
                  projectId: selectedProjectId,
                });
              }}
            />
            { selectedProject && 
              <TrackList
                category={selectedProject}
                onPlaySpeakers={(track) => handleStartPlayback(track, "speakers")}
                onPlayPreview={(track) => handleStartPlayback(track, "preview")}
                onPlayRadio={(track) => {
                  // TODO: later you can use selectedProjectId + category to drive radio
                  console.log("Play on radio (stub):", {
                    trackId: track.id,
                    projectId: selectedProjectId,
                  });
                }}
              />
            }
          </div>
        </div>

        <div className="sound-control-content">
          <NowPlayingPanel
            items={nowPlaying}
            outputConfig={outputConfig}
            onStop={handleStopPlayback}
            onChangeOutputKey={handleChangeItemOutputKey}
          />
        </div>
      </div>
    </div>
  );
}

export default SoundControlPanel;
