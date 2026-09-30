import { Link } from "react-router-dom";
import { progressBar } from "../progress.js";

export default function BoardTile({ board, onSaveAsTemplate, onDelete }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--bg-pane)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        minWidth: 200,
      }}
    >
      <Link to={`/boards/${board.id}`} style={{ color: "var(--text)", fontWeight: 600 }}>
        {board.name}
      </Link>
      <div className="progress">
        <span className="bar">{progressBar(board.progress.percent)}</span>{" "}
        {board.progress.percent}% ({board.progress.done}/{board.progress.total})
      </div>
      <div style={{ display: "flex", gap: "var(--space-1)", marginTop: "var(--space-1)" }}>
        <button style={{ fontSize: 12 }} onClick={() => onSaveAsTemplate(board)}>
          save as template
        </button>
        <button className="danger-text" style={{ fontSize: 12 }} onClick={() => onDelete(board)}>
          delete
        </button>
      </div>
    </div>
  );
}
