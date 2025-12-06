// src/components/CategorySidebar.jsx
import React from "react";
import "./CategorySidebar.css";

function CategorySidebar({
  categories,
  selectedId,
  onSelect,
}) {
  return (
    <aside className="category-sidebar">
      <div className="category-sidebar-header">
        <div className="app-title">Sound Deck</div>
        <div className="app-subtitle">DM Control</div>
      </div>

      <nav className="category-list">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={
              "category-item" + (cat.id === selectedId ? " active" : "")
            }
            onClick={() => onSelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default CategorySidebar;
