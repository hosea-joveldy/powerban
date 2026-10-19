export default function TemplateTile({ template, onUse }) {
  return (
    <div className="template-tile">
      <div className="template-tile-header">
        <span className="template-badge">Template</span>
        <div className="template-title">{template.name}</div>
      </div>
      <div>
        <button
          className="btn-pill-primary btn-sm primary"
          onClick={() => onUse(template)}
        >
          use template
        </button>
      </div>
    </div>
  );
}
