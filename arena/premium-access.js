// Fail-closed adapter for a future account/entitlement SDK.
// A real provider must verify a server-signed entitlement before returning it.
export const PREMIUM_PRODUCT_ID = 'fightroom-premium';

export const PREMIUM_COMBAT_ACTIONS = Object.freeze([
  'takedown',
  'ground-pound',
  'submission',
  'spinning-backfist',
  'superman-punch',
  'switch-kick',
  'question-mark-kick',
  'spinning-elbow',
  'flying-knee'
]);

export function validatePremiumEntitlement(value, now = Date.now()) {
  if (!value || typeof value !== 'object') return false;
  if (value.productId !== PREMIUM_PRODUCT_ID) return false;
  if (value.status !== 'active' || value.signatureVerified !== true) return false;
  if (value.issuer !== 'fightroom-server' || typeof value.accountId !== 'string' || !value.accountId.trim()) return false;
  const expiresAt = Date.parse(value.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export async function resolvePremiumAccess(provider = globalThis.FIGHTROOM_ENTITLEMENT_PROVIDER, now = Date.now()) {
  if (!provider || typeof provider.getVerifiedEntitlement !== 'function') {
    return { active: false, reason: 'provider-unavailable' };
  }
  try {
    const entitlement = await provider.getVerifiedEntitlement(PREMIUM_PRODUCT_ID);
    return validatePremiumEntitlement(entitlement, now)
      ? { active: true, reason: 'verified-active' }
      : { active: false, reason: 'not-entitled-or-invalid' };
  } catch {
    return { active: false, reason: 'verification-failed' };
  }
}
