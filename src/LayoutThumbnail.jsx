// LayoutThumbnail.jsx
import React from "react";
import LayoutPreview from "./LayoutPreview";

function LayoutThumbnail({ layoutItem, isSelected, isLive, onClick }) {
  let borderColor = "#444";

  if (isLive && isSelected) {
    borderColor = "#ff7bff"; // both live + selected
  } else if (isLive) {
    borderColor = "#ff4b4b"; // live = red
  } else if (isSelected) {
    borderColor = "#2aa8ff"; // selected = blue
  }
  
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: 4,
        marginBottom: 8,
        borderRadius: 6,
        border: `2px solid ${borderColor}`,
        background: "#000",
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", height: 90 }}>
        <LayoutPreview layout={layoutItem.data} />
      </div>
    </button>
  );
}

export default LayoutThumbnail;
