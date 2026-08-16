import { test, expect } from '@playwright/test';

test.describe('Direct Student Admission Flow', () => {
  test('admin can create a student via direct admission', async ({ page }) => {
    // 1. Landing page
    await page.goto('/');

    const signInLink = page.getByRole('link', { name: /sign in/i }).first();
    await expect(signInLink).toBeVisible();

    // 2. Sign in
    await signInLink.click();
    await expect(page).toHaveURL(/.*login.*/);

    const emailInput = page.getByLabel(/Email Address/i);
    await emailInput.fill('admin@demo-institute.test');

    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.fill('wasdwasd12');

    const signInButton = page.getByRole('button', { name: 'Sign In', exact: true });
    await signInButton.click();

    if (page.url().includes('/post-login')) {
      await page.waitForURL(/.*\/admin/);
    }
    await expect(page).toHaveURL(/.*\/admin/);

    // Navigate to direct admission page
    await page.goto('/admin/admissions/students/new');

    // Step 1: Student Info
    await expect(
      page.getByRole('heading', { name: /Direct Student Admission/i, level: 1 }),
    ).toBeVisible();

    await page.locator('input[name="firstName"]').fill('John');
    await page.locator('input[name="lastName"]').fill('Doe');
    await page.locator('input[name="dateOfBirth"]').fill('2005-01-01');
    await page.locator('select[name="gender"]').selectOption('MALE');
    await page.locator('input[name="email"]').fill('john.doe.new@example.com');

    // Family Info
    await page.locator('input[name="fatherName"]').fill('Robert Doe');
    await page.locator('input[name="fatherEmail"]').fill('robert.doe@example.com');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: Academic Details
    await expect(page.getByRole('heading', { name: /Current Admission/i })).toBeVisible();

    // Wait for dropdowns
    const academicYearSelect = page.locator('select[name="academicYearId"]');
    await expect(academicYearSelect).not.toBeEmpty();
    // Select first valid option
    await academicYearSelect.selectOption({ index: 1 });

    const programSelect = page.locator('select[name="programId"]');
    await expect(programSelect).not.toBeEmpty();
    await programSelect.selectOption({ index: 1 });

    const sectionSelect = page.locator('select[name="sectionId"]');
    await expect(sectionSelect).not.toBeEmpty();
    await sectionSelect.selectOption({ index: 1 });

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Fee
    await expect(page.getByRole('heading', { name: /Fee Configuration/i })).toBeVisible();

    await page.locator('input[name="totalFee"]').fill('100000');
    // Select 2 installments
    await page
      .locator('select')
      .filter({ hasText: /Installment/ })
      .selectOption('2');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Preview & Submit
    await expect(page.getByRole('heading', { name: /Preview & Submit/i })).toBeVisible();

    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('₹100000')).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /Create Student Admission/i });
    await expect(submitBtn).toBeEnabled();

    // NOTE: In a real e2e we might submit, but it mutates DB and hits Supabase,
    // we can click it and verify redirection or skip to avoid state pollution.
    // Let's click it!
    await submitBtn.click();

    // Should redirect to student profile
    await expect(page).toHaveURL(/.*\/admin\/students\/.*/, { timeout: 15000 });
  });
});
