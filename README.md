<p align="center">
  <img src="assets/logo.svg" alt="powerban logo" width="320">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT">
  <img src="https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/backend-PHP-777BB4?logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

<p align="center">
  <b>Kanban board for power users.</b><br>
  Create multiple boards, group them, nest boards inside other boards, and more.
</p>

<p align="center">
  <i>Project status: Planning and setup.</i>
</p>

<p align="center">
  <a href="#features">Features</a> · <a href="#license">License</a>
</p>

---

## Features

Here are the features that will be developed, at least until the MVP.

**Functional**
- Multiple boards, organized into groups
- Nested boards: a task can be a board
- WIP limits per column
- Progress bars that roll up from child boards to parent cards
- Board and card templates

**Customization**
- Themes: Gruvbox, Catppuccin, and more


## Setup
 
Requires Docker and Node.js.
 
One `.env` at the project root is required, filled in **before** starting
the containers (`docker-compose.yml` reads it at startup, and the PHP
backend reads the same file directly — see [SETUP.md](SETUP.md) for the
exact keys).
 
```bash
# fill in powerban/.env first, then:
 
# backend: start containers, create the database, load schema + templates
docker compose up -d
docker exec -i <db-container> psql -U <DB_USER> -d postgres < be/db/schema.sql
docker exec -i <db-container> psql -U <DB_USER> -d powerban < be/db/seed.sql
 
# frontend
cd fe
npm install
npm run dev
```
 
See [SETUP.md](SETUP.md) for the full walkthrough, Apache configuration,
and troubleshooting.
 
## License
 
This project is licensed under the [MIT License](LICENSE).
