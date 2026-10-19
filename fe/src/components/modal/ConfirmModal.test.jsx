// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ConfirmModal from "./ConfirmModal.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("ConfirmModal component", () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = "";
  });

  it("triggers onConfirm and onClose when confirmed", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    act(() => {
      root.render(
        <ConfirmModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Delete Confirmation"
          message="Are you sure?"
          confirmText="Yes, Delete"
          cancelText="No, Keep"
          danger={true}
        />
      );
    });

    expect(document.querySelector(".modal-title").textContent).toBe("Delete Confirmation");
    expect(document.querySelector(".modal-body").textContent).toBe("Are you sure?");

    const confirmBtn = document.querySelector(".btn-pill-primary");
    expect(confirmBtn.classList.contains("danger")).toBe(true);
    expect(confirmBtn.textContent).toContain("Yes, Delete");

    act(() => {
      confirmBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("triggers only onClose when canceled", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    act(() => {
      root.render(
        <ConfirmModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm Action"
          message="Proceed?"
        />
      );
    });

    const cancelBtn = document.querySelector(".btn-pill-secondary");
    act(() => {
      cancelBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
