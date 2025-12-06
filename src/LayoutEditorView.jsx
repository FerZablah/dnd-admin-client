import React, { useState } from "react";
import LayoutEditor from "./LayoutEditor";
import LayoutPreview from "./LayoutPreview";
import { uploadLayout } from "./layoutApi";
import { ToastContainer, toast } from 'react-toastify';

// Example initial layout using your recursive structure
const initialLayout = {
  columns: [
    {
      flex: 1,
      rows: [
        {
          flex: 1,
          content: {
            type: "image",
            imgSrc: "https://via.placeholder.com/600x400?text=Image+1",
            sourceType: "url"
          }
        },
        {
          flex: 1,
          columns: [
            {
              flex: 1,
              rows: [
                {
                  flex: 1,
                  content: {
                    type: "animated-image",
                    imgSrc: "https://static.wikitide.net/greatcharacterswiki/thumb/a/ac/Sonic_movie_-_Sonic_point_v2.png/300px-Sonic_movie_-_Sonic_point_v2.png",
                    sourceType: "url"
                  }
                }
              ]
            },
            {
              flex: 1,
              rows: [
                {
                  flex: 1,
                  content: {
                    type: "video",
                    videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
                    sourceType: "url" // for preview from URL; in real use you'd probably use file
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

function removeKeyDeep(value, keyToRemove) {
  // Arrays: recurse into each item
  if (Array.isArray(value)) {
    return value.map((item) => removeKeyDeep(item, keyToRemove));
  }

  // Objects: build a new object without the key
  if (value !== null && typeof value === "object") {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === keyToRemove) {
        // skip this key entirely
        continue;
      }
      result[key] = removeKeyDeep(val, keyToRemove);
    }
    return result;
  }

  // Primitives (string, number, boolean, null, etc.) are returned as-is
  return value;
}

function LayoutEditorView() {
  const [layout, setLayout] = useState(initialLayout);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState("")
  const handleSave = async () => {
    try {
      setSaving(true);
      toast("saving...")
      await uploadLayout(layout, projectName);
      toast("saved")
    } catch (e) {
      console.error(e);
      alert(e.message || "Error saving layout");
    } finally {
      setSaving(false);
    }
  };

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value)
    
  }

  return (
    <>
    <button onClick={handleSave} disabled={saving}>Save layout</button>
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Left side: editor + JSON */}
      <div
        style={{
          flex: 1,
          padding: 16,
          overflow: "auto",
          borderRight: "1px solid #ddd",
          boxSizing: "border-box"
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Grid Layout Editor</h1>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
          Edit the recursive columns / rows structure. The preview on the right
          updates live.
        </p>
        <span>Project name</span>
        <input type="text" onChange={handleProjectNameChange} style={{marginLeft: 10}}/>
        <LayoutEditor layout={layout} onChange={setLayout}/>

        <h2 style={{ marginTop: 16, fontSize: 16 }}>Layout JSON</h2>
        <textarea
          style={{
            width: "100%",
            height: 220,
            fontFamily: "monospace",
            fontSize: 12,
            boxSizing: "border-box"
          }}
          readOnly
          value={JSON.stringify(removeKeyDeep(layout, "imgSourceType"), null, 2)}
        />
      </div>

      {/* Right side: preview */}
      <div
        style={{
          flex: 1,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Preview</h2>
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "hidden",
            background: "#f8f8f8",
            padding: 8,
            boxSizing: "border-box"
          }}
        >
          <LayoutPreview layout={layout} />
        </div>
      </div>
    </div>
      <ToastContainer />
    </>
  );
}

export default LayoutEditorView;
