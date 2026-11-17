import test from 'node:test';
import assert from 'node:assert/strict';
import { GROUND_STATES, GRAPPLE_ACTIONS, transitionGround, resolveGrappleAction, submissionProgress } from './ground-combat.js';

test('ground state catalogue and transition guard reject impossible states', () => {
  assert.ok(GROUND_STATES.includes('clinch'));
  assert.ok(GROUND_STATES.includes('mount'));
  assert.equal(transitionGround('standing','mount').reason,'illegal-transition');
  assert.equal(transitionGround('nonsense','standing').reason,'invalid-state');
  assert.equal(transitionGround('top-control','submission',{stamina:5}).reason,'exhausted');
});

test('premium wrestling entries fail closed while free defense remains usable', () => {
  assert.equal(resolveGrappleAction({action:'clinch'}).reason,'premium-required');
  assert.equal(resolveGrappleAction({action:'takedown',attackerState:'clinch',defenderState:'clinch'}).reason,'premium-required');
  assert.equal(resolveGrappleAction({action:'sprawl',attackerState:'standing',defenderState:'clinch'}).ok,true);
  assert.equal(resolveGrappleAction({action:'escape',attackerState:'bottom-guard'}).ok,true);
  assert.equal(GRAPPLE_ACTIONS['defend-submission'].premium,false);
});

test('clinch to takedown produces paired top and bottom positions with stamina costs', () => {
  const clinch = resolveGrappleAction({action:'clinch',premium:true});
  assert.deepEqual([clinch.attackerState,clinch.defenderState],['clinch','clinch']);
  const td = resolveGrappleAction({action:'takedown',attackerState:'clinch',defenderState:'clinch',premium:true,attackerSkill:80,defenderSkill:60});
  assert.equal(td.ok,true);
  assert.deepEqual([td.attackerState,td.defenderState],['top-control','bottom-guard']);
  assert.ok(td.attackerStamina < 100 && td.defenderStamina < 100);
});

test('stronger defense can stuff takedown and failed action consumes limited stamina', () => {
  const result = resolveGrappleAction({action:'takedown',attackerState:'clinch',defenderState:'clinch',premium:true,attackerSkill:30,defenderSkill:90});
  assert.equal(result.reason,'takedown-defended');
  assert.ok(result.attackerStamina < 100);
});

test('ground position progression supports pass, mount, back control and submission', () => {
  const pass = resolveGrappleAction({action:'pass',attackerState:'top-control',defenderState:'bottom-guard',premium:true});
  assert.equal(pass.attackerState,'side-control');
  const mount = resolveGrappleAction({action:'mount',attackerState:'side-control',defenderState:'bottom-guard',premium:true});
  assert.equal(mount.attackerState,'mount');
  const back = resolveGrappleAction({action:'back-take',attackerState:'mount',defenderState:'bottom-guard',premium:true});
  assert.equal(back.attackerState,'back-control');
  const sub = resolveGrappleAction({action:'submission',attackerState:'back-control',defenderState:'bottom-guard',premium:true});
  assert.equal(sub.attackerState,'submission');
});

test('bottom fighter can sweep, frame, escape and defend without premium', () => {
  const frame = resolveGrappleAction({action:'frame',attackerState:'bottom-guard'});
  assert.equal(frame.ok,true);
  const sweep = resolveGrappleAction({action:'sweep',attackerState:'bottom-guard',defenderState:'top-control',premium:true,attackerSkill:90,defenderSkill:50});
  assert.deepEqual([sweep.attackerState,sweep.defenderState],['top-control','bottom-guard']);
  const escape = resolveGrappleAction({action:'escape',attackerState:'mount',defenderState:'top-control'});
  assert.deepEqual([escape.attackerState,escape.defenderState],['standing','standing']);
  const defend = resolveGrappleAction({action:'defend-submission',attackerState:'submission',defenderState:'bottom-guard'});
  assert.equal(defend.ok,true);
});

test('submission pressure is bounded and weak escapes reduce progress', () => {
  const strong = submissionProgress({control:80,attackerStamina:90,defenderEscape:0,defenderStamina:40});
  const weak = submissionProgress({control:80,attackerStamina:90,defenderEscape:40,defenderStamina:80});
  assert.ok(strong > weak);
  assert.ok(submissionProgress({control:1000}) <= 100);
});
