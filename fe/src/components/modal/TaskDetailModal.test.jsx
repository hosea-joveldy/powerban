// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import TaskDetailModal from "./TaskDetailModal.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setReactInputValue(input, value) {
  const descriptor = Object.getOwnPropertyDescriptor(
    input.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype,
    "value"
  );
  descriptor.set.call(input, value);
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("TaskDetailModal component", () => {
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

  const mockTask = {
    id: 42,
    title: "Initial Task",
    description: "Initial description",
    linked_board_id: 10,
    is_finished: false,
  };

  const mockBoards = [
    { id: 1, name: "Current Board", is_template: false },
    { id: 10, name: "Linked Board Target", is_template: false, progress: { percent: 50 } },
    { id: 99, name: "Template Board", is_template: true },
  ];

  it("populates form fields from task prop and filters out current board and templates", () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <TaskDetailModal
            isOpen={true}
            onClose={() => {}}
            task={mockTask}
            boards={mockBoards}
            currentBoardId={1}
            onSave={() => {}}
            onDelete={() => {}}
          />
        </MemoryRouter>
      );
    });

    const titleInput = document.getElementById("task-title-input");
    const descInput = document.getElementById("task-desc-input");
    const linkedSelect = document.getElementById("task-linked-board");

    expect(titleInput.value).toBe("Initial Task");
    expect(descInput.value).toBe("Initial description");
    expect(linkedSelect.value).toBe("10");

    const options = Array.from(linkedSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("");
    expect(options).toContain("10");
    expect(options).not.toContain("1");
    expect(options).not.toContain("99");
  });

  it("disables finish toggle if locked in completed column", () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <TaskDetailModal
            isOpen={true}
            onClose={() => {}}
            task={mockTask}
            boards={mockBoards}
            currentBoardId={1}
            locked={true}
            onSave={() => {}}
          />
        </MemoryRouter>
      );
    });

    const checkbox = document.querySelector('input[type="checkbox"]');
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.checked).toBe(true);
  });

  it("calls onSave with updated form values when submitted", async () => {
    const onSave = vi.fn().mockResolvedValue({});
    const onClose = vi.fn();

    act(() => {
      root.render(
        <MemoryRouter>
          <TaskDetailModal
            isOpen={true}
            onClose={onClose}
            task={mockTask}
            boards={mockBoards}
            currentBoardId={1}
            locked={false}
            onSave={onSave}
          />
        </MemoryRouter>
      );
    });

    const titleInput = document.getElementById("task-title-input");
    const descInput = document.getElementById("task-desc-input");

    act(() => {
      setReactInputValue(titleInput, "Updated Title");
      setReactInputValue(descInput, "Updated notes");
    });

    const form = document.querySelector("form");
    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(onSave).toHaveBeenCalledWith({
      id: 42,
      title: "Updated Title",
      description: "Updated notes",
      linked_board_id: 10,
      is_finished: false,
    });
    expect(onClose).toHaveBeenCalled();
  });
});
