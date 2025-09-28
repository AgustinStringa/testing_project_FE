import { test, expect } from '@playwright/test';
import { Expense, splitExpenses } from '../src/core/expenseSplitter';
test('flujo completo de persistencia de gastos', async ({ page }) => {
  // Ir a la app
  await page.goto('http://localhost:4200');

  // Agregar personas
  await page.fill('#participant', 'Aldo');
  await page.click('#btn-add-participant');
  await page.fill('#participant', 'Mariano');
  await page.click('#btn-add-participant');

  // Agregar gasto
  await page.fill('#expense-participant', 'Aldo');
  await page.fill('#expense-amount', '1000');
  await page.click('#btn-add-expense');

  await page.fill('#expense-participant', 'Mariano');
  await page.fill('#expense-amount', '500');
  await page.click('#btn-add-expense');

  // Calcular y guardar
  await page.click('#btn-get-result');
  await page.click('#btn-save');

  // Refrescar (simula cerrar navegador/abrir de nuevo)
  await page.reload();

  // Consultar historial
  await page.click('#btn-show-expenses-history');

  // Verificar que aparezcan las personas y gastos
  await expect(page.locator('text=Aldo').first()).toBeVisible();
  await expect(page.locator('text=Mariano').first()).toBeVisible();
  await expect(page.locator('text=1000').first()).toBeVisible();
  await expect(page.locator('text=500').first()).toBeVisible();
});

test('performance de tiempo de carga de modal con 100 operaciones, de 2000 usuarios y 3000 transferencias', async ({
  page,
}) => {
  const expectedMaxTimeSeconds = 5;
  await page.goto('http://localhost:4200');

  // recuperar local storage actual

  const originalLocalStorage = await page.evaluate(() => JSON.stringify(localStorage));

  //generar operaciones, usuarios, gastos
  const numOperations = 100;
  for (let op = 0; op < numOperations; op++) {
    const numUsers = Math.floor(Math.random() * 1001) + 1000;
    const numExpenses = Math.floor(Math.random() * 2001) + 1000;
    const users: string[] = [];
    const expenses: Expense[] = [];

    for (let i = 0; i < numUsers; i++) {
      const user = `User${i}`;
      users.push(user);
    }

    for (let i = 0; i < numExpenses; i++) {
      const user = users[i % numUsers];
      const amount = Math.floor(Math.random() * 1001) + 100;
      expenses.push({ user, amount });
    }
    //persistir en localstorage
    const result = splitExpenses(users, expenses);
    await page.evaluate((result) => {
      localStorage.setItem('app-reparto-gastos-operaciones', JSON.stringify(result));
    }, result);
  }
  //recargar pagina
  await page.goto('http://localhost:4200');
  //consultar historial
  await page.click('#btn-show-expenses-history');
  //medir tiempo de carga del modal
  const start = Date.now();
  //validar las transferencias mostradas en UI
  //esperar que  .resultado-resumen sea visible
  await page.waitForSelector('.expense-history-list', { state: 'visible', timeout: 10000 });
  //contrastar contra tiempo esperado < 5s
  const elapsed = Date.now() - start;
  console.log(`⏱ Tiempo total (${numOperations} operaciones) = ${elapsed} ms`);
  expect(elapsed).toBeLessThan(expectedMaxTimeSeconds * 1000);
  //limpiar localstorage
  await page.evaluate(() => {
    localStorage.removeItem('app-reparto-gastos-operaciones');
  });
  //setear localstorage original
  await page.evaluate((originalLocalStorage) => {
    localStorage.setItem('app-reparto-gastos-operaciones', originalLocalStorage);
  }, originalLocalStorage);
  //recargar pagina
  await page.goto('http://localhost:4200');
});
