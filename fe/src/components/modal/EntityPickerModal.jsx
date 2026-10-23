import { useState, useEffect } from "react";
import { Search, Folder, Layout, Check } from "lucide-react";
import Modal from "./Modal.jsx";
import { api } from "../../api.js";

export default function EntityPickerModal({
  isOpen,
  onClose,
  onSelect,
  entityType = "card",
  currentBoardId,
  triggerElement,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const isCard = entityType === "card";
  const entityLabel = isCard ? "Card" : "Board";

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    setError(null);
    setSelectedId(null);
    setSearch("");

    async function fetchData() {
      try {
        if (isCard) {
          const res = await api.get("/cards");
          if (active) setItems(Array.isArray(res) ? res : []);
        } else {
          const res = await api.get("/boards");
          const boards = Array.isArray(res) ? res.filter((b) => !b.is_template) : [];
          if (active) setItems(boards);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load options");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [isOpen, isCard]);

  const query = search.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const nameMatch = (item.name || "").toLowerCase().includes(query);
    const boardMatch = isCard ? (item.board_name || "").toLowerCase().includes(query) : false;
    return nameMatch || boardMatch;
  });

  const selectedItem = items.find((i) => i.id === selectedId);

  const handleConfirm = () => {
    if (!selectedItem) return;
    onSelect(selectedItem);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Task as Existing ${entityLabel}`}
      triggerElement={triggerElement}
      className="entity-picker-modal"
    >
      <div className="picker-modal-content" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          {isCard
            ? "Search and select an existing card from any of your boards. Child tasks inside the card will be added as checklist items."
            : "Search and select an existing board from your workspace to link as a task."}
        </p>

        {/* Search input */}
        <div className="picker-search-bar" style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="modal-input"
            placeholder={`Search ${entityLabel.toLowerCase()} by name${isCard ? " or board..." : "..."}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
            autoFocus
          />
        </div>

        {/* List of matching entities */}
        <div
          className="picker-items-list"
          style={{
            minHeight: "180px",
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "2px",
          }}
          role="listbox"
          aria-label={`Matching ${entityLabel}s`}
        >
          {loading && (
            <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              Loading available {entityLabel.toLowerCase()}s...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "var(--space-3)", color: "var(--danger)", fontSize: "var(--text-sm)" }}>
              {error}
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              {search ? `No ${entityLabel.toLowerCase()}s matching "${search}"` : `No available ${entityLabel.toLowerCase()}s found.`}
            </div>
          )}

          {!loading && !error && filteredItems.map((item) => {
            const isSelected = item.id === selectedId;
            const isCurrent = !isCard && currentBoardId && Number(item.id) === Number(currentBoardId);

            return (
              <div
                key={item.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => {
                  setSelectedId(item.id);
                  onSelect(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(item.id);
                  }
                }}
                className={`picker-item-row ${isSelected ? "is-selected" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  outline: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  {isCard ? (
                    <Folder size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  ) : (
                    <Layout size={16} style={{ color: "var(--accent-lime)", flexShrink: 0 }} />
                  )}

                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                        {item.name}
                      </span>

                      {/* Display which board it is from */}
                      {isCard && item.board_name && (
                        <span
                          className="picker-board-badge"
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            padding: "1px 6px",
                            borderRadius: "var(--radius-xs)",
                            background: "var(--bg-surface-subtle)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          from board: {item.board_name}
                        </span>
                      )}

                      {!isCard && isCurrent && (
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "1px 6px",
                            borderRadius: "var(--radius-xs)",
                            background: "var(--bg-surface-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          (Current Board)
                        </span>
                      )}
                    </div>

                    {/* Metadata line: subitems count or board progress */}
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                      {isCard
                        ? `${item.task_titles?.length || 0} task(s) inside`
                        : `${item.progress?.total || 0} task(s) · ${item.progress?.percent || 0}% completed`}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check size={16} style={{ color: "var(--accent)", flexShrink: 0, marginLeft: 8 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedItem}
            onClick={handleConfirm}
          >
            Add as Task
          </button>
        </div>
      </div>
    </Modal>
  );
}
