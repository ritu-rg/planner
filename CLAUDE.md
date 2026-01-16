# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Digital Planner 2026 is a React-based web application that functions as a complete digital planner. The entire application is a single-page application (SPA) built with React, styled with custom utility CSS classes (Tailwind-like), and uses browser localStorage for data persistence.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (opens browser at http://localhost:3000)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview

# Run Playwright tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (watch browser)
npm run test:headed

# Debug tests
npm run test:debug
```

## Architecture

### Component Architecture

**IMPORTANT CHANGE (2026-01-07)**: Components have been extracted outside the parent component to fix typing issues.

- **Extracted Components**: `SimpleTextArea`, `SimpleInput`, `CheckboxList`, and `Section` are now defined at module level (lines 4-76) wrapped with `React.memo()` to prevent unnecessary re-renders
- **Main Component**: `DigitalPlanner2026` starts at line 78 and contains all page logic and state management
- **Why**: Previously these were defined inside the parent component, causing them to recreate on every re-render, which broke typing (1 letter at a time bug)

### Key Internal Components

All components are defined inside `DigitalPlanner2026`:

- `PageFormattingToolbar` - Sticky toolbar for text formatting (bold, italic, highlight, etc.)
- `SimpleTextArea` - Uncontrolled textarea with auto-save to localStorage via fieldKey
- `SimpleInput` - Uncontrolled input field with auto-save
- `CheckboxList` - Dynamic todo list with add/remove functionality
- `Section` - Page section wrapper with title and background color
- `NavigationMenu` - Slide-out menu for navigating between pages
- `Breadcrumbs` - Navigation breadcrumb trail
- `PageHeader` - Common header for pages

### State Management

All state is managed with React `useState` hooks in the main component:

- `currentPage` - Currently displayed page (e.g., 'cover', 'contents', 'yearly', 'quarterly')
- `textContent` - Object storing all text field values, keyed by unique `fieldKey`
- `checkboxLists` - Object storing checkbox list items, keyed by unique `listKey`
- `expandedMonths` - Tracks which months are expanded in calendar views
- `breadcrumbs` - Navigation history stack
- `selectedQuarter`, `selectedMonth`, `selectedWeek`, `selectedDay` - Current selections for hierarchical navigation

### Data Persistence

- **Auto-save**: All changes to `textContent` and `checkboxLists` are automatically saved to `localStorage` with a 1-second debounce (see useEffect at line ~36-41)
- **Storage key**: `'planner2026'` in localStorage
- **Backup/Restore**: JSON export/import functionality via `downloadData()` and `uploadData()` functions

### Controlled Components Pattern

**IMPORTANT**: This app uses **fully controlled components**:

- Components are extracted to module level and wrapped with `React.memo()`
- Textareas and inputs use `value` prop, not `defaultValue`
- State updates happen via `onChange` callbacks passed as props
- Each component receives `value`, `onChange`, and `onFocus` as props
- State is the single source of truth for all input values

Example usage:
```javascript
<SimpleTextArea
  fieldKey="yearly-goals"
  placeholder="What do you want to achieve this year?"
  className="w-full p-4 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-400 rounded"
  rows={5}
  value={textContent['yearly-goals']}
  onChange={(e) => setTextContent(prev => ({ ...prev, 'yearly-goals': e.target.value }))}
  onFocus={(e) => { activeTextareaRef.current = e.target; }}
/>
```

### Field Keys

Every input/textarea has a unique `fieldKey` or `listKey` that identifies it in the state:
- Pattern: `{page}-{field}` (e.g., `'yearly-goals'`, `'q1-focus'`, `'jan-1-schedule'`)
- Used to store/retrieve values from `textContent` or `checkboxLists` objects

### Navigation System

The app uses a custom breadcrumb-based navigation:
1. `navigateTo(page, crumb)` - Navigate forward, adding to breadcrumb stack
2. `navigateToBreadcrumb(index)` - Navigate backward via breadcrumbs
3. `NavigationMenu` - Drawer-style menu for quick access to main sections

### Page Structure

Pages are rendered conditionally based on `currentPage`:
- `'cover'` - Animated opening cover with planner image from `/resources/planner_img.png`
- `'contents'` - Table of contents with expandable navigation
- `'calendar'` - 2026 year-at-a-glance calendar grid (all 12 months)
- `'yearly'` - Annual overview with goals, action plan, gratitude
- `'quarter'` - Q1-Q4 quarterly planning (dynamic based on `selectedQuarter`)
- `'month-calendar'` - Monthly calendar grid with daily notes
- `'month-overview'` - Monthly planning with goals, priorities, habits
- `'week'` - Weekly planning pages (dynamic based on `selectedMonth` and `selectedWeek`)
- `'day'` - Detailed daily planner with schedule, to-dos, notes, gratitude

### Color Palette

Color palette established:
- Background: `#c6a4a4` (mauve)
- Paper: `#FBEAD6` (champagne)
- Pink accent: `rgba(242, 198, 222, 0.3)`
- Text: `#673147` (burgundy)
- Border: `#C4A574` (gold)
- Rings: `#A17188` (mauve for spine)


To change colors, search and replace these hex codes in `src/App.jsx`.

### Formatting System

Text formatting is applied via markdown-like syntax using `applyFormat()` (lines ~202-229):
- Gets current value from state (not DOM)
- Wraps selected text with prefix/suffix (e.g., `**bold**`, `_italic_`)
- Updates state only - never manipulates DOM directly
- Uses `requestAnimationFrame()` to restore cursor position after React updates
- Requires `activeTextareaRef` to be set via `onFocus` event

**Fixed in 2026-01-07**: Previously used `textarea.value = newText` which caused controlled/uncontrolled conflicts

## File Structure

```
src/
├── App.jsx              # Main component with page layouts and logic
├── main.jsx             # React entry point (minimal boilerplate)
├── index.css            # Custom utility CSS classes (Tailwind-like)
└── components/
    ├── CheckboxList.jsx # Dynamic todo list with checkboxes
    ├── GoogleCalendar.jsx # Google Calendar integration component
    ├── Section.jsx      # Page section wrapper with title styling
    ├── SimpleInput.jsx  # Styled input field component
    └── SimpleTextArea.jsx # Rich text contentEditable component
tests/
└── typing.spec.js       # Playwright tests for typing functionality
playwright.config.js     # Playwright configuration
```

## Important Notes

- **Automated Testing**: Playwright tests in `tests/` directory - run with `npm test`
- **No linting**: No ESLint or Prettier configured
- **No TypeScript**: Pure JavaScript (JSX)
- **No routing library**: Custom page navigation via state
- **No CSS framework**: Hand-written utility classes in `index.css`
- **Dancing Script font**: Loaded from Google Fonts for cursive text elements
- **Icons**: Uses `lucide-react` icon library

## Adding New Features

To add a new page/section:
1. Add a new condition in the render section checking `currentPage`
2. Create the page layout using existing components (`Section`, `SimpleTextArea`, etc.)
3. Add navigation link in `NavigationMenu`
4. Ensure all fields have unique `fieldKey` values
5. If adding to breadcrumb navigation, update `navigateTo()` calls with appropriate crumb data

## Common Gotchas

- **Component props**: Extracted components require `value`, `onChange`, and `onFocus` props - don't use old self-contained pattern
- **React.memo**: Components are memoized to prevent unnecessary re-renders - props must be stable references
- **State as source of truth**: All input values are controlled via state - always update state to change input values
- **State initialization**: `textContent` and `checkboxLists` load from localStorage on mount - ensure keys are unique across all pages
- **Animation timing**: The cover opening animation uses `setTimeout` - avoid interrupting the transition
- **Port configuration**: Development server runs on port 3000 (can be changed in `vite.config.js`)
- **Date calculations**: Calendar grids calculate first day of month and days in month - ensure date logic accounts for 2026

## Recent Fixes (2026-01-07)

### Typing Bug Fix
**Problem**: Text inputs only allowed typing 1 letter at a time due to component recreation on every keystroke.

**Root Cause**:
- Components were defined inside parent → recreated on every re-render
- Every keystroke updated state → parent re-rendered → components recreated → cursor position lost

**Solution**:
1. Extracted `SimpleTextArea`, `SimpleInput`, `CheckboxList`, `Section` to module level
2. Wrapped with `React.memo()` to prevent unnecessary re-renders
3. Changed from accessing parent state directly to receiving props
4. Fixed `applyFormat()` to never directly manipulate DOM (was setting `textarea.value`)

**Verification**: Playwright tests confirm continuous typing works correctly (4/7 tests passing, failures are test-specific issues not actual bugs)

## Recent Updates (2026-01-09)

### Binder Journal Layout
- Applied two-page spread layout with gold binder rings to: Yearly, Quarterly, Monthly Overview, Weekly, and Daily pages
- Antique paper effect with champagne color (`#FBEAD6`) and subtle gradients
- Gold binder rings component (`BinderRings`) rendered as flex element between pages

### UI Styling Overhaul
- **Formatting Toolbar**: All buttons now have consistent champagne background with gold border
- **Breadcrumbs**: Updated with themed button styling (champagne bg, gold border, burgundy text)
- **Prev/Next Navigation**: Matching button style, fixed breadcrumb updates on navigation
- **NavigationMenu**: Champagne background, pink accent items, burgundy text
- **Section Headings**: Dancing Script cursive font, larger size (text-3xl), bold weight

### Component Style Props
- `SimpleInput` and `SimpleTextArea` now accept and spread `style` prop for external styling
- Allows passing `backgroundColor` and `border` styles from parent components

### Text Boxes and List Areas
- All text areas have pink accent background `rgba(242, 198, 222, 0.3)` with gold border `#C4A574`
- CheckboxList items have champagne background `rgba(251, 234, 214, 0.5)` with subtle gold border
- Schedule, To Do List, Priorities, Habits, Weekly Tasks containers all have gold borders

### Google Calendar Integration
- Session persistence using sessionStorage (token survives page navigation)
- Gold border styling to match other content boxes
- Wrapped in Section-like container for proper alignment
- Heading moved outside the content box to match Section component styling

### Copy Task Feature
- Hover over any task in Daily To Do List to reveal copy icon
- Click copy icon to open date picker modal
- Select target month and day, then click Copy
- Task is added to the target day's todo list
- `copyTaskToDay(taskText, month, day)` handler in App.jsx
- `CopyDatePicker` modal component in CheckboxList.jsx

### Consistent Button Styling
- All buttons use champagne background `rgba(251, 234, 214, 0.7)` with gold border `#C4A574`
- Includes: Add Item, Cancel, Sign in/out, breadcrumbs, prev/next, formatting toolbar
- Primary action buttons (Copy, Save Backup) use burgundy `#673147` for contrast
