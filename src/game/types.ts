export type GamePhase = 'start' | 'countdown' | 'fighting' | 'result';

export type MechaState = 'idle' | 'walk' | 'attack' | 'special' | 'defend' | 'hurt';

export type PlayerSide = 'p1' | 'p2';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Mecha {
  side: PlayerSide;
  pos: Vec2;
  vel: Vec2;
  hp: number;
  maxHp: number;
  ep: number;
  maxEp: number;
  state: MechaState;
  stateTimer: number;
  facingRight: boolean;
  attackCooldown: number;
  specialCooldown: number;
  hurtTimer: number;
  isDefending: boolean;
  comboCount: number;
}

export interface AttackBox {
  x: number;
  y: number;
  w: number;
  h: number;
  damage: number;
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  phase: GamePhase;
  p1: Mecha;
  p2: Mecha;
  timer: number;
  countdown: number;
  winner: PlayerSide | 'draw' | null;
  particles: Particle[];
  screenShake: number;
  roundNumber: number;
}

export const VIRTUAL_W = 800;
export const VIRTUAL_H = 450;
export const GROUND_Y = 360;
export const MECHA_W = 32;
export const MECHA_H = 48;
export const ATTACK_RANGE = 45;
export const ATTACK_W = 40;
export const ATTACK_H = 40;
export const MOVE_SPEED = 3;
export const MAX_HP = 100;
export const MAX_EP = 100;
export const ATTACK_DAMAGE = 10;
export const SPECIAL_DAMAGE = 25;
export const ATTACK_EP_COST = 20;
export const SPECIAL_EP_COST = 50;
export const DEFEND_EP_COST = 10;
export const EP_REGEN = 0.08;
export const ATTACK_COOLDOWN = 30;
export const SPECIAL_COOLDOWN = 90;
export const ATTACK_DURATION = 18;
export const SPECIAL_DURATION = 30;
export const HURT_DURATION = 15;
export const DEFEND_DAMAGE_REDUCTION = 0.7;
export const ROUND_TIME = 99;
export const ARENA_LEFT = 40;
export const ARENA_RIGHT = 760;
