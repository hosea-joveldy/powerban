import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useModal } from "../components/modal/index.js";
import TopBar from "../components/TopBar.jsx";
import BoardTile from "../components/BoardTile.jsx";
import TemplateTile from "../components/TemplateTile.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const modal = useModal();
  const [groups, setGroups] = useState([]);
  const [boards, setBoards] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [g, b, t] = await Promise.all([
        api.get("/groups"),
        api.get("/boards"),
        api.get("/templates"),
      ]);
      setGroups(g);
      setBoards(b);
      setTemplates(t);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const standalone = boards.filter((b) => !b.group_id);
  const byGroup = (groupId) => boards.filter((b) => b.group_id === groupId);

  async function newGroup() {
    const name = await modal.showPrompt({
      title: "New Group",
      label: "Group Name",
      placeholder: "e.g. Work, Personal",
      confirmText: "Create Group",
    });
    if (!name || !name.trim()) return;
    try {
      await api.post("/groups", { name: name.trim() });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Creating Group", message: err.message });
    }
  }

  async function newBoard(groupId) {
    const name = await modal.showPrompt({
      title: "New Board",
      label: "Board Name",
      placeholder: "e.g. Sprint Backlog",
      confirmText: "Create Board",
    });
    if (!name || !name.trim()) return;
    try {
      await api.post("/boards", { name: name.trim(), group_id: groupId ?? null });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Creating Board", message: err.message });
    }
  }

  async function saveAsTemplate(board) {
    const name = await modal.showPrompt({
      title: "Save as Template",
      label: "Template Name",
      defaultValue: `${board.name} (template)`,
      confirmText: "Save Template",
    });
    if (!name || !name.trim()) return;
    try {
      await api.post(`/boards/${board.id}/save-as-template`, { name: name.trim() });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Saving Template", message: err.message });
    }
  }

  async function deleteBoard(board) {
    const confirmed = await modal.showConfirm({
      title: "Delete Board",
      message: `Delete "${board.name}"? This cannot be undone.`,
      confirmText: "Delete Board",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await api.delete(`/boards/${board.id}`);
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Deleting Board", message: err.message });
    }
  }

  async function useTemplate(template) {
    const name = await modal.showPrompt({
      title: "Create from Template",
      label: "Board Name",
      defaultValue: template.name,
      confirmText: "Create Board",
    });
    if (!name || !name.trim()) return;
    try {
      const board = await api.post(`/boards/from-template/${template.id}`, { name: name.trim() });
      navigate(`/boards/${board.id}`);
    } catch (err) {
      await modal.showAlert({ title: "Error Creating Board", message: err.message });
    }
  }

  return (
    <div className="page">
      <TopBar />
      <div className="page-main" style={{ padding: "var(--space-5)" }}>
        {error && <div className="error-text" style={{ marginBottom: "var(--space-3)" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>boards</h2>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button onClick={newGroup}>+ group</button>
            <button className="primary" onClick={() => newBoard(null)}>
              + board
            </button>
          </div>
        </div>

        {groups.map((g) => (
          <section key={g.id} style={{ marginTop: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0, color: "var(--text-dim)" }}>{g.name}</h3>
              <button style={{ fontSize: 12 }} onClick={() => newBoard(g.id)}>
                + board here
              </button>
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
              {byGroup(g.id).map((b) => (
                <BoardTile key={b.id} board={b} onSaveAsTemplate={saveAsTemplate} onDelete={deleteBoard} />
              ))}
              {byGroup(g.id).length === 0 && (
                <span style={{ color: "var(--text-dim)", fontSize: 13 }}>No boards here yet.</span>
              )}
            </div>
          </section>
        ))}

        <section style={{ marginTop: "var(--space-5)" }}>
          <h3 style={{ margin: 0, color: "var(--text-dim)" }}>standalone</h3>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
            {standalone.map((b) => (
              <BoardTile key={b.id} board={b} onSaveAsTemplate={saveAsTemplate} onDelete={deleteBoard} />
            ))}
            {standalone.length === 0 && (
              <span style={{ color: "var(--text-dim)", fontSize: 13 }}>No standalone boards.</span>
            )}
          </div>
        </section>

        {templates.length > 0 && (
          <section style={{ marginTop: "var(--space-5)" }}>
            <h3 style={{ margin: 0, color: "var(--text-dim)" }}>templates</h3>
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginTop: "var(--space-2)" }}>
              {templates.map((t) => (
                <TemplateTile key={t.id} template={t} onUse={useTemplate} />
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="statusline">
        <span>{boards.length} boards</span>
        <span>{groups.length} groups</span>
        <span>{templates.length} templates</span>
      </div>
    </div>
  );
}
