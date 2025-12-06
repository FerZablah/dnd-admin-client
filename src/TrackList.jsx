// src/components/TrackList.jsx
import React from "react";
import "./TrackList.css";

function TrackList({ category, onPlaySpeakers, onPlayPreview, onPlayRadio }) {
  if (!category) {
    return (
      <section className="track-list">
        <div className="track-list-inner">
          <div className="track-list-header">
            <h2>Tracks</h2>
          </div>
          <div className="track-list-empty">No category selected.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="track-list">
      <div className="track-list-inner">
        <div className="track-list-header">
          <h2>{category.name}</h2>
          <span className="track-list-count">
            {category.tracks.length} tracks
          </span>
        </div>

        {category.tracks.length === 0 ? (
          <div className="track-list-empty">No tracks in this category.</div>
        ) : (
          <div className="track-cards-grid">
            {category.tracks.map((track) => (
              <div key={track.id} className="track-card">
                <div className="track-card-body">
                  <div className="track-card-title">{track.alias}</div>
                </div>

                <div className="track-card-footer">
                  <button
                    type="button"
                    className="track-button primary"
                    onClick={() => onPlaySpeakers(track)}
                  >
                    Speakers
                  </button>
                  <button
                    type="button"
                    className="track-button"
                    onClick={() => onPlayPreview(track)}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    className="track-button subtle"
                    onClick={() => onPlayRadio(track)}
                  >
                    Radio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TrackList;
