const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Path to the static build for asset verification tests
const distStaticPath = path.resolve(__dirname, '../dist-static');
const staticBuildPath = path.resolve(distStaticPath, 'index.html');

test.describe('Static Build Tests', () => {
  test.beforeAll(async () => {
    // Verify static build exists
    if (!fs.existsSync(staticBuildPath)) {
      throw new Error(
        'Static build not found. Run "npm run build:static" first.\n' +
        `Expected path: ${staticBuildPath}`
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load the app correctly', async ({ page }) => {
    // Reload after clearing localStorage to get fresh state
    await page.reload();
    await page.waitForTimeout(500);

    // Verify the app title image is present (has alt text "Digital Planner 2026")
    await expect(page.locator('img[alt*="Digital Planner"]')).toBeVisible();
  });

  test('should navigate using hash-based routing', async ({ page }) => {
    // Click cover to open (using same selector as existing tests)
    await page.click('div[style*="148mm"]');
    await page.waitForTimeout(1500);

    // Navigate to Yearly Overview
    await page.click('text=Yearly Overview');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Verify URL contains hash
    expect(page.url()).toContain('#/yearly');
  });

  test('should persist text to localStorage', async ({ page }) => {
    // Navigate directly to yearly page
    await page.goto('/#/yearly');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Find and type in the goals field
    const editor = page.locator('div[contenteditable][data-field-key="yearly-goals"]');
    await editor.click();
    await editor.type('Static build test goal');
    await editor.blur();

    // Wait for debounce save
    await page.waitForTimeout(1500);

    // Verify data in localStorage
    const savedData = await page.evaluate(() => {
      const data = localStorage.getItem('planner2026');
      return data ? JSON.parse(data) : null;
    });

    expect(savedData).toBeTruthy();
    expect(savedData.textContent['yearly-goals']).toContain('Static build test goal');
  });

  test('should load all local assets correctly', async ({ page }) => {
    const failedLocalRequests = [];

    // Monitor for failed requests
    page.on('requestfailed', request => {
      const url = request.url();
      // Only track local asset failures (not external Google/font APIs)
      if (url.includes('/assets/') && !url.includes('google')) {
        failedLocalRequests.push({
          url: url,
          failure: request.failure()?.errorText
        });
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // No local assets should fail to load
    expect(failedLocalRequests).toHaveLength(0);
  });

  test('should handle direct URL access with hash routing', async ({ page }) => {
    // Navigate directly to a specific day
    await page.goto('/#/day/3/15');
    await page.waitForSelector('h1:has-text("March 15, 2026")');

    // Verify URL is correct
    expect(page.url()).toContain('#/day/3/15');
  });

  test('should navigate to calendar page', async ({ page }) => {
    // Navigate directly to calendar
    await page.goto('/#/calendar');
    await page.waitForSelector('h1:has-text("2026 Calendar")');

    // Verify URL is correct
    expect(page.url()).toContain('#/calendar');
  });

  test('should navigate to quarter page', async ({ page }) => {
    // Navigate to quarter
    await page.goto('/#/quarter/2');
    await page.waitForSelector('h1:has-text("Quarter 2")');

    // Verify URL is correct
    expect(page.url()).toContain('#/quarter/2');
  });

  test('should preserve navigation on page refresh', async ({ page }) => {
    // Navigate to yearly page
    await page.goto('/#/yearly');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Refresh
    await page.reload();

    // Should still be on yearly page
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');
    expect(page.url()).toContain('#/yearly');
  });
});

test.describe('Google Calendar Offline Handling', () => {
  test('should show offline message when Google APIs unavailable', async ({ page, context }) => {
    // Block Google API scripts to simulate offline
    await context.route('**/*.google.com/**', route => route.abort());
    await context.route('**/googleapis.com/**', route => route.abort());

    // Navigate to a day page (where Google Calendar is shown)
    await page.goto('/#/day/1/1');
    await page.waitForSelector('h1:has-text("January 1, 2026")');

    // Wait for offline detection timeout (5 seconds + buffer)
    await page.waitForTimeout(6000);

    // Should show offline message
    const offlineIndicator = page.locator('[data-testid="google-calendar-offline"]');
    await expect(offlineIndicator).toBeVisible();

    // Verify the offline message text
    await expect(page.locator('text=Google Calendar is unavailable in offline mode')).toBeVisible();
  });
});

test.describe('Static Build Asset Verification', () => {
  test('dist-static directory should exist after build', async () => {
    expect(fs.existsSync(distStaticPath)).toBe(true);
  });

  test('should have relative asset paths in index.html', async () => {
    const content = fs.readFileSync(staticBuildPath, 'utf-8');

    // Should use relative paths for local assets
    expect(content).toContain('./assets/');

    // Should NOT have root-relative paths for local JS/CSS
    // Look for script and link tags with root-relative src/href
    const hasRootRelativeScript = /src="\/assets\//.test(content);
    const hasRootRelativeLink = /href="\/assets\//.test(content);

    expect(hasRootRelativeScript).toBe(false);
    expect(hasRootRelativeLink).toBe(false);
  });

  test('should have all required asset files', async () => {
    const assetsDir = path.resolve(distStaticPath, 'assets');
    expect(fs.existsSync(assetsDir)).toBe(true);

    const files = fs.readdirSync(assetsDir);

    // Should have JS and CSS files
    const hasJS = files.some(f => f.endsWith('.js'));
    const hasCSS = files.some(f => f.endsWith('.css'));

    expect(hasJS).toBe(true);
    expect(hasCSS).toBe(true);
  });
});
