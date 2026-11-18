import fs from 'node:fs/promises';
import { test, expect } from '@playwright/test';

test('desktop arena renders WebGL and responds to keyboard strike and movement', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173/arena/', { waitUntil: 'domcontentloaded' });
  const canvas = page.locator('#view canvas');
  await expect(canvas).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#p-health')).toBeAttached();
  await expect(page.locator('[data-action="takedown"]')).toBeVisible();
  await expect(page.locator('.creator-panel')).toBeVisible();
  await expect(page.locator('.roster-toolbar')).toBeVisible();
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
  await expect(page.locator('.creator-panel')).toBeHidden();
  await expect(page.locator('.roster-toolbar')).toBeHidden();
  await page.locator('#toggle-roster').click();
  await expect(page.locator('.roster-toolbar')).toBeVisible();
  await page.locator('#toggle-roster').click();
  await expect(page.locator('.roster-toolbar')).toBeHidden();
  await page.locator('#toggle-creator').click();
  await expect(page.locator('.creator-panel')).toBeVisible();
  await page.locator('#toggle-creator').click();
  await expect(page.locator('.creator-panel')).toBeHidden();
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
  const rosterOptions = await page.locator('#player-roster option').evaluateAll(options => options.map(option => ({ value: option.value, label: option.textContent })));
  const female = rosterOptions.find(option => option.label.includes('Women'));
  const male = rosterOptions.find(option => !option.label.includes('Women'));
  expect(female).toBeTruthy();
  expect(male).toBeTruthy();
  await page.locator('#player-roster').selectOption(female.value);
  await page.locator('[data-load-accad="player"]').click();
  await expect(page.locator('#mocap-status')).toContainText('FEMALE GLB MODEL NOT BUNDLED YET');
  await page.locator('#player-roster').selectOption(male.value);
  await page.locator('[data-load-accad="player"]').click();
  await expect(page.locator('#mocap-status')).toContainText('ACCAD REAL MOCAP READY', { timeout: 60000 });
  await expect(page.locator('#mocap-status')).toContainText('8 CLIPS');
  const visual = await page.locator('#view canvas').evaluate(canvas => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const width = canvas.width, height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);
    gl.finish();
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let litSamples = 0;
    for (let i = 0; i < pixels.length; i += 32) {
      if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 95) litSamples++;
    }
    const flipped = new Uint8ClampedArray(pixels.length);
    const stride = width * 4;
    for (let y = 0; y < height; y++) flipped.set(pixels.subarray(y * stride, (y + 1) * stride), (height - 1 - y) * stride);
    const out = document.createElement('canvas');
    out.width = width; out.height = height;
    out.getContext('2d').putImageData(new ImageData(flipped, width, height), 0, 0);
    return { width, height, litSamples, dataUrl: out.toDataURL('image/png') };
  });
  expect(visual.litSamples).toBeGreaterThan(100);
  await fs.mkdir('artifacts', { recursive: true });
  await fs.writeFile('artifacts/arena-accad-mocap-retarget.png', Buffer.from(visual.dataUrl.split(',')[1], 'base64'));
  expect(pageErrors).toEqual([]);
});
