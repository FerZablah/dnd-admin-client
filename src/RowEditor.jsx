import ContentEditor from "./ContentEditor";
import ColumnEditor from "./ColumnEditor";

function parseNumber(value) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? undefined : n;
}
function RowEditor({ row, index, onChange, onDelete }) {
    const isContentRow = !!row.content && !row.columns;
    const hasNestedColumns = !!row.columns;

    const handleChangeField = (field, value) => {
        onChange({
            ...row,
            [field]: value === "" ? undefined : parseNumber(value)
        });
    };

    const handleToggleToContent = () => {
        onChange({
            flex: row.flex || 1,
            height: row.height,
            content: {
                type: "image",
                imgSrc: "",
                imgSourceType: "url"
            }
        });
    };

    const handleToggleToNestedColumns = () => {
        onChange({
            flex: row.flex || 1,
            height: row.height,
            columns: [
                {
                    flex: 1,
                    rows: []
                }
            ]
        });
    };

    const handleUpdateNestedColumn = (colIndex, newColumn) => {
        const columns = row.columns || [];
        const newColumns = columns.map((c, i) => (i === colIndex ? newColumn : c));
        onChange({ ...row, columns: newColumns });
    };

    const handleAddNestedColumn = () => {
        const columns = row.columns || [];
        const newColumns = [
            ...columns,
            {
                flex: 1,
                rows: []
            }
        ];
        onChange({ ...row, columns: newColumns });
    };

    const handleDeleteNestedColumn = (colIndex) => {
        const columns = row.columns || [];
        const newColumns = columns.slice();
        newColumns.splice(colIndex, 1);
        onChange({ ...row, columns: newColumns });
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4
                }}
            >
                <strong>Row #{index + 1}</strong>
                <button type="button" onClick={onDelete}>
                    Delete row
                </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <label style={{ fontSize: 12 }}>
                    Flex{" "}
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={row.flex != null ? row.flex : ""}
                        onChange={(e) => handleChangeField("flex", e.target.value)}
                        style={{ width: 80 }}
                    />
                </label>

                <label style={{ fontSize: 12 }}>
                    Height (px, optional)
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.height != null ? row.height : ""}
                        onChange={(e) => handleChangeField("height", e.target.value)}
                        style={{ width: 100 }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: 6, fontSize: 12 }}>
                <span>Row type: </span>
                <strong>
                    {isContentRow ? "Content" : hasNestedColumns ? "Nested columns" : "Empty"}
                </strong>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button type="button" onClick={handleToggleToContent}>
                    Make content row
                </button>
                <button type="button" onClick={handleToggleToNestedColumns}>
                    Make nested columns row
                </button>
            </div>

            {isContentRow && (
                <ContentEditor
                    content={row.content}
                    onChange={(newContent) => onChange({ ...row, content: newContent })}
                />
            )}

            {hasNestedColumns && (
                <div
                    style={{
                        borderLeft: "2px solid #ddd",
                        paddingLeft: 8,
                        marginTop: 4
                    }}
                >
                    {(row.columns || []).map((column, colIndex) => (
                        <div
                            key={colIndex}
                            style={{
                                border: "1px dashed #ccc",
                                borderRadius: 4,
                                padding: 6,
                                marginBottom: 6,
                                background: "#fafafa"
                            }}
                        >
                            <ColumnEditor
                                column={column}
                                index={colIndex}
                                onChange={(col) => handleUpdateNestedColumn(colIndex, col)}
                                onDelete={() => handleDeleteNestedColumn(colIndex)}
                            />
                        </div>
                    ))}

                    <button type="button" onClick={handleAddNestedColumn}>
                        + Add nested column
                    </button>
                </div>
            )}
        </div>
    );
}

export default RowEditor;