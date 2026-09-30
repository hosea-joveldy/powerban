export default function TemplateTile({ template, onUse }) {
  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius)",
        padding: "var(--space-3)",
        minWidth: 200,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <div style={{ fontWeight: 600 }}>{template.name}</div>
      <button className="primary" style={{ fontSize: 12 }} onClick={() => onUse(template)}>
        use template
      </button>
    </div>
  );
}
