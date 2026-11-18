# Premium combat access — pre-alpha implementation

## Standard access
Every player can use the core striking and defense set: jab, cross, hook, low kick, high kick, guard, and evade. Standing up after a ground exchange remains available as a recovery action.

## Premium combat set
The premium gate covers:
- Wrestling entry: takedown / chain double-leg.
- Ground offense: ground-and-pound.
- Submission attempts and the armbar transition.
- Advanced striking: spinning backfist, Superman punch, switch kick, question-mark kick, spinning elbow, and flying knee.
- Two custom signature-move loadout slots can equip premium catalog moves only while a verified entitlement is active.

Premium special strikes have their own timing, stamina cost, reach, damage, and procedural animation profile. They use the same contact, range, guard, evasion and hit-resolution pipeline as standard strikes. Ground-and-pound now has an action window and stamina cost rather than applying instant damage on button press.

## Entitlement integration and security boundary
`premium-access.js` fails closed when there is no provider or verification fails. The expected account SDK contract is:

```js
globalThis.FIGHTROOM_ENTITLEMENT_PROVIDER = {
  async getVerifiedEntitlement(productId) {
    // Call the account service and cryptographically verify its signed response.
    // Return { productId, status, signatureVerified, issuer,
    //          accountId, expiresAt } only after verification.
  }
};
```

The current repository has no account service, payment provider, signed receipt verifier, or server-side inventory. Therefore no real subscription can currently be sold or verified, and premium actions remain locked in the shipped browser prototype unless a trusted provider is integrated. A browser-side gate alone is not a security boundary: online match rewards, inventory, purchases, and any competitive action must also be validated by the server. Do not replace this with a localStorage flag or client-editable boolean.

## Animation truthfulness
The new special moves use original procedural animation curves. They are not motion-capture clips. The imported CC0 model contains generic locomotion only; no MMA strike, wrestling or submission clips were discovered in its 12 animations. If a compatible licensed clip is later imported, the loader can play a matching named clip; otherwise the procedural fallback is used.

## Verification
Run `npm test` from this directory. The suite includes move timing/range/defense checks and fail-closed entitlement tests. Manual desktop and Android visual QA is still required before release.
