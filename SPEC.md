# SPEC.md: Powerban Specification & Phase 4 Enhancements

## 1. Goal and Scope

Powerban is a focused, high-efficiency kanban board for power users built under the MIT license. Users organize boards, group them, nest cards and boards, enforce WIP limits, and save reusable templates.

### 1.1 Objectives for Phase 4
1. **Black Text Logo & Brand Typography Cleanup**:
   - Provide a black-text version of the logo (`logo-dark.svg`) where wordmark paths use `#121316` without dark-mode media query overrides.
   - Use this dark logo across views and containers with white/light backgrounds (TopBar, Landing Page nav, Login header, Register header).
   - Remove redundant "Powerban" text placed next to the logo image.
2. **Social Auth Button Removal**:
   - Remove non-functional "Continue with Google" and "Continue with Github" buttons and their containers from Login and Register pages.
3. **Ambient Blobs & Visual Polish**:
   - Brighten the colors of the floating 3D ambient blobs on Login and Register pages (luminous terracotta, warm amber, fresh sage, soft pastel violet).
   - Fix square-shaped shadow clipping on ambient blobs by ensuring SVG filter bounding boxes, viewBox margins, and CSS filters do not clip blurred shadows.
4. **Emoji Elimination & Lucide Icon Integration**:
   - Eliminate all emojis throughout the application (Landing page, auth backdrop, task badges, card tags, modals).
   - Remove the landing page 3-cards architecture highlights section.
   - Integrate `lucide-react` icons for all graphical UI indicators.
5. **Two Card Types (Normal & Completed)**:
   - Simplify card types to exactly two: `normal` and `completed`.
   - Remove `todo` and `ongoing` types. `normal` is the default type for all cards.
   - Update PostgreSQL schema, database check constraints, default values, seeds, backend models (`Card`, `Board`, `Task`), and API test suite.
   - WIP limits apply to `normal` cards; completed cards cannot have WIP limits.
   - Moving a task to a `completed` card auto-finishes it (`is_finished = true`); moving to a `normal` card unfinishes it (`is_finished = false`).
6. **Add Task as Existing Card or Board**:
   - Instead of creating arbitrary new nested entities with raw text prompts, allow users to select from existing cards or existing boards.
   - Cross-board card search displays matching card names along with originating board names (e.g. `Card Name (from board: Board Name)`) to resolve duplicate names across boards.
   - Adding an existing card links/initializes subitems with the tasks from that card; adding an existing board sets `linked_board_id`.

### 1.2 Technology Stack & Boundaries
- **Backend**: PHP 8.4 (native autoloader, no Composer), PostgreSQL. Served via Apache under `/qibar/powerban/api`. Prepared statements for all queries; ownership enforcement on all user entities; JSON responses.
- **Frontend**: React 18, Vite 5, React Router 6, vanilla CSS using CSS custom properties, Lucide React icons.
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
