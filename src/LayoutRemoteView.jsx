// LayoutRemoteView.jsx
import React, { useEffect, useState } from "react";
import LayoutList from "./LayoutList";
import PreviewPanel from "./PreviewPanel";
import LayoutPreview from "./LayoutPreview";
import ProjectSelect from "./ProjectSelect";
import socket from "./socket";

function LayoutRemoteView() {
  // Example layouts – you can replace or extend this array
  const [selectedProject, setSelectedProject] = useState("");
  const [layouts, setLayouts] = useState("");
  const [previewLayout, setPreviewLayout] = useState(null)
  const [liveLayout, setLiveLayout] = useState(null);

  useEffect(() => {
    if (selectedProject && selectedProject !== "") {
      fetch(`http://localhost:3000/layouts/project/${encodeURIComponent(selectedProject)}`)
        .then(res => res.json())
        .then(data => {
          
          setLayouts(data.layouts)
        });
    }
  }, [selectedProject])
  const [selectedId, setSelectedId] = useState(layouts[0]?.id);
  const [liveId, setLiveId] = useState(layouts[0]?.id);


  function handleSelectedPreview(id){
    setSelectedId(id);
    
    const selectedLayout = layouts.find((a) => a.id == id);
    setPreviewLayout(selectedLayout);
  }
  function handleGoLive() {
    if (selectedId) setLiveId(selectedId);
    setLiveLayout( 
      layouts.find((a) => a.id == selectedId)
    );
    socket.emit("setLiveLayout", { layoutId: selectedId });
  }

  return (
    <>
      <ProjectSelect
        value={selectedProject}
        onChange={(project) => setSelectedProject(project)}
      />
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: "#000",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        {/* Left side: scrolling list of small previews */}
        <LayoutList
          layouts={layouts}
          selectedId={selectedId}
          liveId={liveId}
          onSelect={handleSelectedPreview}
        />

        {/* Right side: big Preview + Go Live button + Live */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 16,
            gap: 16,
            minWidth: 0,
            minHeight: 0,
            boxSizing: "border-box",
          }}
        >
          <PreviewPanel title="Preview" borderColor="#2aa8ff">
            {previewLayout && (
              <div style={{ width: "100%", height: "100%" }}>
                <LayoutPreview layout={previewLayout.data} />
              </div>
            )}
          </PreviewPanel>

          <div
            style={{
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <button
              onClick={handleGoLive}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "2px solid #ff4b4b",
                background: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
              }}
              title="Send preview layout to Live"
            >
              ↓
            </button>
            <span style={{ fontSize: 12, color: "#ccc" }}>Send to Live</span>
          </div>

          <PreviewPanel title="Live" borderColor="#ff4b4b">
            {liveLayout && (
              <div style={{ width: "100%", height: "100%" }}>
                <LayoutPreview layout={liveLayout.data} />
              </div>
            )}
          </PreviewPanel>
        </div>
      </div>
    </>
  );
}

export default LayoutRemoteView;
