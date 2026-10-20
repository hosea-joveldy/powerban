# DESIGN_SYSTEM.md: Powerban Design System Specification

## 1. Reference Derivation & Visual Identity

The design language is extracted directly from the four reference images in `references/`:
- **`landing-page-section1.png` (Hero)**: Warm light-stone neutral canvas (`#E5E7E2`), editorial serif display headings, sans-serif body, pill buttons with a right-hand circular status dot (`•`), and delicate celestial concentric particle/orbit geometries.
- **`landing-page-section2.png` (Product Showcase)**: Muted sage surface cards (`#DADBCE`), uppercase/pill category badges, dual action pills, and perspective dot-funnel visuals.
- **`landing-page-section3.png` (Dark Showcase Banner)**: Deep forest-obsidian card (`#16240F`), luminous lime-chartreuse accent pill (`#C8DB57`), crisp white typography, and circular visual apertures.
- **`login.png` (Authentication Card)**: Minimalist elevated card (`#EFF1EC`) with rounded corners (`18px`), centered typography, stacked input container with uppercase micro-labels (`EMAIL`, `PASSWORD`), visibility toggle, and split action pill `[ Log in ] [ -> ]` (omitting third-party OAuth in favor of focused email/password auth).

All screens in Powerban—including those without direct references (Register, Dashboard, Board kanban, Card columns, Task items, WIP indicators, Modals, and Settings)—derive strictly from this unified language.

### 1.1 Hero Mouse-Interaction Effect
- **Chosen Effect**: **Celestial Orbit Particle Mesh**
- **Rationale**: Directly evokes the concentric stippled ellipse orbits shown in `references/landing-page-section1.png` and `landing-page-section2.png`.
- **Behavior**: An interactive HTML5 Canvas element renders concentric elliptical paths populated with stippled dots and subtle planetary nodes. On desktop, moving the cursor applies smooth 3D tilt and perspective rotation (`rotateX`, `rotateY`) using linear interpolation damping (lerp factor `0.06`), while a soft radial gradient glow (`rgba(28, 40, 24, 0.05)`) tracks the cursor position.
- **Accessibility & Touch Fallback**:
  - When `@media (prefers-reduced-motion: reduce)` matches, the animation loops and pointer listeners are disabled; a static, high-contrast snapshot of the orbital rings is rendered.
  - On touch devices (`@media (hover: none)`), pointer tracking is deactivated and replaced by a gentle static or subtle CSS opacity pulse.

---

## 2. Design Tokens (CSS Variables)

All tokens are implemented as standard CSS variables on `:root` and theme data attributes. No CSS libraries or utility frameworks are used.

### 2.1 Typography
```css
:root {
  --font-serif: "Newsreader", "Playfair Display", "Instrument Serif", Georgia, "Times New Roman", serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Type Scale */
  --text-xs: 0.6875rem;   /* 11px - Micro labels, badges */
  --text-sm: 0.75rem;     /* 12px - Status line, helper text */
  --text-base: 0.875rem;  /* 14px - Body copy, standard inputs */
  --text-md: 1rem;        /* 16px - Card titles, navigation */
  --text-lg: 1.25rem;     /* 20px - Section headers */
  --text-xl: 1.75rem;     /* 28px - Auth headers, modal titles */
  --text-display: clamp(2.25rem, 4.5vw, 3.75rem); /* Hero display heading */

  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-loose: 1.65;
}
```

### 2.2 Spacing & Radii
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 28px;
  --radius-pill: 9999px;

  --shadow-sm: 0 1px 3px rgba(20, 28, 18, 0.04);
  --shadow-md: 0 4px 14px -2px rgba(20, 28, 18, 0.07);
  --shadow-lg: 0 12px 32px -6px rgba(20, 28, 18, 0.10);
  --shadow-modal: 0 24px 56px -12px rgba(10, 16, 9, 0.22);
}
```

### 2.3 Color Tokens & Themes

Powerban ships with two official themes derived from the references:
1. `stone-light` (Default): Recreates the airy, editorial light stone environment of sections 1 & 2 and the login view.
2. `forest-dark`: Recreates the rich deep-forest nocturnal environment of section 3.

```css
/* Stone Light (Default Theme) */
[data-theme="stone-light"], :root {
  --bg-canvas: #E5E7E2;
  --bg-surface: #EFF1EC;
  --bg-surface-elevated: #F7F8F4;
  --bg-surface-subtle: #DADBCE;
  --bg-glass: rgba(229, 231, 226, 0.85);

  --text-primary: #151A14;
  --text-secondary: #485045;
  --text-muted: #757D72;

  --border-subtle: rgba(21, 26, 20, 0.08);
  --border-default: rgba(21, 26, 20, 0.14);
  --border-strong: rgba(21, 26, 20, 0.26);

  --btn-primary-bg: #1B2818;
  --btn-primary-text: #FFFFFF;
  --btn-primary-hover: #263822;

  --btn-secondary-bg: #DADCD6;
  --btn-secondary-text: #1B2818;
  --btn-secondary-hover: #CFD2CB;

  --accent-lime: #C8DB57;
  --accent-lime-text: #16240F;

  --wip-normal-bg: rgba(21, 26, 20, 0.06);
  --wip-normal-text: #485045;
  --wip-full-bg: #FEE2E2;
  --wip-full-text: #991B1B;
  --wip-full-border: #F87171;

  --danger: #B91C1C;
  --danger-surface: #FEF2F2;
  --warning: #D97706;
  --success: #15803D;

  --backdrop-blur: rgba(21, 26, 20, 0.45);
}

/* Forest Dark Theme */
[data-theme="forest-dark"] {
  --bg-canvas: #121C0E;
  --bg-surface: #1B2916;
  --bg-surface-elevated: #22341C;
  --bg-surface-subtle: #172313;
  --bg-glass: rgba(18, 28, 14, 0.85);

  --text-primary: #F2F5F0;
  --text-secondary: #C4CBC1;
  --text-muted: #839080;

  --border-subtle: rgba(242, 245, 240, 0.09);
  --border-default: rgba(242, 245, 240, 0.16);
  --border-strong: rgba(242, 245, 240, 0.28);

  --btn-primary-bg: #C8DB57;
  --btn-primary-text: #121C0E;
  --btn-primary-hover: #D5E768;

  --btn-secondary-bg: #22341C;
  --btn-secondary-text: #F2F5F0;
  --btn-secondary-hover: #293F22;

  --accent-lime: #C8DB57;
  --accent-lime-text: #121C0E;

  --wip-normal-bg: rgba(242, 245, 240, 0.08);
  --wip-normal-text: #C4CBC1;
  --wip-full-bg: rgba(239, 68, 68, 0.2);
  --wip-full-text: #FCA5A5;
  --wip-full-border: #EF4444;

  --danger: #EF4444;
  --danger-surface: rgba(239, 68, 68, 0.12);
  --warning: #F59E0B;
  --success: #22C55E;

  --backdrop-blur: rgba(8, 14, 6, 0.65);
}
```

---

## 3. Component Rules

### 3.1 Buttons
- **Pill Primary (`.btn-pill-primary`)**:
  - `border-radius: var(--radius-pill);`
  - Padding: `10px 22px;`
  - Background: `var(--btn-primary-bg); color: var(--btn-primary-text);`
  - Status dot: Trailing circular node (`width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-left: 8px;`).
- **Pill Secondary (`.btn-pill-secondary`)**:
  - Same pill shape and dot; uses `var(--btn-secondary-bg)` and `var(--btn-secondary-text)`.
- **Split Action Button (Authentication)**:
  - Container with `display: inline-flex; border-radius: var(--radius-pill); overflow: hidden;`
  - Left segment: Action label (e.g. `Log in` or `Register`), padding `10px 20px`.
  - Right segment: Connected directional arrow `[ → ]`, border-left `1px solid rgba(255,255,255,0.15)`, padding `10px 14px`.

### 3.2 Form Controls & Stacked Inputs
- **Grouped Input Container (`.input-group-stacked`)**:
  - Recreates the login reference input box: single outer container with `border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-surface-elevated);`.
  - Internal divider: `1px solid var(--border-subtle)`.
  - Field section: Padding `10px 14px;`
  - Micro-label: `font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.06em;`.
  - Input field: Native `<input>`, `border: none; background: transparent; color: var(--text-primary); font-size: var(--text-base); outline: none; width: 100%;`.
  - Password field includes right-aligned password toggle icon button.

### 3.3 In-App Modal System
- Completely replaces browser native `alert()`, `confirm()`, and `prompt()`.
- **Backdrop**: Fixed overlay covering 100% viewport, `background: var(--backdrop-blur); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;`.
- **Dialog Container**:
  - `role="dialog" aria-modal="true"`
  - Background: `var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg); box-shadow: var(--shadow-modal);`
  - Width: `min(480px, 92vw); padding: var(--space-5);`
- **Modal Variants**:
  1. `MessageModal`: Title, message content, single primary dismissal pill `[ Understood ]`.
  2. `ConfirmModal`: Title, confirmation copy, danger/warning highlighting if destructive, action pills `[ Cancel ]` and `[ Confirm / Delete ]`.
  3. `PromptModal`: Title, label, text input, autofocus, submit on `Enter`, pills `[ Cancel ]` and `[ Submit ]`.
  4. `TaskDetailModal`: Task title input, multiline description textarea, linked board dropdown picker with live progress preview, status checkbox, and delete task button.
- **Accessibility & Focus**:
  - Focus trap keeps keyboard navigation inside the open dialog.
  - `Escape` key automatically dismisses the modal.
  - Clicking outside on the backdrop cancels/closes; it **never** triggers destructive operations.
  - On close, focus returns to the element that triggered the modal.

### 3.4 Kanban Board, Columns, and Tasks
- **Card Column (`.card-column`)**:
  - Width: `340px` on desktop (responsive `min(85vw, 340px)`); flex shrink `0`.
  - Background: `var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: var(--space-4);`.
  - Header: Card title in bold sans/mono (15px), three-dots menu dropdown button, card type indicator, WIP limit pill.
  - Three-dots Menu: Dropdown containing Set Card Type (Todo, Ongoing, Completed), Set WIP Limit, Add Task as a Card, Add Task as a Board, Turn Vertically & Hide Tasks, Delete Card.
- **Vertical Focus Column (`.card-column.is-vertical`)**:
  - Width: `54px`; min-width: `54px`; max-width: `54px`.
  - All tasks inside hidden (`display: none`).
  - Column title rotated 180° with vertical writing mode (`writing-mode: vertical-rl; transform: rotate(180deg);`) so text reads upwards with letters facing to the left.
  - Clicking uncollapses the card back to standard horizontal layout.
- **WIP Indicator Pill**:
  - Available on all non-completed cards (both `todo` and `ongoing`).
  - Standard state: `background: var(--wip-normal-bg); color: var(--wip-normal-text); border-radius: var(--radius-pill); padding: 2px 8px; font-size: var(--text-xs); font-family: var(--font-mono);`.
  - Capacity reached / exceeded: `background: var(--wip-full-bg); color: var(--wip-full-text); border: 1px solid var(--wip-full-border); font-weight: 700;`.
- **Task Item (`.task-card`)**:
  - Background: `var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-2); box-shadow: var(--shadow-sm); cursor: grab;`.
  - Task title font size: `16px`; task description: `13px-14px`.
  - No manual checkbox button; completed column tasks automatically display finished styling (`opacity: 0.72; text-decoration: line-through; color: var(--text-muted);`).
  - Nested card / board task: displays `[Card]` or `[Board]` badge with subitems count. Moving to a completed card is blocked if subitems > 0.
- **Drag and Drop Isolation**:
  - Cards dragged via header/drag handle with `type: card`; tasks dragged with `type: task` and `e.stopPropagation()`.
  - Conflict-free drop zones prevent simultaneous movement.

---

## 4. UI States

1. **Loading State**:
   - Content areas render smooth pulsing skeleton shapes (`background: linear-gradient(90deg, var(--bg-surface-subtle) 0%, var(--bg-surface-elevated) 50%, var(--bg-surface-subtle) 100%); background-size: 200% 100%; border-radius: var(--radius-sm);`).
   - No flickering raw text or misaligned spinners.
2. **Empty State**:
   - Centered container within lists or boards with muted illustration/icon, clean serif title ("No boards in this group yet"), body text, and a prominent pill CTA button ("+ Create Board").
3. **Error State**:
   - Inline form error: High-contrast red callout text below inputs with `font-size: var(--text-sm); color: var(--danger);`.
   - Request failure: Non-blocking inline banner or accessible `MessageModal`.
4. **Full WIP State**:
   - Column WIP counter highlights in warning colors.
   - Column `+ Add Task` button becomes disabled (`cursor: not-allowed; opacity: 0.5;`) with an accessible tooltip explanation ("WIP limit reached (3/3)").

---

## 5. Mobile & Responsive Rules

- **Breakpoints**:
  - Desktop: `1024px+`
  - Tablet: `768px - 1023px`
  - Mobile: `< 768px` (Tested down to `375px` iPhone SE width).
- **Responsive Adaptations**:
  - **Landing Page**: Hero display headline scales down using `clamp(2rem, 7vw, 3.75rem);`. Top navigation collapses to a clean compact mobile drawer or direct CTA. Multi-column cards stack vertically into single columns with `16px` padding.
  - **Auth Pages**: Login/Register card expands to `92vw` width with centered layout and comfortable `44px` minimum touch targets for all inputs and buttons.
  - **Board View**: Horizontal swipe-scrolling with CSS scroll snap (`scroll-snap-type: x mandatory;`) for columns on mobile, preventing viewport distortion.
  - **Modals**: Full responsive width (`92vw`), anchored in center viewport with bottom-sheet adaptability if keyboard expands.

---

## 6. Accessibility & Usability Rules

- **Contrast**: All text pairings strictly meet WCAG 2.1 AA (minimum `4.5:1` contrast ratio for normal text, `3:1` for large display text and UI boundaries).
- **Focus Indicators**: Every interactive control (buttons, links, inputs, checkboxes) possesses a high-contrast focus ring (`outline: 2px solid var(--accent-lime); outline-offset: 2px;`).
- **Semantic Roles**: All modal dialogs have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
- **Keyboard Navigation**:
  - Full tab order traversing interactive elements logically.
  - `Esc` closes any active modal dialog.
  - `Enter` submits single-input prompt modals and authentication forms.
