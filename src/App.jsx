import { Routes, Route, Link } from "react-router-dom";
import LayoutEditorView from "./LayoutEditorView";
import LayoutRemoteView from "./LayoutRemoteView";
import SoundControlPanel from "./SoundControlPanel";

export default function App() {
  return (
    <div>
      {/* Simple navigation */}
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/remote">Layout Remote</Link>
        <Link to="/sound">Sound Remote</Link>
      </nav>
      {/* Route definitions */}
      <Routes>
        <Route path="/" element={<LayoutEditorView />} />
        <Route path="/remote" element={<LayoutRemoteView />} />
        <Route path="/sound" element={<SoundControlPanel />} />
        {/* 404 fallback */}
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </div>
  );
}
