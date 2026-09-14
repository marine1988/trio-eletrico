import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.TEST_BASE || 'http://localhost:3000';

test.describe('Accessibility (axe-core)', () => {

  test('index.html has no critical/serious violations', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    console.log('Violations:', JSON.stringify(serious.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2));
    expect(serious, `Found ${serious.length} serious/critical violations`).toHaveLength(0);
  });

  test('contacto.html has no critical/serious violations', async ({ page }) => {
    await page.goto(BASE + '/contacto.html');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    console.log('Violations:', JSON.stringify(serious.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), null, 2));
    expect(serious, `Found ${serious.length} serious/critical violations`).toHaveLength(0);
  });

  test('FAQ accordion keyboard accessible (Enter expands, aria-expanded updates)', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.waitForLoadState('networkidle');

    const firstFaq = page.locator('.faq-item').first();
    const button = firstFaq.locator('.faq-question');

    // Focus and press Enter
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    // Press Enter again to collapse
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    // Press Space to expand
    await page.keyboard.press('Space');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  test('FAQ aria-controls and aria-labelledby are wired correctly', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.waitForLoadState('networkidle');

    const items = page.locator('.faq-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const button = item.locator('.faq-question');
      const answer = item.locator('.faq-answer');

      const controls = await button.getAttribute('aria-controls');
      expect(controls).toBeTruthy();

      // Element referenced by aria-controls should exist
      const controlledEl = page.locator('#' + controls);
      await expect(controlledEl).toHaveCount(1);

      // aria-labelledby on answer should point to button
      const labelledBy = await answer.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      const labelEl = page.locator('#' + labelledBy);
      await expect(labelEl).toHaveCount(1);
    }
  });

  test('Form: required fields have aria-required and aria-describedby', async ({ page }) => {
    await page.goto(BASE + '/contacto.html');
    await page.waitForLoadState('networkidle');

    const formLocator = page.locator('form[action*="mailto:geral@trioeletrico.pt"]');
    await expect(formLocator).toHaveCount(1);

    const requiredFields = formLocator.locator('[required]');
    const count = await requiredFields.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const field = requiredFields.nth(i);
      await expect(field).toHaveAttribute('aria-required', 'true');
      const describedby = await field.getAttribute('aria-describedby');
      expect(describedby).toBeTruthy();

      // Error message should exist
      const errorEl = page.locator('#' + describedby);
      await expect(errorEl).toHaveCount(1);
      await expect(errorEl).toHaveAttribute('role', 'alert');
    }
  });

  test('Form: submitting empty shows errors with aria-invalid', async ({ page }) => {
    await page.goto(BASE + '/contacto.html');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.locator('form[action*="mailto:geral@trioeletrico.pt"] button[type="submit"]');
    await submitBtn.click();

    // After submit, first required field should be focused and have aria-invalid
    const firstField = page.locator('form[action*="mailto:geral@trioeletrico.pt"] [required]').first();
    await expect(firstField).toHaveAttribute('aria-invalid', 'true');

    // Error message should be visible
    const errorId = await firstField.getAttribute('aria-describedby');
    const errorEl = page.locator('#' + errorId);
    await expect(errorEl).toBeVisible();
  });

});
