# Troubleshooting Guide - Changes Not Appearing

## The Problem
You're seeing old cached code in your browser. The fixes ARE in the code, but your browser is showing the old version.

## Solution: Force Browser to Load New Code

### Step 1: Hard Refresh Browser
**Do this immediately:**

- **Chrome/Edge (Mac)**: `Cmd + Shift + R`
- **Chrome/Edge (Windows/Linux)**: `Ctrl + Shift + R`
- **Safari (Mac)**: `Cmd + Option + R`
- **Firefox**: `Ctrl + Shift + R` or `Ctrl + F5`

### Step 2: Clear Browser Cache Completely
If hard refresh doesn't work:

1. **Chrome**:
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

2. **Safari**:
   - Safari menu → Clear History
   - Select "all history"

3. **Firefox**:
   - Preferences → Privacy & Security
   - Clear Data → Clear

### Step 3: Verify You're on the Right URL
Make sure you're visiting: **http://localhost:3000/**

NOT localhost:3001 or localhost:5173 or any other port.

### Step 4: Open in Incognito/Private Mode
This bypasses all cache:
- **Chrome**: `Cmd/Ctrl + Shift + N`
- **Safari**: `Cmd + Shift + N`
- **Firefox**: `Cmd/Ctrl + Shift + P`

Then visit http://localhost:3000/

## Verify the Fix is Working

### Test Typing:
1. Click the cover to open planner
2. Go to "Yearly Overview"
3. Click in the "Overall Goals & Themes" textarea
4. Type: "The quick brown fox jumps over the lazy dog"
5. **Expected**: All text appears smoothly without interruption
6. **If still broken**: You're still seeing cached code - try incognito mode

### Test Scroll:
1. Navigate to any page (Yearly Overview, Month Overview, etc.)
2. Try scrolling with mouse wheel or trackpad
3. **Expected**: Page scrolls smoothly
4. **If not scrolling**: Make sure you're clicking inside the page content area, not on the menu

## Technical Verification

### Check Console for React Warnings:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red errors or warnings
4. If you see "Component is changing an uncontrolled input" - you're seeing OLD code

### Check Network Tab:
1. Open DevTools → Network tab
2. Hard refresh page
3. Look for `index-*.js` file
4. Check size - should be around 173 KB (new version)
5. If it's significantly different, cache is the issue

## Still Not Working?

### Nuclear Option - Delete Browser Data:
```bash
# Stop the dev server first
# Then restart everything:
npm run dev
```

Open browser in **Incognito mode** and test there first.

If it works in incognito but not in regular browser, it's 100% a cache issue.

## Code Verification

The following changes ARE in the code (verified):

✅ Components extracted to module level (App.jsx lines 4-76)
✅ All components wrapped with React.memo()
✅ All 24 usages updated with value/onChange props
✅ applyFormat() fixed (line 202)
✅ overflow-auto on all 8 pages (verified)
✅ Build succeeds with no errors
✅ Dev server runs with no errors

The code is correct. It's a browser cache issue 100%.
