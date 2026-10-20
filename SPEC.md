# SPEC.md: Powerban Specification & Phase 3 Enhancements

## 1. Goal and Scope

Powerban is a focused, high-efficiency kanban board for power users built under the MIT license. Users organize boards, group them, nest cards and boards, enforce WIP limits, and save reusable templates.

### 1.1 Objectives for this Phase
1. **Logo & Navigation**: Add the Powerban SVG wordmark from `assets/logo.svg` to the root `README.md` and into the web application navbar. Add smooth animated scrolling when navbar anchor links (such as `#workflow`) are clicked.
2. **Landing Page Expansion**: Add 2 new sections to the landing page, prominently featuring a modern Bento Box layout highlighting hierarchical workflows, vertical card focus, WIP capacity limits, and multi-entity drag-and-drop.
3. **Repository Links**: Redirect footer and navbar GitHub links to `https://github.com/hosea-joveldy/powerban`. Add a GitHub icon button directly to the left of the "Get Started" CTA button in the navbar.
4. **Auth Reference Surrounding Elements**: Recreate the floating 3D ambient sculptural pebbles and faint developer workspace/terminal backdrop from `references/login.png` around the login and register modal cards.
5. **Username Identity**: Add `username` to the PostgreSQL `users` table, user models, registration flow, and login flow (supporting login by username or email).
6. **Dashboard Draggable Boards**: Enable drag-and-drop on the dashboard to move board tiles between groups or into the standalone boards section.
7. **Board Kanban & Card System Evolution**:
   - Remove manual checklist buttons from tasks; tasks in completed cards automatically receive finished styling.
   - Three-dots menu on card column headers offering:
     * Card Type selector (`todo`, `ongoing`, `completed`).
     * Set WIP Limit (available on all cards except `completed` cards).
     * Add Task as a Card (nested card).
     * Add Task as a Board (board task).
     * Turn Vertically & Hide tasks (collapses card into a vertical spine; typography rotated so letters face left).
     * Delete Card.
   - Nested Card / Board rule: a task representing a card or board cannot be moved to a completed card if it still contains items. Once empty, it can be completed.
   - Card Reordering: Drag-and-drop for cards to reorder columns with isolated hitboxes from task dragging.
   - Sizing & Readability: Increase card column width and task typography for crisp legibility.

### 1.2 Technology Stack & Boundaries
- **Backend**: PHP 8.4 (native autoloader, no Composer), PostgreSQL. Served via Apache under `/qibar/powerban/api`. Prepared statements for all queries; ownership enforcement on all user entities; JSON responses.
- **Frontend**: React 18, Vite 5, React Router 6, vanilla CSS using CSS custom properties (no external UI framework).
- **Network / Auth**: Same-origin architecture with Vite dev proxy to `http://localhost/qibar/powerban/api`. Authentication via PHP session cookies (`powerban_session`).

### 1.3 Updated Business & Domain Rules
- **WIP Limits on Non-Completed Cards**: WIP limits can be set on any card that is not `completed` (both `todo` and `ongoing`). Completed cards cannot have a WIP limit (HTTP 422 if attempted).
- **Task Completion Rules**: Moving a task into a `completed` card automatically sets `is_finished = true`. Moving a task out unfinishes it (`is_finished = false`).
- **Nested Card & Board Rules**: Tasks with `item_type` `'card'` or `'board'` track subitems. Moving a nested card or board task into a completed card is prohibited while it still contains items (returns HTTP 422 on backend and displays an alert in the UI).
- **Card Deletion**: Deleting a card with tasks returns HTTP 409 Conflict unless `?force=1` is provided.

---

## 2. Gate

Before any QA sign-off or merge, all gate commands must pass cleanly:

| Check | Gate Command | Purpose |
|---|---|---|
| **Type check** | `cd fe && npm run typecheck` | Validates JavaScript / JSX typing and syntax via `tsc --noEmit` |
| **Unit tests** | `cd fe && npm test` | Runs deterministic Vitest unit tests for frontend utilities, helpers, and components |
| **Build** | `cd fe && npm run build` | Produces production Vite asset bundle in `fe/dist/` |
| **Backend API tests** | `bash be/tests/run_tests.sh` | Executes full API integration test suite covering auth, username, rate limiting, groups, boards, cards, WIP limits, templates, and ownership |
| **E2E tests** | `cd fe && npm run test:e2e` | Headless Playwright tests validating end-to-end user flows, responsive layouts, and modal interactions |
