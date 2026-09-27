import { test, expect } from '@playwright/test';

test.describe('Admin Timetable Generation', () => {
  test('generate timetable for a specific section and verify sessions in grid', async ({
    page,
  }) => {
    // 1. Sign in
    await page.goto('/');
    const signInLink = page.getByRole('link', { name: /sign in/i }).first();
    await signInLink.click();
    await page.waitForURL(/.*login.*/);

    const emailInput = page.getByLabel(/Email Address/i);
    await emailInput.fill('admin@demo-institute.test');
    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.fill('wasdwasd12');

    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => {
        /* ignore timeout */
      }),
      signInButton.click(),
    ]);

    // Sometimes it needs an extra wait
    await page.waitForTimeout(2000);

    // 2. Go to Timetable page
    await page.goto('/admin/timetable');
    await expect(page.getByRole('heading', { name: /Timetable Management/i })).toBeVisible({
      timeout: 15000,
    });

    // 3. Wait for the page to load initial data
    await page.waitForTimeout(2000);

    // 4. Select a section from the dropdown
    // There are select dropdowns: Curriculum, Program, Term, Section
    // Let's find the select that has an option matching "Section 1"

    // Instead of nth, let's find the select by its default option or options
    const sectionDropdown = page.locator('select').filter({ hasText: 'All Sections' }).first();

    // Select the option that contains 'Section 1'
    // First, let's wait for the option to be available
    await expect(sectionDropdown.locator('option', { hasText: 'Section 1' })).toBeAttached({
      timeout: 15000,
    });
    const optionValue = await sectionDropdown
      .locator('option', { hasText: 'Section 1' })
      .getAttribute('value');
    if (!optionValue) {
      throw new Error('Could not find Section 1 option value');
    }
    await sectionDropdown.selectOption(optionValue);

    // Wait for the grid to update
    await page.waitForTimeout(2000);

    // 5. Click Generate Timetable
    // Setup dialog handler to accept the alert
    page.on('dialog', async (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      if (dialog.type() === 'confirm' || dialog.type() === 'alert') {
        await dialog.accept();
      }
    });

    const generateBtn = page.getByRole('button', { name: /Generate Timetable/i });
    await generateBtn.click();

    // The modal opens. Click "Apply"
    const applyBtn = page.getByRole('button', { name: 'Apply' });
    await applyBtn.click();

    // 6. Wait for generation and verify grid
    // The grid should have cells with "bg-blue-100", etc. which represent sessions.
    // They are rendered as divs inside the grid cells.
    await page.waitForTimeout(3000); // give it a moment to render

    // Find the TimetableGrid table rows
    const timetableRows = page.locator('table tbody tr');
    await expect(timetableRows.first()).toBeVisible();

    // Check that there is at least one session block visible (checkbox inside an EntryCard)
    // Or just look for any div containing an EntryCard (which has a role=checkbox)
    const entryCards = page.locator('[role="checkbox"]');

    const count = await entryCards.count();
    expect(count).toBeGreaterThan(0);
    console.log(`Found ${count} session entries in the timetable grid.`);
  });
});
