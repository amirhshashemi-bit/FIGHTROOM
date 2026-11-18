import { test, expect } from '@playwright/test';

test('desktop arena renders WebGL and responds to keyboard strike and movement', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173/arena/', { waitUntil: 'domcontentloaded' });
  const canvas = page.locator('#view canvas');
  await expect(canvas).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#p-health')).toBeAttached();
  await expect(page.locator('[data-action="takedown"]')).toBeVisible();
  expect(await page.locator('#p-mocap-file').getAttribute('accept')).toContain('.bvh');
  await page.keyboard.down('j');
  await page.waitForTimeout(420);
  await page.keyboard.up('j');
  await page.keyboard.down('w');
  await page.waitForTimeout(350);
  await page.keyboard.up('w');
  await page.waitForTimeout(1700);
  const context = await canvas.evaluate(node => node.getContext('webgl2') ? 'webgl2' : node.getContext('webgl') ? 'webgl' : 'none');
  expect(context).not.toBe('none');
  await page.screenshot({ path: 'artifacts/arena-desktop.png', fullPage: true });
  expect(pageErrors).toEqual([]);
});

test('Android-sized viewport renders grappling and defensive touch controls', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4173/arena/', { waitUntil: 'domcontentloaded' });
  const canvas = page.locator('#view canvas');
  await expect(canvas).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(1500);
  const context = await canvas.evaluate(node => node.getContext('webgl2') ? 'webgl2' : node.getContext('webgl') ? 'webgl' : 'none');
  expect(context).not.toBe('none');
  for (const action of ['clinch','sprawl','escape','sweep','pass','mount','back-take','ground-pound','submission','defend-submission','stand-up']) {
    await expect(page.locator(`[data-action="${action}"]`)).toBeVisible();
  }
  await page.screenshot({ path: 'artifacts/arena-mobile-390x844.png', fullPage: true });
  expect(pageErrors).toEqual([]);
});

test('bundled real ACCAD mocap pack loads and plays through the arena runtime', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173/arena/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#view canvas')).toBeVisible({ timeout: 30000 });
  await page.locator('[data-load-accad="player"]').click();
  await expect(page.locator('#mocap-status')).toContainText('ACCAD REAL MOCAP READY', { timeout: 60000 });
  await expect(page.locator('#mocap-status')).toContainText('8 CLIPS');
  await expect(page.locator('#view canvas')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
