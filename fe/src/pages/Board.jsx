import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api.js";
import { progressBar } from "../progress.js";
import TopBar from "../components/TopBar.jsx";
import CardColumn from "../components/CardColumn.jsx";

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [boards, setBoards] = useState([]); // for the link-to-board picker
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [b, all] = await Promise.all([api.get(`/boards/${id}`), api.get("/boards")]);
      setBoard(b);
      setBoards(all);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        navigate("/");
        return;
      }
      setError(err.message);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  function dragStart(e, taskId) {
    e.dataTransfer.setData("text/plain", String(taskId));
  }

  // Each column gets its own handler, closed over that card's id, so it can
  // read the dragged task's id straight off the drop event.
  function makeDropHandler(cardId) {
    return async (e) => {
      const taskId = e?.dataTransfer?.getData("text/plain");
      if (!taskId) return;
      try {
        await api.post(`/tasks/${taskId}/move`, { card_id: cardId });
        load();
      } catch (err) {
        alert(err.message);
      }
    };
  }

  async function addTask(cardId, title) {
    try {
      await api.post(`/cards/${cardId}/tasks`, { title });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteTask(task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await api.delete(`/tasks/${task.id}`);
    load();
  }

  async function toggleTask(task) {
    try {
      await api.patch(`/tasks/${task.id}`, { is_finished: !task.is_finished });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function linkTask(task, linkedBoardId) {
    try {
      await api.patch(`/tasks/${task.id}`, { linked_board_id: linkedBoardId });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function addCard() {
    const name = prompt("Card name:");
    if (!name) return;
    await api.post(`/boards/${id}/cards`, { name });
    load();
  }

  async function deleteCard(card) {
    if (!confirm(`Delete "${card.name}"?`)) return;
    try {
      await api.delete(`/cards/${card.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        if (confirm(`${err.message}\n\nDelete it and all its tasks?`)) {
          await api.delete(`/cards/${card.id}?force=1`);
        } else {
          return;
        }
      } else {
        alert(err.message);
        return;
      }
    }
    load();
  }

  if (error) {
    return (
      <div className="page">
        <TopBar />
        <div style={{ padding: "var(--space-5)" }} className="error-text">
          {error}
        </div>
      </div>
    );
  }
  if (!board) return null;

  return (
    <div className="page">
      <TopBar crumb={board.name} />
      <div
        className="page-main"
        style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", alignItems: "flex-start" }}
      >
        {board.cards.map((card) => (
          <CardColumn
            key={card.id}
            card={card}
            boards={boards}
            onDrop={makeDropHandler(card.id)}
            onDragStart={dragStart}
            onAddTask={addTask}
            onDeleteCard={deleteCard}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTask}
            onLinkTask={linkTask}
          />
        ))}
        <button
          onClick={addCard}
          style={{
            width: 140,
            flexShrink: 0,
            background: "transparent",
            borderStyle: "dashed",
            height: 40,
          }}
        >
          + add card
        </button>
      </div>
      <div className="statusline">
        <span>{board.name}</span>
        <span>
          {progressBar(board.progress.percent)} {board.progress.percent}%
        </span>
        <span>{board.progress.done}/{board.progress.total} tasks done</span>
      </div>
    </div>
  );
}
