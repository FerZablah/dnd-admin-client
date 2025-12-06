// LayoutList.jsx
import React from "react";
import LayoutThumbnail from "./LayoutThumbnail";

function LayoutList({ layouts, selectedId, liveId, onSelect }) {
  return (
    <div
      style={{
        width: 220,
        padding: 12,
        borderRight: "1px solid #222",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {layouts && layouts.map((item) => (
        <LayoutThumbnail
          key={item.id}
          layoutItem={item}
          isSelected={item.id === selectedId}
          isLive={item.id === liveId}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
}

export default LayoutList;
