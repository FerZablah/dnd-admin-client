// src/components/NowPlayingPanel.jsx
import React from "react";
import "./NowPlayingPanel.css";
import NowPlayingItem from "./NowPlayingItem";

function NowPlayingPanel({ items, outputConfig, onStop, onChangeOutputKey }) {
  return (
    <section className="now-playing-panel">
      <div className="now-playing-header">
        <h2>Playing</h2>
        <span className="now-playing-count">
          {items.length ? `${items.length} active` : "Idle"}
        </span>
      </div>

      <div className="now-playing-body">
        {items.length === 0 && (
          <div className="now-playing-empty">
            Nothing is playing. Start a track from the list above.
          </div>
        )}

        {items.map((item) => (
           <NowPlayingItem
            key={`${item.id}-${item.outputKey}`}             
            item={item}
            outputDevice={outputConfig[item.outputKey]}
            initialPosition={item.resumeAt || 0}             
            onStop={() => onStop(item.id)}
            onChangeOutputKey={(newKey, pos) =>              
              onChangeOutputKey && onChangeOutputKey(item.id, newKey, pos)
            }
          />
        ))}
      </div>
    </section>
  );
}

export default NowPlayingPanel;
