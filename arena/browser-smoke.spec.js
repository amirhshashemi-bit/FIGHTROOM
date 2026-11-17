import { test, expect } from '@playwright/test';

test('desktop arena renders the WebGL stage, HUD and combat controls without runtime errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173/arena/', { waitUntil: 'domcontentloaded' });
  const canvas = page.locator('#view canvas');
  await expect(canvas).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#p-health')).toBeAttached();
  await expect(page.locator('[data-action="takedown"]')).toBeVisible();\n  await expect(page.locator('#p-mocap-file')).toHaveAttribute('accept', /\\.bvh/);\n  await expect(page.locator('#e-mocap-file')).toHaveAttribute('accept', /\\.glb/);
  await page.keyboard.down('j');\n  await page.waitForTimeout(420);\n  await page.keyboard.up('j');\n  await page.keyboard.down('w');\n  await page.waitForTimeout(350);\n  await page.keyboard.up('w');\n  await page.waitForTimeout(1700);
  const context = await canvas.evaluate(node => node.getContext('webgl2') ? 'webgl2' : node.getContext('webgl') ? 'webgl' : 'none');
  expect(context).not.toBe('none');
  await page.screenshot({ path: 'artifacts/arena-desktop.png', fullPage: true });
  expect(pageErrors).toEqual([]);
});

test('Android-sized touch viewport renders and exposes grappling and defense controls', async ({ page }) => {
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
  await page.keyboard.press('j');
  await page.waitForTimeout(550);
  await page.screenshot({ path: 'artifacts/arena-accad-mocap-retarget.png', fullPage: true });
  expect(pageErrors).toEqual([]);
});
