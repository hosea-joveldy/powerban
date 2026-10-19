# Powerban

Kanban board for power users. Create multiple boards, organize them into groups, link tasks to other boards with live progress badges, and save boards as reusable templates.

Licensed under the [MIT License](LICENSE).

---

## Features

### Workspaces & Groups
- Organize project boards into custom named groups or keep them as standalone boards.
- Deleting a group retains its boards as standalone boards without data loss.

### Board Kanban & Columns
- Each new board starts with three standard cards: **Todo**, **Ongoing**, and **Completed**.
- Boards support multiple completed cards; progress accounts for all tasks in any completed column.
- Drag-and-drop tasks between columns or re-order cards seamlessly.

### Strict WIP Limits on Ongoing Columns
- Work-In-Progress (WIP) limits apply strictly to `ongoing` cards to enforce delivery focus.
- When an ongoing card reaches its WIP limit, the header badge highlights in warning colors and adding tasks is blocked until capacity clears.
- WIP limits are automatically cleared if a card's type is changed from `ongoing`.

### Automatic Completion Rules
- Tasks moved into a `completed` card are automatically marked `is_finished = true`.
- Tasks moved out of a `completed` card are automatically unmarked (`is_finished = false`).
- Manual toggle of `is_finished` is supported in non-completed columns.

### Linked Boards & Progress Tracking
- A task can link to any of the user's other non-template boards.
- Linked tasks display a live progress badge with the target board's title and flat completion ratio (`{done, total, percent}`).
- Clicking a linked badge immediately opens the target board.
- Deleting a target board safely clears associated task links.

### Reusable Board Templates
- Built-in starter templates: **Simple Kanban**, **Sprint Board**, and **Personal Goals**.
- Save any existing board as a private template with all cards, tasks, and link configurations preserved.
- Instantiate new boards instantly from any available template.

### Theme & Design System
- Modern editorial aesthetic derived from clean typography and surface layering.
- Built-in themes: **Stone Light** (default) and **Forest Dark** (nocturnal forest with lime accents).
- Theme preferences persist per-user via `PATCH /api/me` and load without flash-of-unstyled-theme (FOUT).

### Accessible In-App Modal System
- Complete elimination of native browser dialogs (`alert`, `confirm`, `prompt`).
- Accessible modal dialogs with `role="dialog"`, `aria-modal="true"`, keyboard focus trapping, Escape dismissal, and focus restoration to trigger elements.

### Security & Rate Limiting
- PHP session authentication with secure cookies (`powerban_session`, HttpOnly, SameSite, Secure).
- Application-level rate limiting on failed login attempts (5 attempts per 15 minutes returns HTTP 429 Too Many Requests).
- Strict ownership verification on every database query using prepared statements.

---

## Technology Stack

- **Backend**: PHP 8.4 (vanilla, manual autoloader, no Composer), PostgreSQL 15, Apache.
- **Frontend**: React 18, Vite 5, Plain CSS with custom properties (no UI component libraries).
- **Testing**: Vitest (frontend unit tests), Playwright (end-to-end tests across Chromium and Mobile), Shell/cURL (backend API test suite).

---

## Setup & Running

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) (v18 or higher) & npm

### 1. Environment Configuration
Create a `.env` file at the repository root:

```env
POSTGRES_DB=powerban
POSTGRES_USER=powerban
POSTGRES_PASSWORD=secret
DB_HOST=school-db-1
DB_PORT=5432
DB_NAME=powerban
DB_USER=powerban
DB_PASS=secret
APP_ENV=dev
```

### 2. Start Backend & Database
Start the Docker containers and seed the database schema and starter templates:

```bash
# Start containers
docker compose up -d

# Initialize database schema
docker compose exec -T school-db-1 psql -U powerban -d powerban < be/db/schema.sql

# Seed system templates and initial accounts
docker compose exec -T school-db-1 psql -U powerban -d powerban < be/db/seed.sql
```

The backend API will be available at `http://localhost/qibar/powerban/api`.

### 3. Frontend Development
Run the Vite development server with proxy configured to the local PHP backend:

```bash
cd fe
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Production Build
To create an optimized production build:

```bash
cd fe
npm run build
```

Assets are emitted to `fe/dist/`.

---

## Verification & Test Gate

Powerban maintains a comprehensive automated test gate:

```bash
# 1. Frontend Type Check
cd fe && npm run typecheck

# 2. Frontend Unit Tests
cd fe && npm test

# 3. Frontend End-to-End Tests
cd fe && npm run test:e2e

# 4. Backend API Integration Tests
bash be/tests/run_tests.sh
```

---

## API Reference

Comprehensive documentation for all REST API endpoints (authentication, groups, boards, cards, tasks, and templates) is available in [docs/API.md](docs/API.md).

---

## License

This project is licensed under the [MIT License](LICENSE).
