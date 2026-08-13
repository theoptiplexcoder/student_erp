import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin can sign in and view database-backed dashboard', async ({ page }) => {
    // 1. Landing page
    await page.goto('/');

    // Verify landing page has a sign in link/button
    const signInLink = page.getByRole('link', { name: /sign in/i }).first();
    await expect(signInLink).toBeVisible();

    // 2. Sign in
    await signInLink.click();

    // Verify we are on the login page
    await expect(page).toHaveURL(/.*login.*/);

    // 3. Login
    const emailInput = page.getByLabel(/Email Address/i);
    await expect(emailInput).toBeVisible();
    await emailInput.fill('admin@demo-institute.test');

    const passwordInput = page.getByLabel(/Password/i);
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('wasdwasd12');

    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();

    // 4. Authentication
    // Should redirect to post-login or admin
    await page.waitForURL(
      (url) => url.pathname.includes('/admin') || url.pathname.includes('/post-login'),
    );

    // If we land on post-login, wait for it to redirect to admin
    if (page.url().includes('/post-login')) {
      await page.waitForURL(/.*\/admin/);
    }

    // 5. Dashboard
    await expect(page).toHaveURL(/.*\/admin/);

    // Verify admin dashboard is visible
    await expect(page.getByRole('heading', { name: /Dashboard/i, level: 1 })).toBeVisible({
      timeout: 15000,
    });

    // 6. Database-backed data
    // The seeded data has ~2450 students, 120 faculty, 5 programs, etc.
    // The dashboard has cards for "Total Students", "Active Faculty", "Total Programs"

    // We expect the Total Students card to eventually have a non-zero number (not a skeleton or '0')
    // We can use a regex that matches numbers greater than 0
    // Example: "2,450" or "2450"
    const totalStudentsValue = page
      .locator('div')
      .filter({ hasText: /^Total Students$/ })
      .locator('..')
      .locator('div.text-2xl');
    await expect(totalStudentsValue).not.toHaveText('0', { timeout: 10000 });
    await expect(totalStudentsValue).not.toHaveText('', { timeout: 10000 });

    const activeFacultyValue = page
      .locator('div')
      .filter({ hasText: /^Active Faculty$/ })
      .locator('..')
      .locator('div.text-2xl');
    await expect(activeFacultyValue).not.toHaveText('0', { timeout: 10000 });

    // Navigate to Programs list (via Academics) and verify seeded data
    const academicsLink = page.getByRole('link', { name: /Academics/i });
    await academicsLink.click();
    await expect(page).toHaveURL(/.*\/admin\/academics/, { timeout: 15000 }); // Wait for navigation

    // Verify a known seeded program is visible
    await expect(
      page.getByRole('cell', { name: /B\.Tech Computer Science and Engineering/i }),
    ).toBeVisible({ timeout: 15000 });

    // Navigate to Courses list and verify seeded data
    const coursesLink = page.getByRole('link', { name: /Global Courses/i });
    await coursesLink.click();
    await expect(page).toHaveURL(/.*\/admin\/academics\/courses/, { timeout: 15000 });

    // Verify a known seeded course code or name is visible
    await expect(
      page
        .getByRole('cell', { name: /Database Management Systems/i })
        .or(page.getByRole('cell', { name: /CS301/i })),
    ).toBeVisible({ timeout: 15000 });
  });
});
