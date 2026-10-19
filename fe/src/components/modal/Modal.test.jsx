// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Modal from "./Modal.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("Modal component", () => {
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

  it("does not render into DOM when isOpen is false", () => {
    act(() => {
      root.render(
        <Modal isOpen={false} onClose={() => {}} title="Test">
          <p>Body</p>
        </Modal>
      );
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it("renders with role='dialog' and aria-modal='true' when isOpen is true", () => {
    act(() => {
      root.render(
        <Modal isOpen={true} onClose={() => {}} title="Test Dialog">
          <p>Dialog Content</p>
        </Modal>
      );
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(document.querySelector(".modal-title").textContent).toBe("Test Dialog");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape key press", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <Modal isOpen={true} onClose={onClose} title="Escape Test">
          <button>Inside</button>
        </Modal>
      );
    });

    const backdrop = document.querySelector(".modal-backdrop");
    act(() => {
      backdrop.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when backdrop is clicked directly", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <Modal isOpen={true} onClose={onClose} title="Backdrop Test">
          <button>Inside</button>
        </Modal>
      );
    });

    const backdrop = document.querySelector(".modal-backdrop");
    act(() => {
      backdrop.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the dialog content", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <Modal isOpen={true} onClose={onClose} title="Inner Click Test">
          <button id="inner-btn">Inside</button>
        </Modal>
      );
    });

    const innerBtn = document.getElementById("inner-btn");
    act(() => {
      innerBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("restores document body overflow on unmount", () => {
    act(() => {
      root.render(
        <Modal isOpen={true} onClose={() => {}} title="Overflow Test">
          <p>Body</p>
        </Modal>
      );
    });
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      root.render(
        <Modal isOpen={false} onClose={() => {}} title="Overflow Test">
          <p>Body</p>
        </Modal>
      );
    });
    expect(document.body.style.overflow).toBe("");
  });
});
