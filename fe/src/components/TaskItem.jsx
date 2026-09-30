import { useState } from "react";
import { Link } from "react-router-dom";
import { progressBar } from "../progress.js";

export default function TaskItem({ task, boards, locked, onToggle, onDelete, onLink, onDragStart }) {
  const [linking, setLinking] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--bg)",
        padding: "var(--space-2)",
        marginBottom: "var(--space-2)",
        cursor: "grab",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
        <input
          type="checkbox"
          checked={task.is_finished}
          disabled={locked}
          onChange={() => onToggle(task)}
          title={locked ? "Finished automatically in a completed card" : "Mark finished"}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              textDecoration: task.is_finished ? "line-through" : "none",
              color: task.is_finished ? "var(--text-dim)" : "var(--text)",
              wordBreak: "break-word",
            }}
          >
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
              {task.description}
            </div>
          )}
          {task.linked_board && (
            <Link
              to={`/boards/${task.linked_board.id}`}
              className="mono"
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 11,
                padding: "1px 6px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-dim)",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              → {task.linked_board.name} {progressBar(task.linked_board.progress.percent, 3)}{" "}
              {task.linked_board.progress.percent}%
            </Link>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button
            className="icon-btn"
            style={{ fontSize: 12 }}
            title="Link to another board"
            onClick={() => setLinking((v) => !v)}
          >
            🔗
          </button>
          <button
            className="icon-btn"
            style={{ fontSize: 12 }}
            title="Delete task"
            onClick={() => onDelete(task)}
          >
            ×
          </button>
        </div>
      </div>
      {linking && (
        <select
          autoFocus
          defaultValue={task.linked_board_id ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onLink(task, v === "" ? null : Number(v));
            setLinking(false);
          }}
          style={{ marginTop: "var(--space-2)", width: "100%" }}
        >
          <option value="">(no link)</option>
          {boards
            .filter((b) => b.id !== task.board_id)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
}
