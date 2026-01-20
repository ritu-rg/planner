import { test, expect } from '@playwright/test';

// Helper to get text from contentEditable div
const getContentEditableText = async (locator) => {
  return await locator.evaluate(el => el.textContent || '');
};

// Helper to set text in contentEditable div
const setContentEditableText = async (locator, text) => {
  await locator.click();
  await locator.evaluate(el => {
    el.innerHTML = '';
    el.focus();
  });
  await locator.type(text);
};

test.describe('Text Input Typing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Navigate to the planner
    await page.click('div[style*="148mm"]'); // Click the cover to open
    await page.waitForTimeout(1500); // Wait for opening animation

    // Navigate to Yearly Overview page (has multiple text areas)
    await page.click('text=Yearly Overview');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');
  });

  test('should allow continuous typing without interruption', async ({ page }) => {
    // Locate the "Overall Goals & Themes" contentEditable div
    const editor = page.locator('div[contenteditable][data-field-key="yearly-goals"]');

    // Type a long sentence continuously
    const testText = 'This is a continuous typing test to verify that typing works smoothly.';
    await editor.click();
    await editor.type(testText);

    // Verify the full text was entered
    const content = await getContentEditableText(editor);
    expect(content).toBe(testText);
  });

  test('should maintain cursor position during typing', async ({ page }) => {
    const editor = page.locator('div[contenteditable][data-field-key="yearly-action"]');

    // Type text character by character to simulate real typing
    const testText = 'Testing cursor position';
    await editor.click();
    await editor.type(testText, { delay: 30 });

    // Verify complete text
    const content = await getContentEditableText(editor);
    expect(content).toBe(testText);
  });

  test('should handle rapid typing across multiple fields', async ({ page }) => {
    const goalsEditor = page.locator('div[contenteditable][data-field-key="yearly-goals"]');
    const actionEditor = page.locator('div[contenteditable][data-field-key="yearly-action"]');
    const notesEditor = page.locator('div[contenteditable][data-field-key="yearly-notes"]');

    // Type in first field
    await goalsEditor.click();
    await goalsEditor.type('My goals for 2026');
    expect(await getContentEditableText(goalsEditor)).toBe('My goals for 2026');

    // Quickly switch to second field
    await actionEditor.click();
    await actionEditor.type('Action plan details here');
    expect(await getContentEditableText(actionEditor)).toBe('Action plan details here');

    // Type in third field
    await notesEditor.click();
    await notesEditor.type('Additional notes');
    expect(await getContentEditableText(notesEditor)).toBe('Additional notes');
  });

  test('should maintain text across navigation', async ({ page }) => {
    const editor = page.locator('div[contenteditable][data-field-key="yearly-goals"]');
    const testText = 'These are my 2026 goals that should persist';

    await editor.click();
    await editor.type(testText);

    // Blur to trigger save
    await editor.blur();

    // Wait for auto-save debounce
    await page.waitForTimeout(1500);

    // Navigate away
    await page.click('text=Contents');
    await page.waitForSelector('h1:has-text("Contents")');

    // Navigate back
    await page.click('text=Yearly Overview');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Verify text persisted
    const content = await getContentEditableText(editor);
    expect(content).toBe(testText);
  });

  test('should allow typing long paragraphs without issues', async ({ page }) => {
    const editor = page.locator('div[contenteditable][data-field-key="yearly-goals"]');

    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    await editor.click();
    await editor.type(longText);

    const content = await getContentEditableText(editor);
    expect(content).toBe(longText);
  });

  test('should handle backspace correctly', async ({ page }) => {
    const editor = page.locator('div[contenteditable][data-field-key="yearly-goals"]');

    await editor.click();
    await editor.type('Hello World Test');

    // Delete "Test" by pressing backspace
    for (let i = 0; i < 5; i++) {
      await editor.press('Backspace');
    }

    const content = await getContentEditableText(editor);
    expect(content).toBe('Hello World');
  });

  test('should work with Day page schedule inputs', async ({ page }) => {
    // Navigate to a daily view via Contents
    await page.click('text=Contents');
    await page.waitForSelector('h1:has-text("Contents")');

    // Click January to expand
    await page.click('div:has-text("January") >> nth=0');
    await page.waitForTimeout(500);

    // Look for day 1 link and click it
    const dayLink = page.locator('text=/^1$/').first();
    await dayLink.click();

    await page.waitForSelector('h1:has-text("January 1, 2026")');

    // Find a schedule input field
    const scheduleInput = page.locator('input[data-field-key="day-1-1-time-0"]');
    await scheduleInput.waitFor({ state: 'visible' });

    const testText = 'Morning meeting';
    await scheduleInput.fill(testText);

    await expect(scheduleInput).toHaveValue(testText);
  });
});

test.describe('URL Routing and Browser History Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should update URL when navigating to different pages', async ({ page }) => {
    // Open the planner
    await page.click('div[style*="148mm"]');
    await page.waitForTimeout(1500);

    // Check URL updated to contents
    await page.click('text=Yearly Overview');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');
    expect(page.url()).toContain('#/yearly');

    // Navigate to calendar
    await page.click('text=Contents');
    await page.click('text=2026 Calendar');
    await page.waitForSelector('h1:has-text("2026 Calendar")');
    expect(page.url()).toContain('#/calendar');

    // Navigate to Quarter
    await page.click('text=Contents');
    await page.click('text=Quarter 2');
    await page.waitForSelector('h1:has-text("Quarter 2")');
    expect(page.url()).toContain('#/quarter/2');
  });

  test('should preserve page on refresh', async ({ page }) => {
    // Navigate directly to yearly page via URL
    await page.goto('/#/yearly');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Refresh the page
    await page.reload();

    // Should still be on yearly page
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');
    expect(page.url()).toContain('#/yearly');
  });

  test('should navigate via direct URL access', async ({ page }) => {
    // Go directly to calendar
    await page.goto('/#/calendar');
    await page.waitForSelector('h1:has-text("2026 Calendar")');

    // Go directly to quarter 3
    await page.goto('/#/quarter/3');
    await page.waitForSelector('h1:has-text("Quarter 3")');

    // Go directly to month calendar for June
    await page.goto('/#/month-calendar/6');
    await page.waitForSelector('h1:has-text("June 2026")');
  });

  test('should handle browser back button', async ({ page }) => {
    // Navigate to calendar directly
    await page.goto('/#/calendar');
    await page.waitForSelector('h1:has-text("2026 Calendar")');

    // Navigate to yearly
    await page.goto('/#/yearly');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Press browser back - should go to calendar
    await page.goBack();
    await page.waitForSelector('h1:has-text("2026 Calendar")');
    expect(page.url()).toContain('#/calendar');
  });

  test('should handle browser forward button', async ({ page }) => {
    // Navigate to yearly then calendar via direct URL
    await page.goto('/#/yearly');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    await page.goto('/#/calendar');
    await page.waitForSelector('h1:has-text("2026 Calendar")');

    // Go back to yearly
    await page.goBack();
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Go forward to calendar
    await page.goForward();
    await page.waitForSelector('h1:has-text("2026 Calendar")');
    expect(page.url()).toContain('#/calendar');
  });

  test('should handle invalid URLs gracefully', async ({ page }) => {
    // Go to invalid URL - should fallback to cover
    await page.goto('/#/invalid-page');
    await page.waitForSelector('div[style*="148mm"]'); // Cover page element

    // Go to invalid day
    await page.goto('/#/day/13/45'); // Invalid month 13
    await page.waitForSelector('div[style*="148mm"]'); // Should fallback to cover
  });

  test('should preserve day page state on refresh', async ({ page }) => {
    // Navigate to a specific day
    await page.goto('/#/day/3/15'); // March 15
    await page.waitForSelector('h1:has-text("March 15, 2026")');

    // Refresh
    await page.reload();

    // Should still be on March 15
    await page.waitForSelector('h1:has-text("March 15, 2026")');
    expect(page.url()).toContain('#/day/3/15');
  });

  test('should preserve week page state on refresh', async ({ page }) => {
    // Navigate to a specific week
    await page.goto('/#/week/6/2'); // June week 2
    await page.waitForSelector('h1:has-text("June - Week 2")');

    // Refresh
    await page.reload();

    // Should still be on same week
    await page.waitForSelector('h1:has-text("June - Week 2")');
    expect(page.url()).toContain('#/week/6/2');
  });
});

test.describe('Cross-Tab Data Sync Tests', () => {
  test('should sync text data between tabs', async ({ browser }) => {
    // Create two browser contexts (simulates two tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Clear localStorage and navigate both to yearly page
    await page1.goto('/#/yearly');
    await page1.evaluate(() => localStorage.clear());
    await page1.waitForSelector('h1:has-text("2026 Yearly Overview")');

    await page2.goto('/#/yearly');
    await page2.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Type in page 1
    const editor1 = page1.locator('div[contenteditable][data-field-key="yearly-goals"]');
    await editor1.click();
    await editor1.type('Synced from tab 1');
    await editor1.blur();

    // Wait for debounce save
    await page1.waitForTimeout(1500);

    // Manually trigger storage event in page2 (since contexts don't share storage events)
    // In real usage, the storage event fires automatically between same-origin tabs
    const savedData = await page1.evaluate(() => localStorage.getItem('planner2026'));
    await page2.evaluate((data) => {
      localStorage.setItem('planner2026', data);
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'planner2026',
        newValue: data
      }));
    }, savedData);

    // Wait for sync
    await page2.waitForTimeout(500);

    // Verify page 2 has the data
    const editor2 = page2.locator('div[contenteditable][data-field-key="yearly-goals"]');
    const content = await getContentEditableText(editor2);
    expect(content).toBe('Synced from tab 1');

    await context1.close();
    await context2.close();
  });
});
