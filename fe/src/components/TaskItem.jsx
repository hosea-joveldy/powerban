import { useState } from "react";
import { Check, X } from "lucide-react";

export default function TaskItem({
  task,
  boards = [],
  locked,
  onDelete,
  onOpenDetail,
  onDragStart,
}) {
  const isFinished = task.is_finished || locked;
  const subitemCount = Array.isArray(task.subitems) ? task.subitems.length : 0;
  const isEmpty = subitemCount === 0;
  const linkedBoard = task.linked_board || (task.linked_board_id ? boards.find((b) => Number(b.id) === Number(task.linked_board_id)) : null);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/task-id", String(task.id));
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.setData("powerban-drag-type", "task");
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(e, task.id);
      }}
      onClick={() => onOpenDetail?.(task)}
      className={`task-card ${isFinished ? "is-finished" : ""}`}
    >
      <div className="task-card-content">
        {isFinished && (
          <span className="task-done-badge" title="Completed automatically in a completed card">
            <Check size={12} />
          </span>
        )}

        <div className="task-details">
          <div className="task-card-title">
            {task.title}
          </div>

          {task.description && (
            <div className="task-card-desc">
              {task.description}
            </div>
          )}

          {linkedBoard && (
            <div className="task-linked-badge" style={{ fontSize: "var(--text-xs)", color: "var(--accent)", marginTop: "4px" }}>
              → {linkedBoard.name}
            </div>
          )}

          {/* Nested Card or Board Indicator */}
          {task.item_type === "card" && (
            <div className="nested-item-badge card-badge">
              <span className="badge-type">[Nested Card]</span>
              <span className={`badge-count ${isEmpty ? "is-empty" : ""}`}>
                {isEmpty ? <>0 items (Empty <Check size={11} style={{ verticalAlign: "-1px" }} />)</> : `${subitemCount} item(s)`}
              </span>
            </div>
          )}

          {task.item_type === "board" && (
            <div className="nested-item-badge board-badge">
              <span className="badge-type">[Board]</span>
              <span className={`badge-count ${isEmpty ? "is-empty" : ""}`}>
                {isEmpty ? <>0 items (Empty <Check size={11} style={{ verticalAlign: "-1px" }} />)</> : `${subitemCount} item(s)`}
              </span>
            </div>
          )}
        </div>

        <div className="task-card-actions">
          <button
            className="icon-btn"
            style={{ fontSize: 13 }}
            title="Delete task"
            aria-label="Delete task"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
