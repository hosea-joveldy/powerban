import { useState } from "react";
import { Link } from "react-router-dom";
import { progressBar } from "../progress.js";

export default function BoardTile({ board, onSaveAsTemplate, onDelete }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={`board-tile ${dragging ? "is-dragging" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/board-id", String(board.id));
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
    >
      <div className="board-tile-header">
        <Link to={`/boards/${board.id}`} className="board-tile-title">
          <span className="drag-handle-icon" title="Drag board to move into group or standalone" style={{ cursor: "grab", marginRight: "6px", opacity: 0.6 }}>
            ⠿
          </span>
          {board.name}
        </Link>
      </div>

      <div className="board-tile-progress">
        <div className="progress-track" aria-hidden="true">
          <div
            className="progress-fill"
            style={{ width: `${board.progress.percent}%` }}
          />
        </div>
        <div className="progress-metrics">
          <span className="progress">
            <span className="bar">{progressBar(board.progress.percent)}</span>{" "}
            {board.progress.percent}%
          </span>
          <span>{board.progress.done}/{board.progress.total} tasks</span>
        </div>
      </div>

      <div className="board-tile-actions">
        <button
          className="tile-action-btn"
          onClick={() => onSaveAsTemplate(board)}
        >
          save as template
        </button>
        <button
          className="tile-action-btn danger danger-text"
          onClick={() => onDelete(board)}
        >
          delete
        </button>
      </div>
    </div>
  );
}
