import React from 'react';
import './NowPlayingPanel.css';
import NowPlayingItem from './NowPlayingItem';          // local audio controller
import NowPlayingRadioItem from './NowPlayingRadioItem'; // radio (socket) controller

function NowPlayingPanel({ items, outputConfig, onStop, onChangeOutputKey }) {
  return (
    <section className="now-playing-panel">
      <h2>Now Playing</h2>
      <p>{items.length ? `${items.length} active` : 'Idle'}</p>

      {items.length === 0 && (
        <p>Nothing is playing. Start a track from the list above.</p>
      )}

      {items.map((item) => {
        // RADIO → use socket-based controller
        if (item.outputKey === 'radio') {
          return (
            <NowPlayingRadioItem
              key={item.id}
              item={item}
              onStop={() => onStop(item.id)}
              onChangeOutputKey={(newKey, pos) =>
                onChangeOutputKey && onChangeOutputKey(item.id, newKey, pos)
              }
            />
          );
        }

        // SPEAKERS / PREVIEW → use local <audio> controller
        return (
          <NowPlayingItem
            key={item.id}
            item={item}
            outputDevice={outputConfig[item.outputKey]}
            onStop={() => onStop(item.id)}
            onChangeOutputKey={(newKey, pos) =>
              onChangeOutputKey && onChangeOutputKey(item.id, newKey, pos)
            }
          />
        );
      })}
    </section>
  );
}

export default NowPlayingPanel;
