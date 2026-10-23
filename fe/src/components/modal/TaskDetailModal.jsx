import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
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
  const [subitems, setSubitems] = useState([]);
  const [newSubitem, setNewSubitem] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setLinkedBoardId(task.linked_board_id != null ? String(task.linked_board_id) : "");
      setSubitems(Array.isArray(task.subitems) ? [...task.subitems] : []);
      setNewSubitem("");
      setIsFinished(Boolean(task.is_finished));
      setIsDeleting(false);
      setSaving(false);
      setError(null);
    }
  }, [isOpen, task]);

  if (!task) return null;

  const isNested = task.item_type === "card" || task.item_type === "board";
  const entityLabel = task.item_type === "board" ? "Board" : "Card";
  const availableBoards = (boards || []).filter(
    (b) => !b.is_template && b.id !== currentBoardId
  );

  const selectedBoard = linkedBoardId
    ? (boards || []).find((b) => String(b.id) === String(linkedBoardId))
    : null;

  const addSubitem = (e) => {
    e.preventDefault();
    if (!newSubitem.trim()) return;
    setSubitems([...subitems, newSubitem.trim()]);
    setNewSubitem("");
  };

  const removeSubitem = (idx) => {
    setSubitems(subitems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        id: task.id,
        title: title.trim(),
        description: description.trim(),
        linked_board_id: linkedBoardId === "" ? null : Number(linkedBoardId),
        is_finished: locked ? true : isFinished,
      };
      if (task.item_type !== undefined) {
        payload.item_type = task.item_type;
      }
      if (task.subitems !== undefined || (Array.isArray(subitems) && subitems.length > 0)) {
        payload.subitems = subitems;
      }
      await onSave(payload);
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
      title={isNested ? `${entityLabel} Details` : "Task Details"}
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
            placeholder="Title"
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
            rows={3}
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
            <option value="">(None)</option>
            {availableBoards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {selectedBoard && (
            <div className="linked-board-preview" style={{ marginTop: "var(--space-2)", fontSize: "var(--text-xs)" }}>
              <span className="mono">
                → {selectedBoard.name}{" "}
                {selectedBoard.progress && (
                  <>
                    {progressBar(selectedBoard.progress.percent, 3)}{" "}
                    {selectedBoard.progress.percent}%
                  </>
                )}
              </span>
              {" "}
              <Link
                to={`/boards/${selectedBoard.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "var(--text-xs)", textDecoration: "underline", marginLeft: "var(--space-2)" }}
              >
                Open board ↗
              </Link>
            </div>
          )}
        </div>

        <div className="modal-field modal-field-checkbox" style={{ display: "flex", alignItems: "center", gap: "8px", margin: "var(--space-2) 0" }}>
          <label className="checkbox-label" htmlFor="task-finished-checkbox" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: locked ? "not-allowed" : "pointer" }}>
            <input
              id="task-finished-checkbox"
              type="checkbox"
              checked={locked ? true : isFinished}
              disabled={locked}
              onChange={(e) => setIsFinished(e.target.checked)}
            />
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>Mark as Completed</span>
          </label>
          {locked && (
            <span className="field-hint" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              (Locked in Completed column)
            </span>
          )}
        </div>

        {/* Nested Child Items Manager for Card or Board Tasks */}
        {isNested && (
          <div className="modal-field" style={{ background: "var(--bg-surface-subtle)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <span className="modal-field-label" style={{ margin: 0 }}>
                Child Items in this {entityLabel} ({subitems.length})
              </span>
              <span
                className={`section-count-badge ${subitems.length === 0 ? "is-empty" : ""}`}
                style={{ fontSize: "var(--text-xs)", color: subitems.length === 0 ? "var(--success)" : "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 3 }}
              >
                {subitems.length === 0 ? <>Empty <Check size={11} /> Ready for Completed</> : `${subitems.length} remaining`}
              </span>
            </div>

            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "0 0 var(--space-2) 0" }}>
              Rule: A nested {entityLabel.toLowerCase()} cannot be moved to Completed while child items remain. Remove or clear all items to complete it.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "var(--space-2)", maxHeight: "140px", overflowY: "auto" }}>
              {subitems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--bg-surface)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <span>• {item}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ fontSize: "12px", color: "var(--danger)" }}
                    onClick={() => removeSubitem(idx)}
                    title="Remove item"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {subitems.length === 0 && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontStyle: "italic", padding: "4px 0" }}>
                  No child items. This {entityLabel.toLowerCase()} is empty.
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <input
                type="text"
                className="modal-input"
                style={{ padding: "6px 10px", fontSize: "var(--text-xs)" }}
                value={newSubitem}
                onChange={(e) => setNewSubitem(e.target.value)}
                placeholder={`Add item to ${entityLabel.toLowerCase()}...`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubitem(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn-pill-secondary btn-xs"
                onClick={addSubitem}
                style={{ whiteSpace: "nowrap" }}
              >
                + add
              </button>
            </div>
          </div>
        )}

        <div
          className="modal-footer"
          style={{
            justifyContent: "space-between",
            marginTop: "var(--space-4)",
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
                Delete {isNested ? entityLabel : "Task"}
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
