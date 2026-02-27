import { useState } from "react";

/**
 * ViewModeToggle — dynamic view switcher
 * modes: list | grid | compact | large | card | table
 */
const MODES = [
  { id: "grid",    label: "Grid",    icon: "⊞" },
  { id: "list",    label: "List",    icon: "☰" },
  { id: "card",    label: "Card",    icon: "▣" },
  { id: "table",   label: "Table",   icon: "⊟" },
  { id: "compact", label: "Compact", icon: "▤" },
];

export const ViewModeToggle = ({ mode, onChange, available = ["grid", "list", "card", "table"] }) => (
  <div style={{
    display: "flex", gap: 4, background: "var(--surface)",
    border: "1px solid var(--border)", borderRadius: 10, padding: 4,
  }}>
    {MODES.filter((m) => available.includes(m.id)).map((m) => (
      <button
        key={m.id}
        onClick={() => onChange(m.id)}
        title={m.label}
        style={{
          padding: "5px 10px",
          border: "none",
          borderRadius: 7,
          cursor: "pointer",
          fontSize: 15,
          background: mode === m.id ? "var(--primary)" : "transparent",
          color: mode === m.id ? "white" : "var(--text-secondary)",
          transition: "all 0.15s",
          fontWeight: mode === m.id ? 700 : 400,
        }}
      >
        {m.icon}
      </button>
    ))}
  </div>
);

/**
 * ViewContainer — renders children in the selected layout
 * Wraps children with appropriate CSS class.
 */
export const ViewContainer = ({ mode, children }) => {
  const layouts = {
    grid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
    list:    { display: "flex", flexDirection: "column", gap: 12 },
    card:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 },
    table:   { display: "block" },
    compact: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 },
    large:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 },
  };

  return (
    <div style={layouts[mode] || layouts.grid}>
      {children}
    </div>
  );
};

export default ViewModeToggle;
