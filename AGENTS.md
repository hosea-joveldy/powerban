# AGENTS.md

Shared rules for all agents. Humans own this file and `agent/roles/*.md`; agents never edit them. Each agent reads this file and only its own role file (`agent/roles/<role>.md`).

Mode: manual
<!-- manual: agents commit themselves. scripted: a script owns `status` and all commits. -->

## 1 Project

Powerban: kanban board for power users, built for a school assignment (MIT licence). Users create multiple boards, group them, link a task to another board, and save boards as templates.

Terms: **card** = a stage/column on a board (todo, ongoing, completed). **task** = the to-do item inside a card. **linked board** = a task pointing at another board, showing its progress.

Existing state: the backend is believed feature-complete; verify, don't rebuild. The frontend MVP was never run through `npm install` / `npm run build`; treat it as unverified. Do not re-scaffold what exists.

Open work (the Planner turns this into tasks):
- New frontend design from `references/` (section 10): the current UI looks like a demo. Includes a landing page (call to action leads to login), restyled login and register
- Remove every native `alert(`, `confirm(` and `prompt(`; replace with in-app modals: message, confirm, single-input prompt, task detail (title, description, linked board)
- README is stale (nested boards, rollup progress, "WIP per column"); rewrite features and status from the code. Remove the link to the nonexistent `SETUP.md`
- Add an MIT `LICENSE` file; write API documentation (endpoints, request/response shapes)
- Rate limit repeated failed logins; add indexes only if a query is slow
- Frontend gaps: drag and drop for tasks and cards, loading/empty/error states; production build served by Apache

## 2 Constraints

- Keep the stack simple. No heavy dependencies unless clearly needed.
- Backend: PHP, no Composer (manual autoloader), PostgreSQL. Frontend: React + Vite, plain CSS, no UI framework.
- Same-origin only, no CORS; dev uses a Vite `server.proxy` for the API path.
- Every query uses prepared statements. Every endpoint touching user data enforces ownership (a user touches only their own groups, boards, cards, tasks).
- API errors are JSON `{"error": ...}`; never leak stack traces. `display_errors` is off outside dev (warnings break frontend JSON parsing). Invalid JSON body: 400.
- Out of scope until post-MVP: one task on several boards, deep progress rollup, archive/soft delete, labels/due dates/assignees, board sharing, task templates.
- Never commit `.env`, secrets, dependencies or build output.

## 3 Stack and decisions

Layout: `be/` PHP backend (`be/public/index.php`, `src/routes.php`, `be/db/schema.sql`, `be/db/seed.sql`); `fe/` React/Vite; root `README.md`; `references/` UI references. App base path `/qibar/powerban`, API at `/qibar/powerban/api`.

Decisions made. To reverse one, write `.run/blocked.txt`.
- Auth: PHP sessions. Cookie `powerban_session`, scoped to `/qibar/powerban`, HttpOnly, SameSite, Secure on HTTPS.
- Templates are per user. "Save as template" copies the board; "use template" copies the template into a new board. Copies keep tasks, links and `is_finished`. Templates stay out of the normal board list.
- Built-in templates (Simple Kanban, Sprint Board, Personal Goals) belong to `system@powerban.local`, seeded by `be/db/seed.sql`. `GET /api/templates` returns the user's own plus the system's.
- A new board starts with three cards: Todo, Ongoing, Completed. A board may have several `completed` cards; progress counts all of them.
- `wip_limit` applies only to `ongoing` cards. It is cleared automatically when a card stops being `ongoing`; sending one for a non-ongoing card is a 422. A limit below the current task count is allowed and only blocks adding more.
- A card becoming `completed` finishes all its tasks; leaving it unfinishes them. A task moved into `completed` is finished; moved out, unfinished. `is_finished` can be toggled by hand elsewhere.
- Deleting a card that still has tasks returns 409 unless `?force=1`.
- A task may link to any of the user's own non-template boards except the one it sits on. Deleting the target clears the link.
- Deleting a group makes its boards standalone (`ON DELETE SET NULL`).
- Positions are integers, renumbered 0..n-1 whenever something is placed at an index. Boards have no `position` column; they are ordered by id.
- Progress is flat: `{done, total, percent}` = tasks in `completed` cards / total tasks; empty boards give 0. The dashboard computes all boards' progress in one query.
- No trigger sets `updated_at`; models set it on write.

## 4 Workflow

- One task per fresh session. Memory lives in files, never in chat history.
- Flow: Planner, then human approval, then per task: Builder, gate, QA, fix loop, commit.
- Task types: `build` (features, one commit each), `qa` (no features, no commit, whole-app pass), `fix` (goes straight to the Builder, never back to the Planner), `docs`.
- Fix loop: max 3 rounds per task. After the third failed round write `.run/blocked.txt` and stop.
- Gate: plain commands, no AI; all must pass before QA signs off (section 6).
- Context: read only your task, the files it touches, and `DESIGN_SYSTEM.md` for UI work.
- Session start: confirm branch `dev`; read your role file, `TASKS.json`, the tail of `.run/progress.log`.

## 5 State files

`SPEC.md`, `DESIGN_SYSTEM.md`, `TASKS.json`, `QA_REPORT.md` (ids B1, B2, ...).
- `.run/progress.log`: append-only, max 5 lines per session, committed.
- `.run/blocked.txt`: a question for the human; the agent stops after writing it. Gitignored.
- `.run/screenshots/`: gitignored.

`TASKS.json` shape:
```json
{"tasks":[
 {"id":"T1","title":"Scaffold","type":"build","status":"todo",
  "features":[{"id":"T1.1","title":"…","done":false,"done_when":["build passes"]}]},
 {"id":"T8","title":"Full-app QA pass","type":"qa","status":"todo","features":[]},
 {"id":"T9","title":"Fix B1","type":"fix","status":"todo","source":"QA_REPORT.md#B1","features":[]}
]}
```
- `status` is `todo`, `ongoing` or `finished`; only one task is `ongoing`.
- Agents change only `status` and a feature's `done`. QA may append `fix` tasks. Nobody renames tasks or edits `done_when`.
- Scripted mode: the script owns `status` and commits.

## 6 Commands

Frontend: `cd fe && npm install`, `cd fe && npm run dev`.

Gate (all must pass):
- Type check: TODO(human): command
- Unit tests: TODO(human): command
- Build: `cd fe && npm run build` (TODO(human): confirm script)
- Backend API tests: TODO(human): command
- E2E tests: TODO(human): command

For each TODO(human) gate command, the Planner adds an early build task to set it up and records the command in `SPEC.md` under "Gate".

## 7 Environment and secrets

The human has set up the environment. Do not change environment, container or deployment config. Assume the app and database run; if not, write `.run/blocked.txt` and stop. Never print, log or commit secrets or `.env`.

## 8 Tests

- QA alone creates and edits tests. The Builder never does; it owns test tooling and config (runner, config files, scripts).
- Unit tests mirror the source tree; offline, deterministic.
- E2E: one spec per UI feature. Find elements by role, label or text; `data-testid` only as a fallback. No fixed sleeps.
- Backend API tests cover every endpoint plus the constraints in section 3 (WIP on a non-ongoing card, `is_finished` on completed cards, cross-user access, 409 on deleting a card with tasks).

## 9 Browser verification

- QA uses the harness's browser tool the first time a UI feature is verified, at phone and desktop widths. It saves screenshots to `.run/screenshots/`, then converts what it checked into an e2e spec.
- Regression is covered by running e2e tests, not by re-driving the browser.
- QA compares referenced screens against `references/` at desktop and phone widths, all screens against `DESIGN_SYSTEM.md`. Judge layout, hierarchy, colour and type, not pixel equality.
- Use the browser tool again only for new UI, visual checks against the references or design file, or on the human's request.

## 10 Design

The Planner writes `DESIGN_SYSTEM.md` before any code: short, concrete, checkable. It covers tokens, component rules, states, mobile and accessibility rules. The Builder implements the tokens once; QA checks the UI against it. Design tools are optional, Planner only.

References (human-provided, read-only) are in `references/`:
- `landing-page-section1.png` (hero) to `landing-page-section3.png`, in page order; `login.png`.
- A screen with a reference (landing, login) follows it closely: layout, hierarchy, mood, colour, type. Not pixel for pixel: small deviations for usability or accessibility are fine, large departures are not.
- Every other screen (register, dashboard, board, cards, tasks, WIP indicator, linked-board widget, template picker, modals, empty/loading/error states) is designed by the Planner from the same references. Put the shared language (colour roles, type, spacing, radii, elevation, motion) and each derived decision in `DESIGN_SYSTEM.md`. It must look like one product.
- Discard the old design: no reuse of previous palettes, the five old themes or the old layout.
- Landing hero: add a light mouse-interaction effect (for example parallax, a following glow or tilt), chosen by the Planner to suit the references. Honour `prefers-reduced-motion`; on touch devices use a static or self-animated fallback.

It must reflect:
- Plain CSS with tokens as CSS variables; no UI framework.
- The theme is saved per user in `users.theme` via `PATCH /api/me`. The Planner decides in `SPEC.md` whether the new design ships one theme or several; if there is a switcher, keep that persistence and apply the saved theme on load without a flash of the wrong theme.
- `ongoing` cards show a WIP indicator (for example `3/5`), highlighted when full.
- Tasks in `completed` cards have finished styling.
- A linked task shows the board name and a progress bar; clicking opens that board.
- The landing page is the entry route; logged-in visitors go to the dashboard.
- No native dialogs. Modals: focus trap, Esc closes, click-outside never confirms a destructive action, focus returns to the trigger, dialog roles and labels, usable at phone width. API errors show inline or in a modal.

## 11 Git

- All work on branch `dev`. The Planner alone may run `git switch -c dev` (or `git switch dev` if it exists).
- Manual mode: the Builder commits once per feature, message `<feature id>: <title>`; for `fix` tasks `<task id>: <title>`. The Planner commits its files as `plan: <summary>`, QA its tests and report as `<task id>: tests`.
- Scripted mode: agents never commit.
- Allowed: `status`, `diff`, `log`, `add`, `commit`.
- Forbidden: `reset`, `rebase`, `amend`, `merge`, `push`, `stash`, any force option.

## 12 Definition of done

Per feature:
- Every `done_when` is verified.
- The full gate passes.
- Earlier features still work.
- UI is checked at phone and desktop widths against `DESIGN_SYSTEM.md`.
- `.run/progress.log` is updated.

## 13 Rules for all agents

- Stay in your role and task. Note unrelated problems in `.run/progress.log`; don't fix them.
- Small reversible implementation choices inside your task are yours to make. If behaviour or scope is ambiguous, write the question to `.run/blocked.txt` and stop.
- Never claim something works without running it. Never mark a task `finished` on your own say-so.
- Never edit `AGENTS.md`, role files, or another role's outputs.
