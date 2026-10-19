import { useState } from "react";
import TaskItem from "./TaskItem.jsx";

export default function CardColumn({
  card,
  boards,
  onDrop,
  onAddTask,
  onDeleteCard,
  onDeleteTask,
  onToggleTask,
  onLinkTask,
  onOpenTaskDetail,
  onDragStart,
}) {
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
      className={`card-column ${dragOver ? "drag-over" : ""}`}
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
    >
      <header className="card-column-header">
        <div className="card-column-title-group">
          <h3 className="card-column-title">{card.name}</h3>
          {card.wip_limit !== null && (
            <span
              className={`wip-indicator-pill ${atLimit ? "at-limit" : ""}`}
              title={atLimit ? "WIP limit reached" : `WIP limit: ${card.wip_limit}`}
            >
              {count}/{card.wip_limit}
            </span>
          )}
        </div>
        <div className="card-column-actions">
          <button
            className="icon-btn"
            style={{ fontSize: 12 }}
            title="Delete card column"
            aria-label="Delete card column"
            onClick={() => onDeleteCard(card)}
          >
            ×
          </button>
        </div>
      </header>

      <div className="tasks-container">
        {card.tasks.map((t) => (
          <TaskItem
            key={t.id}
            task={t}
            boards={boards}
            locked={card.card_type === "completed"}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onLink={onLinkTask}
            onOpenDetail={onOpenTaskDetail}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      {adding ? (
        <form onSubmit={submitTask} className="add-task-form">
          <input
            autoFocus
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => !title && setAdding(false)}
            className="add-task-input"
          />
        </form>
      ) : (
        <button
          className="btn-add-task"
          onClick={() => setAdding(true)}
          disabled={atLimit}
          title={atLimit ? `WIP limit reached (${count}/${card.wip_limit})` : undefined}
        >
          + add task
        </button>
      )}
    </div>
  );
}
