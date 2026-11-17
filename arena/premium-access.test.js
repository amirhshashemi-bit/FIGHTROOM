import test from 'node:test';
import assert from 'node:assert/strict';
import { PREMIUM_COMBAT_ACTIONS, PREMIUM_PRODUCT_ID, validatePremiumEntitlement, resolvePremiumAccess } from './premium-access.js';
import { MOVE_CATALOG } from './character-creator.js';

const valid = {
  productId: PREMIUM_PRODUCT_ID,
  status: 'active',
  signatureVerified: true,
  issuer: 'fightroom-server',
  accountId: 'test-account',
  expiresAt: '2030-01-01T00:00:00.000Z'
};

test('premium access fails closed without a connected provider', async () => {
  assert.deepEqual(await resolvePremiumAccess(null, 0), { active: false, reason: 'provider-unavailable' });
});
test('premium access accepts only a verified, active, unexpired server entitlement', () => {
  assert.equal(validatePremiumEntitlement(valid, Date.parse('2029-01-01')), true);
  assert.equal(validatePremiumEntitlement({...valid, signatureVerified:false}, Date.parse('2029-01-01')), false);
  assert.equal(validatePremiumEntitlement({...valid, issuer:'local-storage'}, Date.parse('2029-01-01')), false);
  assert.equal(validatePremiumEntitlement({...valid, status:'expired'}, Date.parse('2029-01-01')), false);
  assert.equal(validatePremiumEntitlement({...valid, expiresAt:'2028-01-01T00:00:00Z'}, Date.parse('2029-01-01')), false);
});
test('catalog keeps basic signatures standard and locks advanced moves behind premium', () => {
  assert.equal(MOVE_CATALOG.find(m=>m.id==='signature-jab').premium,false);
  assert.equal(MOVE_CATALOG.find(m=>m.id==='signature-cross').premium,false);
  for (const id of ['spinning-backfist','superman-punch','switch-kick','question-mark-kick','spinning-elbow','flying-knee','double-leg-chain','armbar-transition']) assert.equal(MOVE_CATALOG.find(m=>m.id===id).premium,true,id);
});
test('premium action list includes grappling and advanced techniques', () => {
  for (const action of ['takedown','ground-pound','submission','spinning-backfist','flying-knee']) {
    assert.ok(PREMIUM_COMBAT_ACTIONS.includes(action));
  }
});
test('provider errors fail closed', async () => {
  const result = await resolvePremiumAccess({getVerifiedEntitlement:async()=>{throw new Error('offline')}}, 0);
  assert.equal(result.active, false);
  assert.equal(result.reason, 'verification-failed');
});
