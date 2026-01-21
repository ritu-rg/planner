# CLAUDE.md

## Project Overview

Digital Planner 2026 - React SPA with custom utility CSS and localStorage persistence.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build to dist/
npm run build:static # Distributable build to dist-static/
npm run serve:static # Serve static build at http://localhost:3001
npm test             # Run Playwright tests
npm run test:static  # Run static build tests
```

## File Structure

```
src/
├── App.jsx              # Main component (all pages, state, formatting)
├── main.jsx             # React entry point
├── index.css            # Custom utility CSS
└── components/
    ├── CheckboxList.jsx # Todo list with copy-to-date feature
    ├── GoogleCalendar.jsx
    ├── Section.jsx
    ├── SimpleInput.jsx
    └── SimpleTextArea.jsx  # contentEditable rich text
tests/
├── typing.spec.js       # Text input and navigation tests
└── static-build.spec.js # Static build verification tests
```

## Architecture

### State Management
- All state in `DigitalPlanner2026` component via `useState`
- `textContent` - stores all text field values by `fieldKey`
- `checkboxLists` - stores checkbox items by `listKey`
- Auto-save to localStorage with 1-second debounce

### Components
- Extracted to module level with `React.memo()` to prevent re-renders
- Use controlled pattern: `value`, `onChange`, `onFocus` props
- `activeTextareaRef` tracks focused element for formatting

### Formatting System
- `PageFormattingToolbar` - sticky toolbar with formatting buttons
- `applyFormat(command, value)` - uses `document.execCommand`
- Format Painter: `copyFormat()` captures formatting, `applyStoredFormat()` applies it
- Formats: bold, italic, highlight colors, text colors, fonts, sizes, headings, bullets

### Navigation & URL Routing
- `currentPage` state determines which page renders
- `navigateTo(page, crumb)` - forward navigation with breadcrumbs
- `navigateToBreadcrumb(index)` - backward navigation
- Pages: cover, contents, calendar, yearly, quarter, month-calendar, month-overview, week, day
- Hash-based URLs: `/#/cover`, `/#/day/3/15`, `/#/week/6/2`, `/#/quarter/2`
- `getInitialNavState()` - parses URL hash on load for bookmark/refresh support
- `storage` event listener enables cross-tab data sync

### Color Palette
- Background: `#c6a4a4` (mauve)
- Paper: `#FBEAD6` (champagne)
- Pink accent: `rgba(242, 198, 222, 0.3)`
- Text: `#673147` (burgundy)
- Border: `#C4A574` (gold)

## Key Patterns

- Field keys: `{page}-{field}` (e.g., `'yearly-goals'`, `'jan-1-schedule'`)
- All buttons: champagne bg `rgba(251, 234, 214, 0.7)`, gold border `#C4A574`
- Text areas: pink accent bg with gold border
- Binder layout: two-page spread with gold rings between pages

## Common Gotchas

- Components must receive `value`, `onChange`, `onFocus` props
- Never set `textarea.value` directly - update state instead
- Unique `fieldKey`/`listKey` required for each input
- Port 3000 configured in `vite.config.js`
