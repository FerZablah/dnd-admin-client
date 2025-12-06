import React from "react";
import ColumnEditor from "./ColumnEditor";
function LayoutEditor({ layout, onChange }) {
    const columns = layout.columns || [];

    const handleUpdateColumn = (index, newColumn) => {
        const newColumns = columns.map((col, i) => (i === index ? newColumn : col));
        onChange({ ...layout, columns: newColumns });
    };

    const handleAddColumn = () => {
        const newColumn = {
            flex: 1,
            rows: []
        };
        onChange({ ...layout, columns: [...columns, newColumn] });
    };

    const handleDeleteColumn = (index) => {
        const newColumns = columns.slice();
        newColumns.splice(index, 1);
        onChange({ ...layout, columns: newColumns });
    };

    return (
        <div>
            {columns.map((column, index) => (
                <div
                    key={index}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        padding: 8,
                        marginBottom: 8,
                        background: "#fafafa"
                    }}
                >
                    <ColumnEditor
                        column={column}
                        index={index}
                        onChange={(col) => handleUpdateColumn(index, col)}
                        onDelete={() => handleDeleteColumn(index)}
                    />
                </div>
            ))}

            <button type="button" onClick={handleAddColumn}>
                + Add column
            </button>
        </div>
    );
}


export default LayoutEditor;
