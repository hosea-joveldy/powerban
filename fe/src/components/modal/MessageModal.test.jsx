// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import MessageModal from "./MessageModal.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("MessageModal component", () => {
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

  it("renders title, message string, and dismiss button", () => {
    const onClose = vi.fn();
    act(() => {
      root.render(
        <MessageModal
          isOpen={true}
          onClose={onClose}
          title="Attention"
          message="Operation succeeded"
          dismissText="Got it"
        />
      );
    });

    expect(document.querySelector(".modal-title").textContent).toBe("Attention");
    expect(document.querySelector(".modal-body").textContent).toBe("Operation succeeded");

    const dismissBtn = document.querySelector(".btn-pill-primary");
    expect(dismissBtn.textContent).toContain("Got it");

    act(() => {
      dismissBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
