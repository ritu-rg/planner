import { test, expect } from '@playwright/test';

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
    // Locate the "Overall Goals & Themes" textarea
    const textarea = page.locator('textarea[data-field-key="yearly-goals"]');

    // Type a long sentence continuously
    const testText = 'This is a continuous typing test to verify that the typing bug is fixed and I can type smoothly without interruptions.';
    await textarea.fill(testText);

    // Verify the full text was entered
    await expect(textarea).toHaveValue(testText);
  });

  test('should maintain cursor position during typing', async ({ page }) => {
    const textarea = page.locator('textarea[data-field-key="yearly-action"]');

    // Type text character by character to simulate real typing
    const testText = 'Testing cursor position';
    for (const char of testText) {
      await textarea.type(char, { delay: 50 });
    }

    // Verify complete text
    await expect(textarea).toHaveValue(testText);

    // Move cursor to middle and add more text
    await textarea.press('Home'); // Go to start
    for (let i = 0; i < 7; i++) {
      await textarea.press('ArrowRight');
    }
    await textarea.type(' INSERTED', { delay: 50 });

    await expect(textarea).toHaveValue('Testing INSERTED cursor position');
  });

  test('should handle rapid typing across multiple fields', async ({ page }) => {
    const goalsTextarea = page.locator('textarea[data-field-key="yearly-goals"]');
    const actionTextarea = page.locator('textarea[data-field-key="yearly-action"]');
    const notesTextarea = page.locator('textarea[data-field-key="yearly-notes"]');

    // Type in first field
    await goalsTextarea.fill('My goals for 2026');
    await expect(goalsTextarea).toHaveValue('My goals for 2026');

    // Quickly switch to second field
    await actionTextarea.fill('Action plan details here');
    await expect(actionTextarea).toHaveValue('Action plan details here');

    // Verify first field retained its value
    await expect(goalsTextarea).toHaveValue('My goals for 2026');

    // Type in third field
    await notesTextarea.fill('Additional notes');
    await expect(notesTextarea).toHaveValue('Additional notes');

    // Verify all fields retained their values
    await expect(goalsTextarea).toHaveValue('My goals for 2026');
    await expect(actionTextarea).toHaveValue('Action plan details here');
  });

  test('should maintain text across navigation', async ({ page }) => {
    const textarea = page.locator('textarea[data-field-key="yearly-goals"]');
    const testText = 'These are my 2026 goals that should persist';

    await textarea.fill(testText);
    await expect(textarea).toHaveValue(testText);

    // Wait for auto-save debounce
    await page.waitForTimeout(1500);

    // Navigate away
    await page.click('text=Contents');
    await page.waitForSelector('h1:has-text("Contents")');

    // Navigate back
    await page.click('text=Yearly Overview');
    await page.waitForSelector('h1:has-text("2026 Yearly Overview")');

    // Verify text persisted
    await expect(textarea).toHaveValue(testText);
  });

  test('should allow typing long paragraphs without issues', async ({ page }) => {
    const textarea = page.locator('textarea[data-field-key="yearly-goals"]');

    const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
    This is a very long paragraph to test continuous typing across multiple lines.
    The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
    Testing special characters: @#$%^&*()_+-=[]{}|;:',.<>?/~\``;

    await textarea.fill(longText);
    await expect(textarea).toHaveValue(longText);
  });

  test('should handle backspace and delete correctly', async ({ page }) => {
    const textarea = page.locator('textarea[data-field-key="yearly-goals"]');

    await textarea.fill('Hello World Test');
    await expect(textarea).toHaveValue('Hello World Test');

    // Delete "Test" by pressing backspace 4 times
    for (let i = 0; i < 5; i++) {
      await textarea.press('Backspace');
    }

    await expect(textarea).toHaveValue('Hello World');
  });

  test('should work with Day page schedule inputs', async ({ page }) => {
    // Navigate to a daily view
    await page.click('text=Contents');
    await page.click('text=January');

    // Wait for month expansion
    await page.waitForTimeout(500);

    // Click first day
    const firstDay = page.locator('text=1').first();
    await firstDay.click();

    await page.waitForSelector('h1:has-text("January 1, 2026")');

    // Find a schedule input field (8 AM slot)
    const scheduleInput = page.locator('input[data-field-key="day-1-1-time-0"]');

    const testText = 'Morning meeting with team';
    await scheduleInput.fill(testText);

    await expect(scheduleInput).toHaveValue(testText);
  });
});
