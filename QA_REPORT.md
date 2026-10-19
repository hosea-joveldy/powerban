# QA Report

## Summary
- Task: T4 (Authentication Pages Rebuild (Login and Register))
- Result: PASS (Full gate passed cleanly, all 22 E2E tests pass, all 57 backend API tests pass, login matches reference)
- Verified on branch: `dev`
- QA Round: 1

## Gate Status
- Type check (`cd fe && npm run typecheck`): PASS (`tsc --noEmit` exited with code 0)
- Unit tests (`cd fe && npm test`): PASS (12 test files passed, 22 tests passed in Vitest)
- Build (`cd fe && npm run build`): PASS (`vite build` succeeded, produced `fe/dist/index.html` and bundled assets)
- Backend API tests (`bash be/tests/run_tests.sh`): PASS (57 passed, 0 failed, validated rate limiting and AGENTS.md section 3 rules)
- E2E tests (`cd fe && npm run test:e2e`): PASS (22 passed, 0 failed across Chromium and Mobile)

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

4. **T3.1: Landing page layout and showcase sections matching references**
   - Unauthenticated visitors on `/` receive landing page.
   - Top navigation displays brand mark, nav links, and "Get started •" pill CTA linking to `/login`.
   - Section 2 showcases "Workspaces & Groups" and "Linked Boards & Progress" cards with dot-funnel graphic.
   - Section 3 renders deep forest container, serif headline, and lime accent CTA pill button.
   - Responsive at desktop (1280px) and phone (375px) viewports (screenshots captured).
   - Status: VERIFIED

5. **T3.2: Hero celestial orbit particle mesh mouse-interaction effect**
   - Renders celestial concentric stippled orbit particle mesh with planetary nodes matching references/landing-page-section1.png.
   - Smooth 3D tilt perspective damping (lerp 0.06) on desktop cursor movement.
   - Static fallback without animation loop when `prefers-reduced-motion: reduce` is active.
   - Static fallback without mouse listeners when `hover: none` matches.
   - Status: VERIFIED

6. **T4.1: Rebuild Login page to match reference**
   - Card layout matches `references/login.png` with floating elevated surface card and centered "Log in" heading.
   - Stacked input container with uppercase `EMAIL` and `PASSWORD` micro-labels.
   - Password input includes interactive visibility toggle icon.
   - Action button is a split pill button `[ Log in ] [ → ]`.
   - Invalid credentials show inline error message without native dialogs.
   - Responsive at desktop (1280px) and phone (375px) viewports (`.run/screenshots/login-desktop.png`, `login-phone.png`).
   - Grep confirms no `alert(`/`confirm(`/`prompt(` remains.
   - Status: VERIFIED

7. **T4.2: Restyle Register page to authentication design language**
   - Register screen matches authentication design language with floating surface card, stacked inputs, and uppercase micro-labels.
   - Split pill button `[ Register ] [ → ]` and password visibility toggle.
   - Seamless link to `/login`.
   - Inline error display for short passwords or registration conflicts.
   - Responsive at desktop (1280px) and phone (375px) viewports (`.run/screenshots/register-desktop.png`, `register-phone.png`).
   - Status: VERIFIED

8. **T4.3: Application-level rate limiting on repeated failed logins**
   - PostgreSQL `login_attempts` tracks failed authentication attempts.
   - Exceeding 5 failed attempts within a 15-minute window immediately returns HTTP 429 Too Many Requests with JSON error.
   - Successful login purges failed attempt records.
   - Login UI displays 429 rate limit error message inline without dialogs.
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
