# Powerban TODO

Terminology: **card** = a stage/column on a board (Todo / Ongoing / Completed). **task** = the to-do item inside a card.

Legend: `[x]` done, `[ ]` not started.

---

## 0. Setup (done)

- [x] docker-compose stack (PHP/Apache, Postgres, pgAdmin)
- [x] `powerban` database created
- [x] `schema.sql` applied (users, groups, boards, cards, tasks)
- [x] Apache alias + `.htaccess` rewrite (`RewriteBase /qibar/powerban`)
- [x] Manual autoloader (no Composer)
- [x] `Db.php` reads project-local `.env`
- [x] Router with path params (`/api/boards/{id}`)
- [x] `GET /api/boards` returns `[]` end-to-end

---

## Decisions made (backend)

- Auth is PHP sessions. Cookie is named `powerban_session` and scoped to `/qibar/powerban` so it can't clash with the other projects on the same Apache
- Templates are per user. "Save as template" copies the board; "use template" copies the template into a new board. Copies keep tasks, links and `is_finished`
- A new board starts with three cards: Todo, Ongoing, Completed
- A board may have several `completed` cards (progress counts all of them)
- `wip_limit` is cleared automatically when a card stops being `ongoing`; sending one for a non-ongoing card is a 422
- Setting a limit below the current task count is allowed, it only blocks adding more
- Becoming `completed` finishes every task in the card; leaving `completed` unfinishes them
- Moving a task into `completed` finishes it; moving it out unfinishes it. `is_finished` can be toggled by hand elsewhere
- Deleting a card that still has tasks is a 409 unless `?force=1`
- A task can link to any of your own non-template boards except the one it sits on. Deleting the target clears the link
- Positions are integers, renumbered 0..n-1 whenever something is placed at an index
- Boards have no `position` column, so they are ordered by id

---

## 1. Backend foundation

- [x] Create `src/routes.php` and `require` it in `public/index.php` before `dispatch()` (right now the router has zero routes registered)
- [x] Make `BoardController` call `Board::all()` instead of running SQL itself
- [x] Request helper: parse JSON body (`php://input`), return 400 on invalid JSON
- [x] Response helper: `json($data, $status)` so controllers stop calling `echo json_encode` directly
- [x] Global error handling: catch exceptions, return JSON `{"error": ...}` with 500, never leak stack traces
- [x] Turn off `display_errors` outside dev (PHP warnings currently break JSON parsing on the frontend)
- [x] Input validation helper (required fields, types, max lengths)
- [x] CORS: skipped on purpose. Run the React dev server with a proxy for `/qibar/powerban/api` (Vite `server.proxy`) so everything stays same-origin
- [ ] Add `.env` to `.gitignore`, commit a `.env.example` matching your key names
- [ ] Decide where `schema.sql` lives (repo root or `be/db/`), consider numbered migrations later

---

## 2. Users and auth

- [x] `POST /api/auth/register` (email + password, `password_hash()`)
- [x] `POST /api/auth/login` (`password_verify()`, `session_regenerate_id()`)
- [x] `POST /api/auth/logout`
- [x] `GET /api/me` (current user + theme)
- [x] Auth guard: reject with 401 when no session, expose `currentUserId()`
- [x] Session cookie settings (HttpOnly, SameSite, Secure when on HTTPS)
- [x] `PATCH /api/me` to save `theme`
- [x] Ownership checks everywhere: a user can only touch their own groups/boards/cards/tasks

---

## 3. Groups

- [x] `GET /api/groups`
- [x] `POST /api/groups`
- [x] `PATCH /api/groups/{id}` (rename, reposition)
- [x] `DELETE /api/groups/{id}` (boards become standalone via `ON DELETE SET NULL`)
- [x] Reorder endpoint or position-update strategy (decide: integer gaps vs renumbering)

---

## 4. Boards

- [x] `GET /api/boards` (mine: standalone + grouped, include progress)
- [x] `GET /api/boards/{id}` (board with its cards and tasks in one payload)
- [x] `POST /api/boards` (optional `group_id`; create default cards Todo / Ongoing / Completed)
- [x] `PATCH /api/boards/{id}` (rename, move into/out of a group)
- [x] `DELETE /api/boards/{id}`
- [x] Set `updated_at` on writes (there is no trigger, do it in the model)
- [x] Validate `group_id` belongs to the current user

---

## 5. Cards (stages)

- [x] `POST /api/boards/{id}/cards`
- [x] `PATCH /api/cards/{id}` (name, position, `card_type`, `wip_limit`)
- [x] `DELETE /api/cards/{id}` (decide: block if it still has tasks, or cascade)
- [x] Enforce `wip_limit` only on `ongoing` cards (DB constraint exists, return a clean 422 instead of a raw PDO error)
- [x] Decide: at most one `completed` card per board, or allow several
- [x] When a card's type changes to `completed`, set `is_finished = true` on all its tasks
- [x] Decide what happens to `is_finished` when a card stops being `completed`
- [x] Reorder cards within a board

---

## 6. Tasks

- [x] `POST /api/cards/{id}/tasks`
- [x] `PATCH /api/tasks/{id}` (title, description, position)
- [x] `DELETE /api/tasks/{id}`
- [x] `POST /api/tasks/{id}/move` (target card + position, one endpoint for drag and drop)
- [x] WIP enforcement on create and move into an `ongoing` card (reject when at the limit)
- [x] Force `is_finished = true` when a task lands in a `completed` card
- [x] Decide: reset `is_finished` to false when a task moves out of `completed`
- [x] Reorder tasks within a card

---

## 7. Linked boards (task -> board)

- [x] Set / clear `linked_board_id` on a task
- [x] Validate the target board exists and belongs to the same user
- [x] Include the linked board's name and flat progress in the task payload
- [x] Decide: what a linked task shows if the target board is deleted (`SET NULL` already handles the data side)
- [x] Optional: block a task linking to its own board

---

## 8. Progress

- [x] Flat per-board progress: tasks in `completed` cards / total tasks
- [x] Return `{done, total, percent}` on board list and board detail
- [x] Handle empty boards (0 tasks, avoid divide by zero)
- [x] Single query for all boards' progress on the dashboard, not one query per board

---

## 9. Templates

- [x] Mark a board as template (`is_template`)
- [x] `GET /api/templates`
- [x] `POST /api/boards/from-template/{id}` (deep copy board, cards, tasks inside one transaction)
- [x] Save an existing board as a template (copy, not flag flip)
- [x] Task templates: decided out of scope, replaced by built-in board templates below
- [x] Keep templates out of the normal board list
- [x] Built-in templates: a system account (`system@powerban.local`) owns three starter boards (Simple Kanban, Sprint Board, Personal Goals), seeded by `be/db/seed.sql`. `GET /api/templates` returns a user's own templates plus the system's; `POST /api/boards/from-template/{id}` can copy either

---

## 10. Backend testing and hardening

- [x] `.http` file or curl script covering every endpoint — `be/tests/smoke.sh`, 49/49 passing against the real stack
- [x] Test the constraints: WIP on non-ongoing card, completed-card `is_finished`, cross-user access
- [ ] Add indexes if any query gets slow (`tasks.card_id`, `cards.board_id` already exist)
- [ ] Rate limit or lock out repeated failed logins
- [x] Verify every query uses prepared statements

---

## 11. Frontend (React)

_Built as an MVP: Vite + React, plain CSS, no UI framework. Not run through `npm install`/`npm run build` in this environment (no network access) — checked structurally, not executed. See `fe/README.md`._

- [x] Scaffold with Vite, decide router (React Router) and data fetching approach
- [x] API client wrapper (base URL `/qibar/powerban/api`, credentials, error handling)
- [x] Login / register pages, auth context, protected routes
- [x] Dashboard: groups with their boards, standalone boards, progress bar per board
- [x] Create / rename / delete groups and boards, move board into a group
- [x] Board view: cards as columns, tasks as items
- [~] Drag and drop for tasks and cards (e.g. dnd-kit) (see fe/README.md known gaps)
- [~] Task detail modal (title, description, linked board) (not built: used inline `prompt()`/checkbox instead)
- [x] WIP limit indicator on `ongoing` cards (e.g. `3/5`, highlight when full)
- [x] Finished styling for tasks in `completed` cards
- [x] Linked-board widget on task face (name + progress bar, click to open)
- [x] Template picker when creating a board, "save as template" action
- [~] Loading, empty, and error states everywhere (see fe/README.md known gaps)

---

## 12. Themes

5 schemes shipped instead of the original 2: Gruvbox Dark, Catppuccin Mocha, Nord, Ayu Dark, Everforest Dark. Light variants not done yet.

- [x] Define theme tokens as CSS variables
- [~] Gruvbox (dark + light) (only the dark variant shipped so far)
- [~] Catppuccin (Latte / Frappe / Macchiato / Mocha) (only the dark variant shipped so far)
- [x] Theme switcher, persist to `users.theme` via `PATCH /api/me`
- [x] Apply saved theme on load (avoid flash of wrong theme)

---

## 13. Docs and release

- [ ] Update README: features section is out of date (says nested child boards, rollup, WIP "per column"). Current design is task-links-to-board, flat progress, WIP only on ongoing cards
- [ ] Update project status line in README
- [ ] Add setup instructions (docker, `.env`, schema import)
- [ ] Add `LICENSE` file (README links to it)
- [ ] Document the API (endpoint list, request/response shapes)
- [ ] Production build of the frontend served by Apache

---

## Post-MVP ideas

- [ ] Multi-homing (one task on several boards), only if you can settle the done-state and WIP semantics
- [ ] Deep progress rollup across linked boards (needs cycle guarding)
- [ ] Archive / soft delete instead of hard cascade
- [ ] Labels, due dates, assignees
- [ ] Sharing boards between users
