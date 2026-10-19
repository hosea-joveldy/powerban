import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useModal } from "../components/modal/index.js";
import TopBar from "../components/TopBar.jsx";
import BoardTile from "../components/BoardTile.jsx";
import TemplateTile from "../components/TemplateTile.jsx";
import "./dashboard.css";

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
    <div className="dashboard-page page">
      <TopBar />
      <main className="dashboard-container page-main">
        {error && <div className="error-text" style={{ marginBottom: "var(--space-4)" }}>{error}</div>}

        <header className="dashboard-header">
          <div className="dashboard-title-area">
            <h1 className="dashboard-title">boards</h1>
            <p className="dashboard-subtitle">Workspaces and project kanbans</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn-pill-secondary btn-sm" onClick={newGroup}>
              + group
            </button>
            <button className="btn-pill-primary btn-sm primary" onClick={() => newBoard(null)}>
              + board
            </button>
          </div>
        </header>

        {groups.map((g) => {
          const groupBoards = byGroup(g.id);
          return (
            <section key={g.id} className="dashboard-section" aria-labelledby={`group-title-${g.id}`}>
              <div className="dashboard-section-header">
                <h2 id={`group-title-${g.id}`} className="dashboard-section-title">
                  {g.name}
                  <span className="section-count-badge">{groupBoards.length}</span>
                </h2>
                <button className="btn-pill-secondary btn-xs" onClick={() => newBoard(g.id)}>
                  + board here
                </button>
              </div>
              <div className="boards-grid">
                {groupBoards.map((b) => (
                  <BoardTile key={b.id} board={b} onSaveAsTemplate={saveAsTemplate} onDelete={deleteBoard} />
                ))}
                {groupBoards.length === 0 && (
                  <div className="empty-notice">No boards in this group yet.</div>
                )}
              </div>
            </section>
          );
        })}

        <section className="dashboard-section" aria-labelledby="section-title-standalone">
          <div className="dashboard-section-header">
            <h2 id="section-title-standalone" className="dashboard-section-title">
              standalone
              <span className="section-count-badge">{standalone.length}</span>
            </h2>
          </div>
          <div className="boards-grid">
            {standalone.map((b) => (
              <BoardTile key={b.id} board={b} onSaveAsTemplate={saveAsTemplate} onDelete={deleteBoard} />
            ))}
            {standalone.length === 0 && (
              <div className="empty-notice">No standalone boards.</div>
            )}
          </div>
        </section>

        {templates.length > 0 && (
          <section className="dashboard-section" aria-labelledby="section-title-templates">
            <div className="dashboard-section-header">
              <h2 id="section-title-templates" className="dashboard-section-title">
                templates
                <span className="section-count-badge">{templates.length}</span>
              </h2>
            </div>
            <div className="boards-grid">
              {templates.map((t) => (
                <TemplateTile key={t.id} template={t} onUse={useTemplate} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="statusline">
        <span>{boards.length} boards</span>
        <span>{groups.length} groups</span>
        <span>{templates.length} templates</span>
      </footer>
    </div>
  );
}
