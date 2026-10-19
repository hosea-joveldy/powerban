import { createContext, useContext, useState, useCallback, useRef } from "react";
import MessageModal from "./MessageModal.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import PromptModal from "./PromptModal.jsx";
import TaskDetailModal from "./TaskDetailModal.jsx";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState(null);
  const resolveRef = useRef(null);

  const closeModal = useCallback((result) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setModalState(null);
  }, []);

  const showAlert = useCallback(
    ({ title = "Notice", message, dismissText = "Understood" }) => {
      const trigger = document.activeElement;
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setModalState({
          type: "message",
          props: { title, message, dismissText, triggerElement: trigger },
        });
      });
    },
    []
  );

  const showConfirm = useCallback(
    ({
      title = "Confirm Action",
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      danger = false,
    }) => {
      const trigger = document.activeElement;
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setModalState({
          type: "confirm",
          props: { title, message, confirmText, cancelText, danger, triggerElement: trigger },
        });
      });
    },
    []
  );

  const showPrompt = useCallback(
    ({
      title = "Input Required",
      message,
      defaultValue = "",
      placeholder = "",
      label = "",
      confirmText = "Submit",
      cancelText = "Cancel",
    }) => {
      const trigger = document.activeElement;
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setModalState({
          type: "prompt",
          props: {
            title,
            message,
            defaultValue,
            placeholder,
            label,
            confirmText,
            cancelText,
            triggerElement: trigger,
          },
        });
      });
    },
    []
  );

  const openTaskDetail = useCallback(
    ({ task, boards, currentBoardId, locked, onSave, onDelete }) => {
      const trigger = document.activeElement;
      setModalState({
        type: "task-detail",
        props: { task, boards, currentBoardId, locked, onSave, onDelete, triggerElement: trigger },
      });
    },
    []
  );

  return (
    <ModalContext.Provider
      value={{ showAlert, showConfirm, showPrompt, openTaskDetail, closeModal }}
    >
      {children}

      {modalState?.type === "message" && (
        <MessageModal
          isOpen={true}
          onClose={() => closeModal(undefined)}
          {...modalState.props}
        />
      )}

      {modalState?.type === "confirm" && (
        <ConfirmModal
          isOpen={true}
          onClose={() => closeModal(false)}
          onConfirm={() => closeModal(true)}
          {...modalState.props}
        />
      )}

      {modalState?.type === "prompt" && (
        <PromptModal
          isOpen={true}
          onClose={() => closeModal(null)}
          onSubmit={(val) => closeModal(val)}
          {...modalState.props}
        />
      )}

      {modalState?.type === "task-detail" && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => closeModal(undefined)}
          {...modalState.props}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
