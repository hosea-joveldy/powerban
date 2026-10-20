import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api.js";
import { progressBar } from "../progress.js";
import { useModal } from "../components/modal/index.js";
import TopBar from "../components/TopBar.jsx";
import CardColumn from "../components/CardColumn.jsx";
import "./board.css";

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const modal = useModal();
  const [board, setBoard] = useState(null);
  const [boards, setBoards] = useState([]);
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
    e.dataTransfer.setData("text/task-id", String(taskId));
    e.dataTransfer.setData("text/plain", String(taskId));
    e.dataTransfer.setData("powerban-drag-type", "task");
  }

  function makeDropHandler(cardId) {
    return async (e) => {
      const taskId = e?.dataTransfer?.getData("text/task-id") || e?.dataTransfer?.getData("text/plain");
      if (!taskId) return;

      const targetCard = board?.cards?.find((c) => c.id === cardId);
      if (targetCard && targetCard.card_type === "completed") {
        let draggedTask = null;
        for (const c of board.cards) {
          const found = c.tasks.find((t) => String(t.id) === String(taskId));
          if (found) {
            draggedTask = found;
            break;
          }
        }
        if (draggedTask && (draggedTask.item_type === "card" || draggedTask.item_type === "board")) {
          const subitems = Array.isArray(draggedTask.subitems) ? draggedTask.subitems : [];
          if (subitems.length > 0) {
            await modal.showAlert({
              title: "Cannot Complete",
              message: `Cannot move nested ${draggedTask.item_type} to Completed: it still contains ${subitems.length} child item(s). Empty all items inside first.`,
            });
            return;
          }
        }
      }

      try {
        await api.post(`/tasks/${taskId}/move`, { card_id: cardId });
        load();
      } catch (err) {
        await modal.showAlert({ title: "Move Failed", message: err.message });
      }
    };
  }

  async function reorderCard(sourceCardId, targetCardId) {
    const targetIdx = board.cards.findIndex((c) => c.id === targetCardId);
    if (targetIdx < 0) return;
    try {
      await api.patch(`/cards/${sourceCardId}`, { position: targetIdx });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Reorder Failed", message: err.message });
    }
  }

  async function changeCardType(card, card_type) {
    try {
      await api.patch(`/cards/${card.id}`, { card_type });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Update Failed", message: err.message });
    }
  }

  async function setWipLimit(card) {
    const val = await modal.showPrompt({
      title: "Set WIP Limit",
      label: `WIP limit for "${card.name}" (blank or 0 to clear):`,
      placeholder: "e.g. 3",
      defaultValue: card.wip_limit ? String(card.wip_limit) : "",
      confirmText: "Save Limit",
    });
    if (val === null) return;
    const num = val.trim() === "" || Number(val) <= 0 ? null : Number(val);
    try {
      await api.patch(`/cards/${card.id}`, { wip_limit: num });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Failed to set WIP limit", message: err.message });
    }
  }

  async function addTask(cardId, title) {
    try {
      await api.post(`/cards/${cardId}/tasks`, { title });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Cannot Add Task", message: err.message });
    }
  }

  async function addNestedTask(cardId, type) {
    const entity = type === "board" ? "Board" : "Card";
    const title = await modal.showPrompt({
      title: `Add Task as a ${entity}`,
      label: `${entity} Title:`,
      placeholder: `e.g. ${entity} B`,
      confirmText: `Create ${entity}`,
    });
    if (!title || !title.trim()) return;
    try {
      await api.post(`/cards/${cardId}/tasks`, {
        title: title.trim(),
        item_type: type,
        subitems: [],
      });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Cannot Add Task", message: err.message });
    }
  }

  async function deleteTask(task) {
    const confirmed = await modal.showConfirm({
      title: "Delete Task",
      message: `Delete "${task.title}"?`,
      confirmText: "Delete Task",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Deleting Task", message: err.message });
    }
  }

  async function saveTask(taskData) {
    try {
      await api.patch(`/tasks/${taskData.id}`, {
        title: taskData.title,
        description: taskData.description,
        linked_board_id: taskData.linked_board_id,
        item_type: taskData.item_type,
        subitems: taskData.subitems,
        is_finished: taskData.is_finished,
      });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Saving Task", message: err.message });
      throw err;
    }
  }

  function openTaskDetailModal(task, card) {
    modal.openTaskDetail({
      task,
      boards,
      currentBoardId: Number(id),
      locked: card.card_type === "completed",
      onSave: saveTask,
      onDelete: deleteTask,
    });
  }

  async function addCard() {
    const name = await modal.showPrompt({
      title: "New Card Column",
      label: "Card Name",
      placeholder: "e.g. In Review",
      confirmText: "Create Card",
    });
    if (!name || !name.trim()) return;
    try {
      await api.post(`/boards/${id}/cards`, { name: name.trim() });
      load();
    } catch (err) {
      await modal.showAlert({ title: "Error Creating Card", message: err.message });
    }
  }

  async function deleteCard(card) {
    const confirmed = await modal.showConfirm({
      title: "Delete Card",
      message: `Delete "${card.name}"?`,
      confirmText: "Delete Card",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await api.delete(`/cards/${card.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const forceConfirm = await modal.showConfirm({
          title: "Card Has Tasks",
          message: `${err.message}\n\nDelete it and all its tasks?`,
          confirmText: "Force Delete",
          danger: true,
        });
        if (forceConfirm) {
          try {
            await api.delete(`/cards/${card.id}?force=1`);
          } catch (forceErr) {
            await modal.showAlert({ title: "Error Deleting Card", message: forceErr.message });
            return;
          }
        } else {
          return;
        }
      } else {
        await modal.showAlert({ title: "Error Deleting Card", message: err.message });
        return;
      }
    }
    load();
  }

  if (error) {
    return (
      <div className="board-page page">
        <TopBar />
        <div style={{ padding: "var(--space-5)" }} className="error-text">
          {error}
        </div>
      </div>
    );
  }
  if (!board) return null;

  return (
    <div className="board-page page">
      <TopBar crumb={board.name} />
      <main className="board-columns-container page-main" role="region" aria-label={`Kanban board for ${board.name}`}>
        {board.cards.map((card) => (
          <CardColumn
            key={card.id}
            card={card}
            boards={boards}
            onDrop={makeDropHandler(card.id)}
            onDragStart={dragStart}
            onAddTask={addTask}
            onAddNestedTask={addNestedTask}
            onDeleteCard={deleteCard}
            onDeleteTask={deleteTask}
            onChangeCardType={changeCardType}
            onSetWipLimit={setWipLimit}
            onReorderCard={reorderCard}
            onOpenTaskDetail={(t) => openTaskDetailModal(t, card)}
          />
        ))}
        <button
          className="btn-add-card-column"
          onClick={addCard}
        >
          + add card
        </button>
      </main>
      <footer className="statusline">
        <span>{board.name}</span>
        <span>
          {progressBar(board.progress.percent)} {board.progress.percent}%
        </span>
        <span>{board.progress.done}/{board.progress.total} tasks done</span>
      </footer>
    </div>
  );
}
