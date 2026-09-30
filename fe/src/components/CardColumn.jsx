import { useState } from "react";
import TaskItem from "./TaskItem.jsx";

export default function CardColumn({ card, boards, onDrop, onAddTask, onDeleteCard, onDeleteTask, onToggleTask, onLinkTask, onDragStart }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const count = card.tasks.length;
  const atLimit = card.wip_limit !== null && count >= card.wip_limit;

  function submitTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(card.id, title.trim());
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(e);
      }}
      style={{
        width: 260,
        flexShrink: 0,
        border: `1px solid ${dragOver ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        background: "var(--bg-pane)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="mono" style={{ fontWeight: 600, textTransform: "uppercase", fontSize: 12 }}>
          {card.name}
        </span>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {card.wip_limit !== null && (
            <span
              className="mono"
              style={{ fontSize: 11, color: atLimit ? "var(--danger)" : "var(--text-dim)" }}
            >
              {count}/{card.wip_limit}
            </span>
          )}
          <button className="icon-btn" style={{ fontSize: 12 }} onClick={() => onDeleteCard(card)}>
            ×
          </button>
        </div>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "var(--space-2) 0" }} />

      <div style={{ flex: 1, minHeight: 40 }}>
        {card.tasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            boards={boards}
            locked={card.card_type === "completed"}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onLink={onLinkTask}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      {adding ? (
        <form onSubmit={submitTask} style={{ display: "flex", gap: 4, marginTop: "var(--space-2)" }}>
          <input
            autoFocus
            placeholder="task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => !title && setAdding(false)}
            style={{ flex: 1 }}
          />
        </form>
      ) : (
        <button
          style={{ fontSize: 12, marginTop: "var(--space-2)", background: "transparent", borderStyle: "dashed" }}
          onClick={() => setAdding(true)}
          disabled={atLimit}
          title={atLimit ? "WIP limit reached" : undefined}
        >
          + add task
        </button>
      )}
    </div>
  );
}
