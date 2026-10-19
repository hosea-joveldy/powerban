import { useState, useEffect } from "react";
import Modal from "./Modal.jsx";

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Input Required",
  message,
  defaultValue = "",
  placeholder = "",
  label = "",
  confirmText = "Submit",
  cancelText = "Cancel",
  triggerElement,
}) {
  const [value, setValue] = useState(defaultValue);
  const descId = "prompt-modal-desc";

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      triggerElement={triggerElement}
      ariaDescribedBy={message ? descId : undefined}
    >
      <form onSubmit={handleSubmit} className="modal-body" style={{ margin: 0 }}>
        {message && (
          <div id={descId} style={{ marginBottom: "var(--space-2)" }}>
            <p style={{ margin: 0 }}>{message}</p>
          </div>
        )}
        <div className="modal-field">
          {label && <label className="modal-field-label">{label}</label>}
          <input
            type="text"
            className="modal-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn-pill-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className="btn-pill-primary"
            disabled={!value.trim()}
          >
            {confirmText}
            <span className="btn-status-dot" aria-hidden="true" />
          </button>
        </div>
      </form>
    </Modal>
  );
}
