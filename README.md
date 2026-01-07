# Digital Planner 2026

A beautiful, feature-rich digital planner built with React for organizing your 2026 goals, schedules, and daily tasks.

## Features

- ✨ **Beautiful cover design** with custom planner artwork
- 📅 **Complete 2026 calendar** with yearly, quarterly, monthly, weekly, and daily views
- ✍️ **Text formatting** - Bold, italic, highlights, colors, headings, and bullets
- 📝 **Rich note-taking** - Controlled textareas with instant updates
- ✅ **To-do lists** with checkboxes
- 💾 **Auto-save** - All data saved to localStorage
- 📥 **Backup/Restore** - Download and upload your planner data as JSON
- 🎨 **Mauve color palette** - Beautiful, calming design

## Prerequisites

- **Node.js** (version 16 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

## Setup Instructions

### 1. Install Dependencies

Open a terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install:
- React 18.2.0
- React DOM 18.2.0
- Lucide React (for icons)
- Vite (build tool)

### 2. Development Mode

To run the app in development mode with hot-reload:

```bash
npm run dev
```

The app will automatically open in your browser at `http://localhost:3000`

Any changes you make to the code will automatically reload in the browser!

### 3. Build for Production

To create an optimized production build:

```bash
npm run build
```

This creates a `dist` folder with optimized files ready for deployment.

### 4. Preview Production Build

To test the production build locally:

```bash
npm run preview
```

## Project Structure

```
planner-2026-react/
├── index.html           # Main HTML file
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
├── src/
│   ├── App.jsx          # Main planner component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind-like utility styles
└── README.md            # This file
```

## Usage

### Navigation
- Click the **Menu** button (top-left) to navigate between pages
- Use **breadcrumbs** to jump back to previous pages
- Click on month names to expand weekly and daily views

### Text Formatting
Each page has a formatting toolbar at the top:
- **Bold**: `**text**`
- **Italic**: `_text_`
- **Highlight**: `==text==`
- **Color**: `~~text~~`
- **Heading**: `# text`
- **Bullet**: `- text`

### Data Management
- **Auto-save**: Changes are automatically saved to browser localStorage after 1 second
- **Download Backup**: Click "Download Backup" in the menu to save your data as JSON
- **Load Backup**: Click "Load Backup" to restore from a previously downloaded JSON file

### Sections Available
1. **2026 Calendar** - Year-at-a-glance view
2. **Yearly Overview** - Annual goals and themes
3. **Quarterly Views** - Q1-Q4 planning pages
4. **Monthly Calendar** - Calendar grid with daily notes
5. **Monthly Overview** - Monthly goals and priorities
6. **Weekly Views** - Week-by-week planning
7. **Daily Pages** - Detailed daily planner with schedule, to-dos, notes, and gratitude

## Customization

### Changing Colors
The planner uses a mauve color palette. To customize:
1. Open `src/App.jsx`
2. Search for color hex codes like `#A17188`, `#673147`, `#C5B358`
3. Replace with your preferred colors

### Adding Pages
To add new pages:
1. Add a new condition in the render section of `App.jsx`
2. Create the page layout using the existing `Section`, `SimpleTextArea`, and other components
3. Add navigation in the `NavigationMenu` component

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### Port 3000 already in use
- Change the port in `vite.config.js`:
  ```javascript
  server: { port: 3001 }
  ```

### Changes not appearing
- Make sure you're in development mode (`npm run dev`)
- Check the browser console for errors
- Try clearing browser cache

### Data not saving
- Check that localStorage is enabled in your browser
- Data is stored per domain, so switching browsers/incognito mode will show different data

## IntelliJ IDEA Setup

1. **Open Project**: File → Open → Select the `planner-2026-react` folder
2. **Install Dependencies**: Right-click `package.json` → Run 'npm install'
3. **Run Development Server**: 
   - Open terminal in IntelliJ (Alt+F12 / ⌥F12)
   - Run: `npm run dev`
4. **Edit Files**: 
   - Main component: `src/App.jsx`
   - Styles: `src/index.css`
   - Enable JSX/React syntax highlighting if prompted

## License

MIT License - feel free to modify and use as needed!

## Support

For issues or questions:
1. Check the browser console for errors (F12)
2. Verify all dependencies are installed (`npm install`)
3. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
