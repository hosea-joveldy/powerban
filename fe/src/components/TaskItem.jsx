import { useState } from "react";
import { Link } from "react-router-dom";
import { progressBar } from "../progress.js";

export default function TaskItem({
  task,
  boards,
  locked,
  onToggle,
  onDelete,
  onLink,
  onOpenDetail,
  onDragStart,
}) {
  const [linking, setLinking] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onOpenDetail?.(task)}
      className={`task-card ${task.is_finished ? "is-finished" : ""}`}
    >
      <div className="task-card-content">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.is_finished}
          disabled={locked}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          onClick={(e) => e.stopPropagation()}
          title={locked ? "Finished automatically in a completed card" : "Mark finished"}
        />
        <div className="task-details">
          <div className="task-card-title">
            {task.title}
          </div>
          {task.description && (
            <div className="task-card-desc">
              {task.description}
            </div>
          )}
          {task.linked_board && (
            <Link
              to={`/boards/${task.linked_board.id}`}
              className="linked-board-badge"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span>→ {task.linked_board.name}</span>
              <span className="mono">
                {progressBar(task.linked_board.progress.percent, 3)}{" "}
                {task.linked_board.progress.percent}%
              </span>
            </Link>
          )}
        </div>
        <div className="task-card-actions">
          <button
            className="icon-btn"
            style={{ fontSize: 12 }}
            title="Link to another board"
            aria-label="Link to another board"
            onClick={(e) => {
              e.stopPropagation();
              setLinking((v) => !v);
            }}
          >
            🔗
          </button>
          <button
            className="icon-btn"
            style={{ fontSize: 12 }}
            title="Delete task"
            aria-label="Delete task"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
          >
            ×
          </button>
        </div>
      </div>
      {linking && (
        <select
          autoFocus
          className="modal-select"
          defaultValue={task.linked_board_id ?? ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            const v = e.target.value;
            onLink(task, v === "" ? null : Number(v));
            setLinking(false);
          }}
          style={{ marginTop: "var(--space-2)", width: "100%", fontSize: "var(--text-xs)" }}
        >
          <option value="">(no link)</option>
          {boards
            .filter((b) => b.id !== task.board_id && !b.is_template)
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
