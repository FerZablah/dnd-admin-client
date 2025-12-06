// src/components/OutputSelector.jsx
import React, { useEffect, useState } from "react";
import "./OutputSelector.css";
import YoutubeInputsModal from "./YoutubeInputsModal";

function OutputSelector({ outputConfig, onChangeOutput }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInputsModalOpen, setIsInputsModalOpen] = useState(false);

  const canSetSinkId =
    typeof HTMLMediaElement !== "undefined" &&
    typeof HTMLMediaElement.prototype.setSinkId === "function" &&
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.enumerateDevices === "function";

  // -------- audio devices --------
  useEffect(() => {
    if (!canSetSinkId) return;

    let cancelled = false;

    const loadDevices = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
          console.warn("getUserMedia failed or was blocked:", err);
        }

        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;

        const outputs = all.filter((d) => d.kind === "audiooutput");
        setDevices(outputs);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to enumerate audio devices", err);
          setLoadError("Failed to list audio devices");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDevices();

    return () => {
      cancelled = true;
    };
  }, [canSetSinkId]);

  const handleSelectChange = (targetKey, deviceId) => {
    if (!deviceId) {
      onChangeOutput(targetKey, {
        id: "default",
        label: "System default output",
      });
      return;
    }

    const device = devices.find((d) => d.deviceId === deviceId);
    if (!device) return;

    onChangeOutput(targetKey, {
      id: device.deviceId,
      label: device.label || "Audio device",
    });
  };

  const renderOutputRow = (key, label) => {
    const current = outputConfig[key];

    const selectedDeviceId =
      current && current.id && current.id !== "default" ? current.id : "";

    return (
      <div className="output-row" key={key}>
        <div className="output-row-label">{label}</div>
        <div className="output-row-device">
          {!canSetSinkId ? (
            <span className="output-row-device-label">
              Audio output selection is not supported in this browser.
            </span>
          ) : (
            <>
              <select
                className="output-row-select"
                disabled={loading || devices.length === 0}
                value={selectedDeviceId}
                onChange={(e) => handleSelectChange(key, e.target.value)}
              >
                <option value="">System default output</option>
                {devices.map((d, index) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Audio device ${index + 1}`}
                  </option>
                ))}
              </select>
              {loading && (
                <span className="output-row-device-label">Loading…</span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const openInputsModal = () => {
    setDropdownOpen(false);
    setIsInputsModalOpen(true);
  };

  return (
    <>
      <section className="output-selector">
        <div className="output-selector-inner">
          <div className="output-selector-layout">
            {/* LEFT: button + dropdown */}
            <div className="output-selector-left">
              <div className="output-action-dropdown">
                <button
                  type="button"
                  className="output-action-button"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  Add ▾
                </button>
                {dropdownOpen && (
                  <div className="output-action-menu">
                    <button
                      type="button"
                      className="output-action-menu-item"
                      onClick={openInputsModal}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      className="output-action-menu-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Option 2 (coming soon)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: outputs settings */}
            <div className="output-selector-right">
              <div className="output-selector-header">
                <h2>Outputs</h2>
                <span className="output-selector-sub">
                  Speakers / Preview routing
                </span>
              </div>

              <div className="output-selector-body">
                {renderOutputRow("speakers", "Speakers")}
                {renderOutputRow("preview", "Preview")}
              </div>

              {loadError && (
                <p className="output-selector-error">{loadError}</p>
              )}

              <p className="output-selector-footnote">
                Device labels may require granting microphone access so the
                browser is allowed to list them. Routing itself is done via the{" "}
                <code>setSinkId</code> API supported by Chromium (Edge / Chrome).
              </p>
            </div>
          </div>
        </div>
      </section>

      <YoutubeInputsModal
        isOpen={isInputsModalOpen}
        onClose={() => setIsInputsModalOpen(false)}
      />
    </>
  );
}

export default OutputSelector;
