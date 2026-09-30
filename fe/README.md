# Powerban frontend

React + Vite, plain CSS (no UI framework). Talks to the PHP backend under
`/qibar/powerban/api` via a dev-server proxy, so the session cookie works
without any CORS setup.

## Run it

```bash
cd fe
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The backend
(Apache on port 80) must already be running via docker-compose.

If Apache isn't on `http://localhost:80`, edit the proxy target in
`vite.config.js`.

## What's here

- `src/api.js` — fetch wrapper, `credentials: "include"` for the session cookie
- `src/AuthContext.jsx` — current user, login/register/logout, theme
- `src/themes.css` + `src/themes.js` — 5 color schemes as CSS variables
- `src/pages/` — Login, Register, Dashboard, Board, Settings
- `src/components/` — TopBar, BoardTile, TemplateTile, CardColumn, TaskItem

## Known gaps (MVP-level, not polished)

- Drag-and-drop uses plain HTML5 DnD (draggable + dataTransfer), not a
  library like dnd-kit — works, but no drag preview styling or touch support
- Forms for naming things use `prompt()`/`confirm()`, not modals
- No loading skeletons; pages render blank until data arrives
- Not built for production yet (no `npm run build` output wired into Apache)

## Not yet verified

This was written without a working npm registry available in the build
environment, so `npm install` / `npm run build` have not actually been run
against it. The code was checked for balanced brackets/braces/parens and
reviewed by hand, but that is not the same as running it. Report the first
error you hit.
