import RowEditor from "./RowEditor";

function parseNumber(value) {
    const n = parseFloat(value);
    return Number.isNaN(n) ? undefined : n;
}

function ColumnEditor({ column, index, onChange, onDelete }) {
    const rows = column.rows || [];

    const handleChangeField = (field, value) => {
        onChange({
            ...column,
            [field]: value === "" ? undefined : parseNumber(value)
        });
    };

    const handleUpdateRow = (rowIndex, newRow) => {
        const newRows = rows.map((row, i) => (i === rowIndex ? newRow : row));
        onChange({ ...column, rows: newRows });
    };

    const handleAddContentRow = () => {
        const newRow = {
            flex: 1,
            content: {
                type: "image",
                imgSrc: "",
                imgSourceType: "url"
            }
        };
        onChange({ ...column, rows: [...rows, newRow] });
    };

    const handleAddNestedColumnsRow = () => {
        const newRow = {
            flex: 1,
            columns: [
                {
                    flex: 1,
                    rows: []
                }
            ]
        };
        onChange({ ...column, rows: [...rows, newRow] });
    };

    const handleDeleteRow = (rowIndex) => {
        const newRows = rows.slice();
        newRows.splice(rowIndex, 1);
        onChange({ ...column, rows: newRows });
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 4,
                    justifyContent: "space-between"
                }}
            >
                <strong>Column #{index + 1}</strong>
                <button type="button" onClick={onDelete}>
                    Delete column
                </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label style={{ fontSize: 12 }}>
                    Flex{" "}
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={column.flex != null ? column.flex : ""}
                        onChange={(e) => handleChangeField("flex", e.target.value)}
                        style={{ width: 80 }}
                    />
                </label>

                <label style={{ fontSize: 12 }}>
                    Width (px, optional)
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={column.width != null ? column.width : ""}
                        onChange={(e) => handleChangeField("width", e.target.value)}
                        style={{ width: 100 }}
                    />
                </label>
            </div>

            {rows.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        padding: 6,
                        marginBottom: 6,
                        background: "#fff"
                    }}
                >
                    <RowEditor
                        row={row}
                        index={rowIndex}
                        onChange={(newRow) => handleUpdateRow(rowIndex, newRow)}
                        onDelete={() => handleDeleteRow(rowIndex)}
                    />
                </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button type="button" onClick={handleAddContentRow}>
                    + Add content row
                </button>
                <button type="button" onClick={handleAddNestedColumnsRow}>
                    + Add nested columns row
                </button>
            </div>
        </div>
    );
}

export default ColumnEditor;