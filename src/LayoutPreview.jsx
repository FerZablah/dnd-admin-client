import React from "react";

function LayoutPreview({ layout }) {
  const columns = (layout && layout.columns) || [];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 4,
        boxSizing: "border-box"
      }}
    >
      {columns.length === 0 && (
        <div
          style={{
            margin: "auto",
            fontSize: 12,
            color: "#777"
          }}
        >
          No columns yet. Add one on the left.
        </div>
      )}

      {columns.map((column, index) => (
        <PreviewColumn key={index} column={column} />
      ))}
    </div>
  );
}

function PreviewColumn({ column }) {
  const rows = column.rows || [];
  const flex = column.flex != null ? column.flex : 1;
  const width = column.width;

  const style = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
    border: "1px solid #999", // column border
    borderRadius: 6,
    padding: 4,
    boxSizing: "border-box",
    background: "#fdfdfd"
  };

  if (width != null && width !== "") {
    style.flex = `0 0 ${width}px`;
    style.width = width;
  } else {
    style.flex = `${flex} 1 0`;
  }

  return (
    <div style={style}>
      {rows.map((row, index) => (
        <PreviewRow key={index} row={row} />
      ))}
    </div>
  );
}

function PreviewRow({ row }) {
  const isContentRow = !!row.content && !row.columns;
  const nestedColumns = row.columns || [];
  const flex = row.flex != null ? row.flex : 1;
  const height = row.height;

  const baseStyle = {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    background: "#fff",
    border: "1px solid #ccc", // row border
    borderRadius: 4,
    overflow: "hidden",
    minHeight: 0
  };

  if (height != null && height !== "") {
    baseStyle.flex = `0 0 ${height}px`;
    baseStyle.height = height;
  } else {
    baseStyle.flex = `${flex} 1 0`;
  }

  if (isContentRow) {
    return (
      <div style={baseStyle}>
        <PreviewContent content={row.content} />
      </div>
    );
  }

  // nested columns row
  return (
    <div style={{ ...baseStyle, padding: 2 }}>
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 4,
          minWidth: 0
        }}
      >
        {nestedColumns.map((column, index) => (
          <PreviewColumn key={index} column={column} />
        ))}
      </div>
    </div>
  );
}

// Placeholder so empty cells still look like boxes
function PlaceholderCell({ label }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        border: "1px dashed #aaa",
        background:
          "repeating-linear-gradient(45deg, #f3f3f3, #f3f3f3 10px, #e9e9e9 10px, #e9e9e9 20px)",
        fontSize: 11,
        color: "#555",
        textAlign: "center",
        padding: 4
      }}
    >
      {label}
    </div>
  );
}

function PreviewContent({ content }) {
  const [floatDelay] = React.useState(
    () => `${(Math.random() * 2).toFixed(2)}s` // random phase for floating
  );

  if (!content) {
    return <PlaceholderCell label="Empty cell" />;
  }

  const type = content.type;

  if (type === "video") {
    if (!content.videoSrc) {
      return <PlaceholderCell label="Video cell (no source yet)" />;
    }
    return (
      <video
        src={content.videoSrc}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
        loop
        autoPlay
      />
    );
  }

  if (type === "animated-image") {
    const imgSrc = content.imgSrc;
    const bgVideoSrc = content.bgVideoSrc;
    const animations = content.animations || {};
    const floating = animations.floating || {};
    const shaking = animations.shaking || {};
    const appearing = animations.appearing || {};

    if (!imgSrc && !bgVideoSrc) {
      return (
        <PlaceholderCell label="Animated image cell (no image/video yet)" />
      );
    }

    // Base image node (foreground)
    let imageNode;

    if (imgSrc) {
      imageNode = (
        <img
          src={imgSrc}
          alt="animated-foreground"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none"
          }}
        />
      );
    } else {
      imageNode = (
        <PlaceholderCell label="Animated image (no foreground image)" />
      );
    }

    // Shaking wrapper
    if (shaking.enabled) {
      const duration = shaking.speed || 0.15;
      imageNode = (
        <div
          className="animated-shake"
          style={{ "--shake-speed": `${duration}s` }}
        >
          {imageNode}
        </div>
      );
    }

    // Floating wrapper
    if (floating.enabled) {
      const amplitude = floating.amplitude || 10;
      const duration = floating.speed || 4;
      imageNode = (
        <div
          className="animated-float"
          style={{
            "--float-amp": `${amplitude}px`,
            "--float-speed": `${duration}s`,
            "--float-delay": floatDelay
          }}
        >
          {imageNode}
        </div>
      );
    }

    // Appearing wrapper
    if (appearing.enabled) {
      const duration = appearing.speed || 0.6;
      const from = appearing.from || "bottom"; // top, bottom, left, right, corners
      const dirClass = `animated-appear-from-${from}`;
      imageNode = (
        <div
          className={`animated-appear ${dirClass}`}
          style={{ "--appear-speed": `${duration}s` }}
        >
          {imageNode}
        </div>
      );
    }

    return (
      <div className="animated-image-container">
        {bgVideoSrc && (
          <video
            src={bgVideoSrc}
            className="animated-image-bgvideo"
            muted
            loop
            autoPlay
          />
        )}
        <div className="animated-image-foreground">{imageNode}</div>
      </div>
    );
  }

  // Plain image
  if (!content.imgSrc) {
    return <PlaceholderCell label="Image cell (no source yet)" />;
  }

  return (
    <img
      src={content.imgSrc}
      alt={type}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block"
      }}
    />
  );
}


export default LayoutPreview;
