import { useState, useRef, useEffect } from "react";
import { Check, X, MoreVertical, Maximize2 } from "lucide-react";
import TaskItem from "./TaskItem.jsx";

export default function CardColumn({
  card,
  boards,
  onDrop,
  onAddTask,
  onAddNestedTask,
  onDeleteCard,
  onDeleteTask,
  onChangeCardType,
  onSetWipLimit,
  onReorderCard,
  onOpenTaskDetail,
  onDragStart,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVertical, setIsVertical] = useState(false);
  const menuRef = useRef(null);

  const count = card.tasks.length;
  const atLimit = card.wip_limit !== null && count >= card.wip_limit;
  const isCompletedType = card.card_type === "completed";

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function submitTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(card.id, title.trim());
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      className={`card-column ${isVertical ? "is-vertical" : ""} ${dragOver ? "drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const dragType = e.dataTransfer.getData("powerban-drag-type");
        if (dragType === "card") {
          const sourceCardId = e.dataTransfer.getData("text/card-id");
          if (sourceCardId && Number(sourceCardId) !== card.id) {
            onReorderCard?.(Number(sourceCardId), card.id);
            return;
          }
        }
        onDrop(e);
      }}
    >
      <header className="card-column-header">
        <div className="card-column-title-group">
          <span
            className="card-drag-handle"
            draggable
            title="Drag card to reorder columns"
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData("text/card-id", String(card.id));
              e.dataTransfer.setData("powerban-drag-type", "card");
              e.dataTransfer.effectAllowed = "move";
            }}
          >
            ⠿
          </span>

          <h3
            className={`card-column-title ${isVertical ? "vertical-title" : ""}`}
            onClick={() => isVertical && setIsVertical(false)}
            title={isVertical ? "Click to expand card horizontally" : undefined}
          >
            {card.name}
          </h3>

          {!isVertical && card.wip_limit !== null && (
            <span
              className={`wip-indicator-pill ${atLimit ? "at-limit" : ""}`}
              title={atLimit ? "WIP limit reached" : `WIP limit: ${card.wip_limit}`}
            >
              {count}/{card.wip_limit}
            </span>
          )}

          {!isVertical && (
            <span className={`card-type-tag type-${card.card_type}`} title={`Card type: ${card.card_type}`}>
              {card.card_type}
            </span>
          )}
        </div>

        <div className="card-column-actions" ref={menuRef}>
          {isVertical && (
            <button
              className="action-expand-btn"
              title="Expand card horizontally"
              aria-label="Expand card horizontally"
              onClick={() => setIsVertical(false)}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}
            >
              <Maximize2 size={13} />
            </button>
          )}

          {/* Direct Delete button */}
          <button
            className="icon-btn"
            style={{ fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            title="Delete card column"
            aria-label="Delete card column"
            onClick={() => onDeleteCard(card)}
          >
            <X size={13} />
          </button>

          {/* Three dots button */}
          <button
            className="three-dots-btn"
            title="Card options"
            aria-label="Card options"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <div className="card-dropdown-menu" role="menu">
              <div className="menu-group-label">Card Type</div>
              <button
                className={`menu-item ${card.card_type === "normal" ? "active" : ""}`}
                role="menuitem"
                onClick={() => {
                  onChangeCardType(card, "normal");
                  setMenuOpen(false);
                }}
              >
                {card.card_type === "normal" && <Check size={13} style={{ marginRight: 6 }} />}
                Normal
              </button>
              <button
                className={`menu-item ${card.card_type === "completed" ? "active" : ""}`}
                role="menuitem"
                onClick={() => {
                  onChangeCardType(card, "completed");
                  setMenuOpen(false);
                }}
              >
                {card.card_type === "completed" && <Check size={13} style={{ marginRight: 6 }} />}
                Completed
              </button>

              <div className="menu-divider" />

              {/* Set WIP Limit */}
              <button
                className="menu-item"
                role="menuitem"
                disabled={isCompletedType}
                title={isCompletedType ? "WIP limit is not available for completed cards" : undefined}
                onClick={() => {
                  setMenuOpen(false);
                  onSetWipLimit(card);
                }}
              >
                {card.wip_limit ? `Change WIP Limit (${card.wip_limit})` : "Set WIP Limit..."}
              </button>

              <div className="menu-divider" />

              {/* Add Task as a Card / Add Task as a Board */}
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onAddNestedTask(card.id, "card");
                }}
              >
                + Add Task as a Card
              </button>

              <button
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onAddNestedTask(card.id, "board");
                }}
              >
                + Add Task as a Board
              </button>

              <div className="menu-divider" />

              {/* Turn vertically & hide tasks */}
              <button
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setIsVertical((v) => !v);
                  setMenuOpen(false);
                }}
              >
                {isVertical ? "Restore card horizontally" : "Turn vertically & hide tasks"}
              </button>

              <div className="menu-divider" />

              {/* Delete Card */}
              <button
                className="menu-item danger"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteCard(card);
                }}
              >
                Delete Card
              </button>
            </div>
          )}
        </div>
      </header>

      {!isVertical && (
        <>
          <div className="tasks-container">
            {card.tasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                boards={boards}
                locked={isCompletedType}
                onDelete={onDeleteTask}
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
        </>
      )}
    </div>
  );
}
