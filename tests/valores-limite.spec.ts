import { test, expect } from '@playwright/test';

test.describe('Boundary Value Analysis - Modal de sugerencia de guardado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('Gasto máximo en 19999.99 → NO muestra modal', async ({ page }) => {
    await page.fill('#participant', 'User0');
    await page.click('#btn-add-participant');

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '19999.99');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    await expect(page.locator('#modalSuggestSave')).toHaveCount(0);
  });

  test('Gasto igual a 20000 → NO muestra modal', async ({ page }) => {
    await page.fill('#participant', 'User0');
    await page.click('#btn-add-participant');

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '20000');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    await expect(page.locator('#modalSuggestSave')).toHaveCount(0);
  });

  test('Gasto mayor a 20000 → SÍ muestra modal', async ({ page }) => {
    await page.fill('#participant', 'User0');
    await page.click('#btn-add-participant');

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '20000.01');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    const modal = page.locator('#modalSuggestSave');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('gasto que es mayor a $20,000');
  });

  test('Con exactamente 5 participantes → NO muestra modal', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.fill('#participant', `User${i}`);
      await page.click('#btn-add-participant');
    }

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '1000');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    await expect(page.locator('#modalSuggestSave')).toHaveCount(0);
  });

  test('Con 6 participantes → SÍ muestra modal', async ({ page }) => {
    for (let i = 0; i < 6; i++) {
      await page.fill('#participant', `User${i}`);
      await page.click('#btn-add-participant');
    }

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '1000');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    const modal = page.locator('#modalSuggestSave');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('más de 5 participantes');
  });

  test('Con 4 participantes → NO muestra modal', async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.fill('#participant', `User${i}`);
      await page.click('#btn-add-participant');
    }

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '1000');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    await expect(page.locator('#modalSuggestSave')).toHaveCount(0);
  });
});
