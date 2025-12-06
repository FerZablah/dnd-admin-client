// PreviewPanel.jsx
import React from "react";

function PreviewPanel({ title, borderColor, children }) {
  return (
    <div
      style={{
        flex: 1,
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        background: "#111",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#ccc",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* This wrapper gives LayoutPreview a concrete box to fill */}
        <div style={{ width: "100%", height: "100%" }}>{children}</div>
      </div>
    </div>
  );
}

export default PreviewPanel;
