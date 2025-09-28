import { test, expect } from '@playwright/test';

test.describe('Decision Table - Modal de sugerencia de guardado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('Caso 1: <= 5 participantes y todos los gastos <= 20000 → NO muestra modal', async ({
    page,
  }) => {
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

  test('Caso 2: > 5 participantes y gastos <= 20000 → SÍ muestra modal con mensaje de participantes', async ({
    page,
  }) => {
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

  test('Caso 3: <= 5 participantes y gasto > 20000 → SÍ muestra modal con mensaje de gasto', async ({
    page,
  }) => {
    for (let i = 0; i < 5; i++) {
      await page.fill('#participant', `User${i}`);
      await page.click('#btn-add-participant');
    }

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '25000');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    const modal = page.locator('#modalSuggestSave');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('gasto que es mayor a $20,000');
  });

  test('Caso 4: > 5 participantes y gasto > 20000 → SÍ muestra modal con ambos mensajes', async ({
    page,
  }) => {
    for (let i = 0; i < 6; i++) {
      await page.fill('#participant', `User${i}`);
      await page.click('#btn-add-participant');
    }

    await page.fill('#expense-participant', 'User0');
    await page.fill('#expense-amount', '25000');
    await page.click('#btn-add-expense');

    await page.click('#btn-get-result');

    const modal = page.locator('#modalSuggestSave');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('más de 5 participantes');
    await expect(modal).toContainText('gasto que es mayor a $20,000');
  });
});
