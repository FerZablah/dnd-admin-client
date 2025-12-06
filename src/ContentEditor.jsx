function parseNumber(value) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? undefined : n;
}

function ContentEditor({ content, onChange }) {
    
    const type = content?.type || "image";
    // For images / animated-images
    const imgSourceType = content?.imgSourceType || content?.sourceType || "url";

    // Animations config for animated-image
    const animations = content?.animations || {};
    const floating = animations.floating || {};
    const shaking = animations.shaking || {};
    const appearing = animations.appearing || {};

    const updateAnimations = (partial) => {
        onChange({
            ...content,
            animations: {
                ...animations,
                ...partial
            }
        });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;

        if (newType === "video") {
            onChange({
                ...content,
                type: "video",
                videoSrc: content.videoSrc || ""
            });
        } else if (newType === "animated-image") {
            onChange({
                ...content,
                type: "animated-image",
                imgSrc: content.imgSrc || "",
                imgSourceType,
                bgVideoSrc: content.bgVideoSrc || "",
                animations: animations || {}
            });
        } else {
            // image
            onChange({
                ...content,
                type: "image",
                imgSrc: content.imgSrc || "",
                imgSourceType
            });
        }
    };

    const handleImageSourceTypeChange = (e) => {
        const newSourceType = e.target.value;
        onChange({
            ...content,
            imgSourceType: newSourceType
        });
    };

    const handleImageUrlChange = (e) => {
        onChange({
            ...content,
            imgSrc: e.target.value,
            imgSourceType: "url"
        });
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (content.imgSrc && String(content.imgSrc).startsWith("blob:")) {
            try {
                URL.revokeObjectURL(content.imgSrc);
            } catch {
                // ignore
            }
        }

        const objectUrl = URL.createObjectURL(file);
        onChange({
            ...content,
            imgSrc: objectUrl,
            imgSourceType: "file",
            imageFile: file
        });

    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (content.videoSrc && String(content.videoSrc).startsWith("blob:")) {
            try {
                URL.revokeObjectURL(content.videoSrc);
            } catch {
                // ignore
            }
        }

        const objectUrl = URL.createObjectURL(file);
        onChange({
            ...content,
            type: "video",
            videoSrc: objectUrl,
            videoFile: file
        });
    };

    const handleBgVideoFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (content.bgVideoSrc && String(content.bgVideoSrc).startsWith("blob:")) {
            try {
                URL.revokeObjectURL(content.bgVideoSrc);
            } catch {
                // ignore
            }
        }

        const objectUrl = URL.createObjectURL(file);
        onChange({
            ...content,
            type: "animated-image",
            bgVideoSrc: objectUrl,
            animations,
            bgVideoFile: file
        });
    };

    // Helpers for animation numeric fields
    const setFloatingField = (field, value) => {
        const num = parseNumber(value);
        updateAnimations({
            floating: {
                ...floating,
                [field]: num
            }
        });
    };

    const setShakingField = (field, value) => {
        const num = parseNumber(value);
        updateAnimations({
            shaking: {
                ...shaking,
                [field]: num
            }
        });
    };

    const setAppearingField = (field, value) => {
        const num = parseNumber(value);
        updateAnimations({
            appearing: {
                ...appearing,
                [field]: num
            }
        });
    };

    return (
        <div style={{ padding: 8, borderRadius: 4, background: "#f2f2f2" }}>
            <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12 }}>
                    Type{" "}
                    <select value={type} onChange={handleTypeChange}>
                        <option value="image">Image</option>
                        <option value="animated-image">Animated image</option>
                        <option value="video">Video</option>
                    </select>
                </label>
            </div>

            {(type === "image" || type === "animated-image") && (
                <div style={{ marginBottom: type === "animated-image" ? 12 : 0 }}>
                    <div style={{ marginBottom: 4, fontSize: 12 }}>
                        {type === "animated-image" ? "Foreground image" : "Image source"}
                    </div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                        <label style={{ fontSize: 12 }}>
                            <input
                                type="radio"
                                value="url"
                                checked={imgSourceType === "url"}
                                onChange={handleImageSourceTypeChange}
                            />{" "}
                            URL
                        </label>
                        <label style={{ fontSize: 12 }}>
                            <input
                                type="radio"
                                value="file"
                                checked={imgSourceType === "file"}
                                onChange={handleImageSourceTypeChange}
                            />{" "}
                            File
                        </label>
                    </div>

                    {imgSourceType === "url" ? (
                        <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            value={content.imgSrc || ""}
                            onChange={handleImageUrlChange}
                            style={{ width: "100%", boxSizing: "border-box" }}
                        />
                    ) : (
                        <input type="file" accept="image/*" onChange={handleImageFileChange} />
                    )}
                </div>
            )}

            {type === "animated-image" && (
                <>
                    {/* Background video */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ marginBottom: 4, fontSize: 12 }}>
                            Background video (file only, in-browser)
                        </div>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleBgVideoFileChange}
                        />
                        {content.bgVideoSrc && (
                            <div style={{ marginTop: 4, fontSize: 11, color: "#555" }}>
                                Background video set (preview on the right).
                            </div>
                        )}
                    </div>

                    {/* Animations */}
                    <div
                        style={{
                            borderTop: "1px solid #ddd",
                            paddingTop: 8,
                            marginTop: 4
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: "bold",
                                marginBottom: 6
                            }}
                        >
                            Animations
                        </div>

                        {/* Floating */}
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 12 }}>
                                <input
                                    type="checkbox"
                                    checked={!!floating.enabled}
                                    onChange={(e) =>
                                        updateAnimations({
                                            floating: {
                                                ...floating,
                                                enabled: e.target.checked
                                            }
                                        })
                                    }
                                />{" "}
                                Floating in place
                            </label>
                            {floating.enabled && (
                                <div
                                    style={{
                                        marginLeft: 16,
                                        marginTop: 4,
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <label style={{ fontSize: 11 }}>
                                        Duration (seconds){" "}
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={floating.speed != null ? floating.speed : ""}
                                            onChange={(e) =>
                                                setFloatingField("speed", e.target.value)
                                            }
                                            style={{ width: 70 }}
                                        />
                                    </label>
                                    <label style={{ fontSize: 11 }}>
                                        Amplitude (px){" "}
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                floating.amplitude != null ? floating.amplitude : ""
                                            }
                                            onChange={(e) =>
                                                setFloatingField("amplitude", e.target.value)
                                            }
                                            style={{ width: 70 }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Shaking */}
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 12 }}>
                                <input
                                    type="checkbox"
                                    checked={!!shaking.enabled}
                                    onChange={(e) =>
                                        updateAnimations({
                                            shaking: {
                                                ...shaking,
                                                enabled: e.target.checked
                                            }
                                        })
                                    }
                                />{" "}
                                Shaking in place
                            </label>
                            {shaking.enabled && (
                                <div
                                    style={{
                                        marginLeft: 16,
                                        marginTop: 4,
                                        display: "flex",
                                        gap: 8
                                    }}
                                >
                                    <label style={{ fontSize: 11 }}>
                                        Duration (seconds){" "}
                                        <input
                                            type="number"
                                            min="0.05"
                                            step="0.05"
                                            value={shaking.speed != null ? shaking.speed : ""}
                                            onChange={(e) =>
                                                setShakingField("speed", e.target.value)
                                            }
                                            style={{ width: 70 }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Appearing */}
                        <div>
                            <label style={{ fontSize: 12 }}>
                                <input
                                    type="checkbox"
                                    checked={!!appearing.enabled}
                                    onChange={(e) =>
                                        updateAnimations({
                                            appearing: {
                                                ...appearing,
                                                enabled: e.target.checked
                                            }
                                        })
                                    }
                                />{" "}
                                Appearing (slide-in)
                            </label>
                            {appearing.enabled && (
                                <div
                                    style={{
                                        marginLeft: 16,
                                        marginTop: 4,
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <label style={{ fontSize: 11 }}>
                                        From side{" "}
                                        <select
                                            value={appearing.from || "bottom"}
                                            onChange={(e) =>
                                                updateAnimations({
                                                    appearing: {
                                                        ...appearing,
                                                        from: e.target.value
                                                    }
                                                })
                                            }
                                        >
                                            <option value="top">Top</option>
                                            <option value="bottom">Bottom</option>
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                            <option value="top-left">Top-left</option>
                                            <option value="top-right">Top-right</option>
                                            <option value="bottom-left">Bottom-left</option>
                                            <option value="bottom-right">Bottom-right</option>
                                        </select>
                                    </label>

                                    <label style={{ fontSize: 11 }}>
                                        Duration (seconds){" "}
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={appearing.speed != null ? appearing.speed : ""}
                                            onChange={(e) =>
                                                setAppearingField("speed", e.target.value)
                                            }
                                            style={{ width: 70 }}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {type === "video" && (
                <div>
                    <div style={{ marginBottom: 4, fontSize: 12 }}>
                        Video source (file only, in-browser)
                    </div>
                    <input type="file" accept="video/*" onChange={handleVideoFileChange} />
                    {content.videoSrc && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#555" }}>
                            A video is set (preview on the right).
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ContentEditor;