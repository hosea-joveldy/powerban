// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import PromptModal from "./PromptModal.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setReactInputValue(input, value) {
  const descriptor = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  );
  descriptor.set.call(input, value);
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("PromptModal component", () => {
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

  it("submits input value when submitted", () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    act(() => {
      root.render(
        <PromptModal
          isOpen={true}
          onClose={onClose}
          onSubmit={onSubmit}
          title="New Board"
          label="Board Name"
          defaultValue="Default Name"
          confirmText="Create"
        />
      );
    });

    const input = document.querySelector(".modal-input");
    expect(input.value).toBe("Default Name");

    act(() => {
      setReactInputValue(input, "Sprint Backlog");
    });

    const submitBtn = document.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBe(false);

    const form = document.querySelector("form");
    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(onSubmit).toHaveBeenCalledWith("Sprint Backlog");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables submit button when input is empty or whitespace", () => {
    act(() => {
      root.render(
        <PromptModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Empty Test"
          defaultValue=""
        />
      );
    });

    const submitBtn = document.querySelector('button[type="submit"]');
    expect(submitBtn.disabled).toBe(true);
  });
});
