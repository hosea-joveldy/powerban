# QA Report

## Summary
- Task: T13 (Comprehensive QA Verification and Gate Sign-off for User Features 1-14)
- Result: PASS (Full application verification complete; all gate checks passing, 28/28 E2E tests pass, 65/65 backend API tests pass, 22/22 unit tests pass, typecheck passes, production build succeeds cleanly, zero native browser dialogs, responsive across all viewports)
- Verified on branch: `dev`
- QA Round: 1

## Gate Status
- Type check (`cd fe && npm run typecheck`): PASS (`tsc --noEmit` exited with code 0)
- Unit tests (`cd fe && npm test`): PASS (13 test files passed, 22 tests passed in Vitest)
- Build (`cd fe && npm run build`): PASS (`vite build` succeeded, produced `fe/dist/index.html` and bundled assets)
- Backend API tests (`bash be/tests/run_tests.sh`): PASS (65 passed, 0 failed, validated rate limiting, usernames, universal WIP limits, nested empty-check constraints, and AGENTS.md section 3 rules)
- E2E tests (`cd fe && npm run test:e2e`): PASS (28 passed, 0 failed across Chromium and Mobile)

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

9. **T5.1: Restyle Dashboard with unified design system**
   - Topbar displays wordmark, breadcrumb, theme settings link, and logout button with SVG icons.
   - Group sections, standalone boards, and template tiles render with clean surface cards.
   - Board tiles display board title, progress track, metrics, save as template, and delete actions.
   - Group and board creation trigger in-app prompt modals.
   - Responsive at desktop (1280px) and phone (375px) viewports (`.run/screenshots/dashboard-desktop.png`, `dashboard-phone.png`).
   - Grep verification confirms zero occurrences of `alert(`, `confirm(`, or `prompt(`.
   - Status: VERIFIED

10. **T5.2: Restyle Board kanban view, columns, and task interactions**
    - Card columns render with rounded corners and uppercase headers.
    - Ongoing cards display WIP indicator pill (e.g. 1/2) highlighted in warning colors at limit.
    - Tasks in completed cards display finished styling (dimmed, strikethrough).
    - Linked board badge shows target board name and flat progress bar; clicking navigates to that board.
    - Task Detail modal allows editing title, multiline description, and linked board target.
    - Drag and drop between columns updates task positions and card types.
    - Responsive at desktop (1280px) and phone (375px) viewports (`.run/screenshots/board-desktop.png`, `board-phone.png`).
    - Grep confirms zero occurrences of `alert(`, `confirm(`, or `prompt(`.
    - Status: VERIFIED

11. **T5.3: Restyle Settings and theme switching persistence**
    - Settings page presents stone-light and forest-dark theme options with preview swatches and descriptions.
    - Selecting a theme updates document theme immediately and persists to backend via PATCH /api/me.
    - Responsive at desktop (1280px) and phone (375px) viewports (`.run/screenshots/settings-desktop.png`, `settings-phone.png`).
    - Full gate passes cleanly.
    - Status: VERIFIED

12. **T6.1: Add MIT License file**
    - Root `LICENSE` file created containing standard MIT License terms and copyright.
    - Status: VERIFIED

13. **T6.2: Complete rewrite of root README.md**
    - README accurately reflects true system capabilities and business rules (workspaces/groups, linked boards, ongoing WIP limits, flat progress, templates).
    - Removed all dead links to non-existent `SETUP.md`.
    - Setup instructions for Docker, PostgreSQL database seeding, and frontend dev/build verified and accurate.
    - Status: VERIFIED

14. **T6.3: Comprehensive backend API documentation**
    - Created `docs/API.md` documenting all 23 backend endpoints across auth, groups, boards, templates, cards, and tasks.
    - Detailed request headers, JSON bodies, query parameters, response schemas, and error codes.
    - Full gate passes cleanly.
    - Status: VERIFIED

15. **T9: Logo Integration, Bento Box Grid, and GitHub Navigation**
    - Powerban SVG logo prominently displayed in `README.md`, landing navbar, and authenticated topbar.
    - Clicking navbar links smoothly scrolls to page sections (`#workflow`, `#features`, `#bento`).
    - Modern Bento Box layout grid showcases nested cards, vertical cards, WIP discipline, and fluid drag-and-drop.
    - Architecture highlights section renders deep architectural details.
    - GitHub icon button added in navbar; footer GitHub link correctly redirects to `https://github.com/hosea-joveldy/powerban`.
    - Status: VERIFIED

16. **T10: Authentication Polish and Username System**
    - Surrounding floating 3D metallic sculptures and faint IDE backdrop matching `references/login.png` rendered on Login and Register pages.
    - PostgreSQL `users.username` unique column created with prepared statement models and backend validation.
    - Login supports both username and email authentication.
    - Stacked inputs with uppercase micro-labels and password visibility toggles verified.
    - Status: VERIFIED

17. **T11: Dashboard Draggable Boards**
    - Drag-and-drop enables moving board tiles between groups and standalone sections.
    - Visual drop indicator highlights during dragover.
    - Backend updates board `group_id` accordingly.
    - Status: VERIFIED

18. **T12: Board Kanban Evolution, Sizing, and Nested Cards/Boards**
    - Checklist checkboxes removed from tasks; tasks in completed cards automatically receive finished styling.
    - Three-dots menu on card column headers allows switching card type between Todo, Ongoing, and Completed.
    - Universal WIP limit configurable for any non-completed card (blocked with 422 on completed cards).
    - Nested card and board tasks supported via Three-dots menu ("Add Task as a Card", "Add Task as a Board").
    - Nested empty-check constraint enforced: non-empty nested cards/boards cannot be moved to completed cards (returns 422 if child items remain).
    - Vertical card collapse option turns card into a vertical spine with typography rotated so words face left (`writing-mode: vertical-rl; transform: rotate(180deg)`).
    - Column dragging supported with isolated drag handles to eliminate hitbox conflict with task dragging.
    - Card column and task typography increased for enhanced readability across viewports.
    - Status: VERIFIED

19. **T13: Comprehensive QA Verification and Full Gate Sign-off**
    - TypeScript typecheck passed cleanly (`tsc --noEmit`).
    - Vitest unit tests passed (22/22).
    - Production Vite build passed.
    - Backend API tests passed (65/65).
    - Playwright E2E tests passed (28/28 across Desktop Chromium and Mobile).
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
