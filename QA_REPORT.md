# QA Report

## Summary
- Task: T8 (Fix B1: Modal focus restoration to trigger element on close/Escape) & T2 (Design System Tokens, Themes, and In-App Modal System)
- Result: PASS (Gate passed, defect B1 resolved, all E2E focus checks passing)
- Verified on branch: `dev`
- QA Round: 2

## Gate Status
- Type check (`cd fe && npm run typecheck`): PASS (`tsc --noEmit` exited with code 0)
- Unit tests (`cd fe && npm test`): PASS (10 test files passed, 22 tests passed in Vitest)
- Build (`cd fe && npm run build`): PASS (`vite build` succeeded, produced `fe/dist/index.html` and bundled assets)
- Backend API tests (`bash be/tests/run_tests.sh`): PASS (53 passed, 0 failed, validated all constraints in AGENTS.md section 3)
- E2E tests (`cd fe && npm run test:e2e`): PASS (12 passed, 0 failed across Chromium and Mobile)

## Features Verified
1. **T2.1: Design system tokens and theme architecture**
   - Stone-light and forest-dark tokens match DESIGN_SYSTEM.md section 2.
   - CSS custom properties defined on `:root` and `[data-theme]`.
   - FOUT prevention inline script in `fe/index.html` initializes `data-theme` from `localStorage` prior to render.
   - Status: VERIFIED

2. **T2.2: Reusable accessible in-app modal system**
   - Implements MessageModal, ConfirmModal, PromptModal, and TaskDetailModal.
   - Modals have `role="dialog"`, `aria-modal="true"`, and focus trapping via Tab key navigation.
   - Backdrop clicking cancels without triggering actions.
   - Responsive and usable at desktop (1280px) and phone (375px) widths.
   - Focus restoration to triggering element verified on Escape and close.
   - Status: VERIFIED

3. **T2.3: Elimination of native browser dialogs in existing components**
   - Grep verification confirms zero occurrences of `alert(`, `confirm(`, or `prompt(` in `fe/src`.
   - Board deletion, card deletion, 409 force deletion, group creation, board creation, and task detail editing all utilize in-app modals.
   - Full gate passes cleanly.
   - Status: VERIFIED

## Findings
None currently open.

### B1: Modal fails to restore keyboard focus to triggering element upon close / Escape [RESOLVED in T8]
- **Status**: RESOLVED (Verified in QA Round 2 via `e2e/modal.spec.js`)
- **Task & Feature**: T2, T2.2 & T2.3
- **What was done**: In `modal.spec.js`, focused and clicked the `+ group` button to open `PromptModal`. With dialog open, pressed `Escape` to close the modal, then asserted `await expect(newGroupBtn).toBeFocused()`.
- **Expected**: Active modal closes and keyboard focus returns to the triggering element (`+ group` button), as required by AGENTS.md section 10 and T2.2 `done_when` ("Escape key closes active modal and returns focus to the triggering element").
- **Actual**: Focus is not returned to the triggering element; focus is lost to `document.body`.
- **Root Cause**: In `fe/src/components/modal/Modal.jsx`, `triggerElementRef.current = document.activeElement;` is executed inside a `useEffect`. Because React 18 synchronously focuses child elements with `autoFocus` (e.g. `<input className="modal-input" autoFocus />` in `PromptModal`) during DOM mutation before `useEffect` executes, `document.activeElement` is already the modal's internal input when `triggerElementRef.current` is set. On unmount/close, `triggerElementRef.current.focus()` attempts to focus the destroying modal element, causing the browser to reset focus to `document.body`.
- **How to reproduce**:
  1. Open app at `http://localhost:5173/` and navigate to dashboard.
  2. Focus and click `+ group` button.
  3. Press `Escape` key.
  4. Inspect `document.activeElement`; it is `document.body` instead of the `+ group` button.
- **Screenshots**:
  - `.run/screenshots/modal-prompt-desktop.png`
  - `.run/screenshots/modal-prompt-phone.png`
  - `.run/screenshots/modal-confirm-desktop.png`
  - `.run/screenshots/modal-confirm-phone.png`
  - `.run/screenshots/modal-task-detail-desktop.png`
  - `.run/screenshots/modal-task-detail-phone.png`
  - `.run/screenshots/theme-stone-light-desktop.png`
  - `.run/screenshots/theme-forest-dark-desktop.png`
