# SPEC.md: Powerban Phase 2 Specification

## 1. Goal and Scope

Powerban is a focused, high-efficiency kanban board for power users built for a school assignment under the MIT license. It enables users to create multiple boards, organize them into groups, link tasks directly to other boards to display progress, and save boards as reusable templates.

### 1.1 Objectives for this Phase
1. **Frontend Redesign**: Discard the previous MVP demo design, old palettes, and the five previous themes. Implement a modern, cohesive design system derived strictly from the reference designs in `references/` (`landing-page-section1.png`, `landing-page-section2.png`, `landing-page-section3.png`, and `login.png`).
2. **Landing Page Entry Route**: Build an entry route at `/` that presents the product using the visual style from `references/landing-page-section*.png`. Include an interactive mouse-movement effect in the hero (Celestial Orbit Particle Mesh) with reduced-motion and touch fallbacks. Unauthenticated users see this page; authenticated users redirect to the dashboard. The primary call-to-action leads to `/login`.
3. **Authentication Rebuild**: Rebuild the Login page to match `references/login.png` (floating surface card, stacked email/password field with visibility toggle, split action button `[ Log in ] [ -> ]`, and sign up links). Restyle the Register page using the exact same visual language.
4. **Accessible In-App Modal System**: Completely remove all native browser dialogs (`alert(`, `confirm(`, `prompt(`). Replace them with an accessible, mobile-responsive in-app modal system supporting message dialogs, confirmation dialogs, single-input prompt dialogs, and a task detail modal (title, multi-line description, linked board picker).
5. **Documentation & Licensing**: Rewrite the root `README.md` to match current code reality (accurate features, setup guide, removed dead links to nonexistent `SETUP.md`). Add an official MIT `LICENSE` file. Write comprehensive API documentation for all backend endpoints.
6. **Frontend Robustness & Gate Setup**: Configure missing gate runners (type checking, Vitest unit tests, Playwright E2E tests, build script confirmation, and backend API test suite) so automated gates protect every change.

### 1.2 Technology Stack & Boundaries
- **Backend**: PHP 8.4 (native autoloader, no Composer), PostgreSQL. Served via Apache under `/qibar/powerban/api`. Prepared statements for all queries; ownership enforcement on all user entities; JSON responses (`{"error": ...}` on failure).
- **Frontend**: React 18, Vite 5, React Router 6, vanilla CSS using CSS custom properties (no external UI framework).
- **Network / Auth**: Same-origin architecture with Vite dev proxy to `http://localhost/qibar/powerban/api`. Authentication via PHP session cookies (`powerban_session`, HttpOnly, SameSite, Secure on HTTPS).
- **Theme Persistence**: Saved per user in `users.theme` via `PATCH /api/me`. Two cohesive themes are provided: `stone-light` (default, derived from sections 1-2 & login) and `forest-dark` (derived from section 3). Theme applies immediately on load without flash.

### 1.3 Business & Domain Rules (AGENTS.md Section 3)
- **Cards & Types**: Boards start with three default cards: `todo`, `ongoing`, and `completed`. Multiple `completed` cards are supported.
- **WIP Limits**: Applied strictly to `ongoing` cards. Attempting to set WIP limits on `todo` or `completed` cards returns HTTP 422. Exceeding limit blocks adding new tasks but does not mutate existing tasks.
- **Task Completion Rules**: Moving a task into a `completed` card automatically sets `is_finished = true`. Moving a task out unfinishes it (`is_finished = false`). Changing a card from `completed` to another type unfinishes all its tasks. In other cards, `is_finished` can be toggled manually.
- **Card Deletion**: Deleting a card with tasks returns HTTP 409 Conflict unless `?force=1` is provided.
- **Linked Boards**: A task can link to any non-template board owned by the user except its own parent board. Deleting the target board nullifies the link (`ON DELETE SET NULL`). Linked tasks render the target board name and flat progress indicator.
- **Groups**: Deleting a group sets `group_id = NULL` on its boards (boards become standalone).
- **Templates**: Users can save any board as a template (`POST /api/boards/{id}/save-as-template`) and instantiate new boards from templates (`POST /api/boards/from-template/{id}`). Built-in system templates (`system@powerban.local`) are visible to all users.
- **Progress Calculation**: Flat computation: `{done, total, percent}` where `percent = round((completed_tasks / total_tasks) * 100)`. Empty boards return 0%.

### 1.4 Out of Scope (AGENTS.md Section 2)
The following items remain strictly out of scope for this phase:
- One task assigned to multiple boards simultaneously.
- Deep hierarchical or recursive progress rollup across linked boards.
- Archive / soft delete systems.
- Labels, due dates, and user assignees on tasks.
- Multi-user board sharing or collaborative editing.
- Task-level templates.

---

## 2. Gate

Before any QA sign-off or merge, all gate commands must pass cleanly:

| Check | Gate Command | Purpose |
|---|---|---|
| **Type check** | `cd fe && npm run typecheck` | Validates JavaScript / JSX typing and syntax via `tsc --noEmit` |
| **Unit tests** | `cd fe && npm test` | Runs deterministic Vitest unit tests for frontend utilities, helpers, and components |
| **Build** | `cd fe && npm run build` | Produces production Vite asset bundle in `fe/dist/` |
| **Backend API tests** | `bash be/tests/run_tests.sh` | Executes full API integration test suite covering auth, groups, boards, cards, tasks, WIP limits, templates, and ownership |
| **E2E tests** | `cd fe && npm run test:e2e` | Headless Playwright tests validating end-to-end user flows, responsive layouts, and modal interactions |

---

## 3. Open Questions

- `TODO(human): Confirm whether social login buttons ("Continue with Google", "Continue with GitHub") on the Login and Register cards should remain visual demo/mock buttons or if OAuth integrations are planned for a later phase.`
- `TODO(human): Confirm whether the rate-limiting requirement for repeated failed logins (AGENTS.md section 1) should be handled via database attempt counters in PHP or Apache mod_ratelimit/fail2ban.`
