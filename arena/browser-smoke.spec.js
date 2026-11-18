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

test('both gendered fighter rigs load native and ACCAD motion, then play synchronized CMU pairs', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('http://127.0.0.1:4173/arena/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#view canvas')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#mocap-status')).toContainText('43 NATIVE CLIPS + 5 REAL ACCAD COMBAT CLIPS + 1 STANDING CAPTURE EACH · READY', { timeout: 60000 });
  const initial = await page.evaluate(() => window.__fightroomDebug());
  for (const actor of Object.values(initial)) {
    expect(actor.rig.compatible).toBe(true);
    expect(actor.modelBounds.size[1]).toBeGreaterThan(1.5);
    expect(actor.clips.filter(name => name.toLowerCase().startsWith('male2_'))).toHaveLength(6);
    expect(actor.clips).toHaveLength(49);
    expect(actor.outfit).toBeTruthy();
    expect(actor.currentClip.toLowerCase()).toContain('male2_a1_stand');
  }
  const rosterOptions = await page.locator('#player-roster option').evaluateAll(options => options.map(option => ({ value: option.value, label: option.textContent })));
  const female = rosterOptions.find(option => option.label.includes('Women'));
  const male = rosterOptions.find(option => !option.label.includes('Women'));
  expect(female).toBeTruthy();
  expect(male).toBeTruthy();
  await page.locator('#player-roster').selectOption(female.value);
  await expect(page.locator('#mocap-status')).toContainText('43 NATIVE CLIPS + 5 REAL ACCAD COMBAT CLIPS + 1 STANDING CAPTURE', { timeout: 60000 });
  await expect(page.locator('#mocap-status')).toContainText('FEMALE RIG');
  await expect(page.locator('#mocap-status')).toContainText('FIGHTWEAR READY');
  const femaleDebug = await page.evaluate(() => window.__fightroomDebug().player);
  expect(femaleDebug.rig.compatible).toBe(true);
  expect(femaleDebug.currentClip.toLowerCase()).toContain('male2_a1_stand');
  expect(femaleDebug.modelBounds.size[1]).toBeGreaterThan(1.5);
  expect(femaleDebug.clips.filter(name => name.toLowerCase().startsWith('male2_'))).toHaveLength(6);
  await page.locator('#player-roster').selectOption(male.value);
  await expect(page.locator('#mocap-status')).toContainText('MALE RIG', { timeout: 60000 });
  const maleDebug = await page.evaluate(() => window.__fightroomDebug().player);
  expect(maleDebug.rig.compatible).toBe(true);
  expect(maleDebug.currentClip.toLowerCase()).toContain('male2_a1_stand');
  expect(maleDebug.clips.filter(name => name.toLowerCase().startsWith('male2_'))).toHaveLength(6);
  await page.locator('#player-roster').selectOption(female.value);
  await page.locator('#enemy-roster').selectOption(male.value);
  await page.waitForFunction(() => {
    const debug = window.__fightroomDebug();
    return ['player', 'enemy'].every(key => debug[key].rig?.compatible && debug[key].modelBounds?.size?.[1] > 1.5 && debug[key].clips?.length === 49);
  }, null, { timeout: 60000 });
  const pairedDebug = await page.evaluate(() => window.__fightroomDebug());
  for (const actor of Object.values(pairedDebug)) expect(actor.currentClip.toLowerCase()).toContain('male2_a1_stand');
  await page.screenshot({ path: 'artifacts/arena-desktop.png', fullPage: true });
  await page.locator('#preview-paired-mocap').click();
  await expect(page.locator('#mocap-status')).toContainText('REAL PAIRED MOCAP PLAYING', { timeout: 60000 });
  await page.waitForTimeout(8000);
  await expect(page.locator('#mocap-status')).toContainText('REAL PAIRED MOCAP COMPLETE · CMU ARM WRESTLE', { timeout: 10000 });
  await page.locator('#preview-pull-resist').click();
  await expect(page.locator('#mocap-status')).toContainText('REAL PAIRED MOCAP PLAYING · CMU PULL / RESIST', { timeout: 60000 });
  await page.waitForTimeout(5800);
  await expect(page.locator('#mocap-status')).toContainText('REAL PAIRED MOCAP COMPLETE · CMU PULL / RESIST', { timeout: 10000 });
  await expect(page.locator('#view canvas')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
