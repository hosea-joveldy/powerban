import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "./Modal.jsx";
import { progressBar } from "../../progress.js";

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  boards = [],
  currentBoardId,
  locked = false,
  onSave,
  onDelete,
  triggerElement,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkedBoardId, setLinkedBoardId] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setLinkedBoardId(task.linked_board_id !== null && task.linked_board_id !== undefined ? String(task.linked_board_id) : "");
      setIsFinished(Boolean(task.is_finished));
      setIsDeleting(false);
      setSaving(false);
      setError(null);
    }
  }, [isOpen, task]);

  if (!task) return null;

  const availableBoards = (boards || []).filter(
    (b) => b.id !== currentBoardId && !b.is_template
  );

  const selectedBoard = linkedBoardId
    ? (boards || []).find((b) => String(b.id) === String(linkedBoardId))
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        id: task.id,
        title: title.trim(),
        description: description.trim(),
        linked_board_id: linkedBoardId === "" ? null : Number(linkedBoardId),
        is_finished: locked ? true : isFinished,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(task);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      triggerElement={triggerElement}
      className="task-detail"
    >
      <form onSubmit={handleSubmit} className="modal-body" style={{ margin: 0 }}>
        {error && <div className="error-text">{error}</div>}

        <div className="modal-field">
          <label className="modal-field-label" htmlFor="task-title-input">
            Title
          </label>
          <input
            id="task-title-input"
            type="text"
            className="modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label className="modal-field-label" htmlFor="task-desc-input">
            Description
          </label>
          <textarea
            id="task-desc-input"
            className="modal-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details, notes, or acceptance criteria..."
            rows={4}
          />
        </div>

        <div className="modal-field">
          <label className="modal-field-label" htmlFor="task-linked-board">
            Linked Board
          </label>
          <select
            id="task-linked-board"
            className="modal-select"
            value={linkedBoardId}
            onChange={(e) => setLinkedBoardId(e.target.value)}
          >
            <option value="">(None - standalone task)</option>
            {availableBoards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {selectedBoard && (
            <div className="linked-board-preview">
              <span className="mono">
                → {selectedBoard.name}{" "}
                {selectedBoard.progress && (
                  <>
                    {progressBar(selectedBoard.progress.percent, 3)}{" "}
                    {selectedBoard.progress.percent}%
                  </>
                )}
              </span>
              <Link
                to={`/boards/${selectedBoard.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "var(--text-xs)", textDecoration: "underline" }}
              >
                Open board ↗
              </Link>
            </div>
          )}
        </div>

        <div className="modal-field" style={{ marginTop: "var(--space-1)" }}>
          <label className="modal-checkbox-row">
            <input
              type="checkbox"
              checked={locked ? true : isFinished}
              disabled={locked}
              onChange={(e) => setIsFinished(e.target.checked)}
            />
            <span style={{ fontSize: "var(--text-sm)" }}>
              Mark task as finished {locked && "(locked in completed column)"}
            </span>
          </label>
        </div>

        <div
          className="modal-footer"
          style={{
            justifyContent: "space-between",
            marginTop: "var(--space-3)",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "var(--space-3)",
          }}
        >
          <div>
            {onDelete && !isDeleting && (
              <button
                type="button"
                className="btn-pill-secondary"
                style={{
                  color: "var(--danger)",
                  borderColor: "var(--danger-surface)",
                }}
                onClick={() => setIsDeleting(true)}
              >
                Delete Task
              </button>
            )}
            {onDelete && isDeleting && (
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--danger)" }}>
                  Confirm deletion?
                </span>
                <button
                  type="button"
                  className="btn-pill-primary danger"
                  style={{ padding: "6px 14px", fontSize: "var(--text-xs)" }}
                  onClick={handleDelete}
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  className="btn-pill-secondary"
                  style={{ padding: "6px 14px", fontSize: "var(--text-xs)" }}
                  onClick={() => setIsDeleting(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="btn-pill-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary"
              disabled={saving || !title.trim()}
            >
              {saving ? "Saving..." : "Save Changes"}
              <span className="btn-status-dot" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
