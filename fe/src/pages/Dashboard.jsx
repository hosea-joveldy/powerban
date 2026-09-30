import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import TopBar from "../components/TopBar.jsx";
import BoardTile from "../components/BoardTile.jsx";
import TemplateTile from "../components/TemplateTile.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
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
    const name = prompt("Group name:");
    if (!name) return;
    await api.post("/groups", { name });
    load();
  }

  async function newBoard(groupId) {
    const name = prompt("Board name:");
    if (!name) return;
    await api.post("/boards", { name, group_id: groupId ?? null });
    load();
  }

  async function saveAsTemplate(board) {
    const name = prompt("Template name:", `${board.name} (template)`);
    if (!name) return;
    await api.post(`/boards/${board.id}/save-as-template`, { name });
    load();
  }

  async function deleteBoard(board) {
    if (!confirm(`Delete "${board.name}"? This cannot be undone.`)) return;
    await api.delete(`/boards/${board.id}`);
    load();
  }

  async function useTemplate(template) {
    const name = prompt("New board name:", template.name);
    if (!name) return;
    const board = await api.post(`/boards/from-template/${template.id}`, { name });
    navigate(`/boards/${board.id}`);
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
