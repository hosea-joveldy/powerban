import Modal from "./Modal.jsx";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  triggerElement,
}) {
  const descId = "confirm-modal-desc";

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      triggerElement={triggerElement}
      ariaDescribedBy={descId}
    >
      <div id={descId} className="modal-body">
        {typeof message === "string" ? <p style={{ margin: 0 }}>{message}</p> : message}
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
          type="button"
          className={`btn-pill-primary ${danger ? "danger" : ""}`.trim()}
          onClick={handleConfirm}
          autoFocus={danger ? false : true}
        >
          {confirmText}
          <span className="btn-status-dot" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
}
