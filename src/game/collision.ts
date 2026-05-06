import { Mecha, ATTACK_RANGE } from './types';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MECHA_VISUAL_W = 64;
const MECHA_VISUAL_H = 70;

export function getMechaHitbox(m: Mecha): Rect {
  return {
    x: m.pos.x - MECHA_VISUAL_W / 2,
    y: m.pos.y - MECHA_VISUAL_H,
    w: MECHA_VISUAL_W,
    h: MECHA_VISUAL_H,
  };
}

export function getMechaAttackBox(m: Mecha): Rect {
  const dir = m.facingRight ? 1 : -1;
  return {
    x: m.pos.x + dir * (MECHA_VISUAL_W / 2),
    y: m.pos.y - MECHA_VISUAL_H + 10,
    w: ATTACK_RANGE,
    h: 50,
  };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function checkAttackHit(attacker: Mecha, defender: Mecha): boolean {
  const atkBox = getMechaAttackBox(attacker);
  const defBox = getMechaHitbox(defender);
  return rectsOverlap(atkBox, defBox);
}
