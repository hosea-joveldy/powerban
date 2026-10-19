import Modal from "./Modal.jsx";

export default function MessageModal({
  isOpen,
  onClose,
  title = "Notice",
  message,
  dismissText = "Understood",
}) {
  const descId = "message-modal-desc";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      ariaDescribedBy={descId}
    >
      <div id={descId} className="modal-body">
        {typeof message === "string" ? <p style={{ margin: 0 }}>{message}</p> : message}
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn-pill-primary"
          onClick={onClose}
          autoFocus
        >
          {dismissText}
          <span className="btn-status-dot" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}
