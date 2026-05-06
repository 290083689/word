import {
  GameState,
  Mecha,
  PlayerSide,
  VIRTUAL_W,
  VIRTUAL_H,
  GROUND_Y,
  MOVE_SPEED,
  MAX_HP,
  MAX_EP,
  ATTACK_DAMAGE,
  SPECIAL_DAMAGE,
  ATTACK_EP_COST,
  SPECIAL_EP_COST,
  DEFEND_EP_COST,
  EP_REGEN,
  ATTACK_COOLDOWN,
  SPECIAL_COOLDOWN,
  ATTACK_DURATION,
  SPECIAL_DURATION,
  HURT_DURATION,
  DEFEND_DAMAGE_REDUCTION,
  ROUND_TIME,
  ARENA_LEFT,
  ARENA_RIGHT,
} from './types';
import { InputManager } from './input';
import { checkAttackHit } from './collision';
import {
  createHitParticles,
  createDefendParticles,
  createVictoryParticles,
  updateParticles,
} from './particles';
import {
  renderGame,
  renderStartScreen,
  renderResultScreen,
} from './renderer';

function createMecha(side: PlayerSide): Mecha {
  return {
    side,
    pos: {
      x: side === 'p1' ? 200 : 600,
      y: GROUND_Y,
    },
    vel: { x: 0, y: 0 },
    hp: MAX_HP,
    maxHp: MAX_HP,
    ep: MAX_EP,
    maxEp: MAX_EP,
    state: 'idle',
    stateTimer: 0,
    facingRight: side === 'p1',
    attackCooldown: 0,
    specialCooldown: 0,
    hurtTimer: 0,
    isDefending: false,
    comboCount: 0,
  };
}

function createInitialState(): GameState {
  return {
    phase: 'start',
    p1: createMecha('p1'),
    p2: createMecha('p2'),
    timer: ROUND_TIME,
    countdown: 3,
    winner: null,
    particles: [],
    screenShake: 0,
    roundNumber: 1,
  };
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private state: GameState;
  private frame = 0;
  private animFrameId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private readonly TICK = 1000 / 60;
  private onStateChange?: (state: GameState) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputManager();
    this.state = createInitialState();

    this.ctx.imageSmoothingEnabled = false;
  }

  setOnStateChange(cb: (state: GameState) => void) {
    this.onStateChange = cb;
  }

  start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    cancelAnimationFrame(this.animFrameId);
    this.input.destroy();
  }

  private loop = (time: number) => {
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += delta;

    while (this.accumulator >= this.TICK) {
      this.update();
      this.accumulator -= this.TICK;
    }

    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update() {
    this.frame++;

    switch (this.state.phase) {
      case 'start':
        this.updateStart();
        break;
      case 'countdown':
        this.updateCountdown();
        break;
      case 'fighting':
        this.updateFighting();
        break;
      case 'result':
        this.updateResult();
        break;
    }

    this.state.particles = updateParticles(this.state.particles);
    this.state.screenShake = Math.max(0, this.state.screenShake - 0.5);

    this.input.savePrevState();
  }

  private updateStart() {
    if (this.input.wasEnterPressed()) {
      this.startFight();
    }
  }

  private updateCountdown() {
    this.state.countdown -= 1 / 60;
    if (this.state.countdown <= -0.5) {
      this.state.phase = 'fighting';
    }
  }

  private updateFighting() {
    this.state.timer -= 1 / 60;
    if (this.state.timer <= 0) {
      this.state.timer = 0;
      this.endRound();
      return;
    }

    this.updateMecha(this.state.p1, this.input.state.p1, this.state.p2);
    this.updateMecha(this.state.p2, this.input.state.p2, this.state.p1);

    this.handleAttacks();

    if (this.state.p1.hp <= 0 || this.state.p2.hp <= 0) {
      this.endRound();
    }
  }

  private updateResult() {
    if (this.input.wasEnterPressed()) {
      this.state = createInitialState();
      this.state.phase = 'countdown';
      this.state.countdown = 3;
    }
  }

  private startFight() {
    this.state = createInitialState();
    this.state.phase = 'countdown';
    this.state.countdown = 3;
  }

  private endRound() {
    this.state.phase = 'result';
    if (this.state.p1.hp <= 0 && this.state.p2.hp <= 0) {
      this.state.winner = 'draw';
    } else if (this.state.p1.hp <= 0) {
      this.state.winner = 'p2';
    } else if (this.state.p2.hp <= 0) {
      this.state.winner = 'p1';
    } else if (this.state.p1.hp > this.state.p2.hp) {
      this.state.winner = 'p1';
    } else if (this.state.p2.hp > this.state.p1.hp) {
      this.state.winner = 'p2';
    } else {
      this.state.winner = 'draw';
    }

    const winnerMecha = this.state.winner === 'p1' ? this.state.p1 : this.state.p2;
    const winColor = this.state.winner === 'p1' ? '#00d4ff' : '#ff3366';
    if (this.state.winner !== 'draw') {
      this.state.particles.push(
        ...createVictoryParticles(winnerMecha.pos.x, winnerMecha.pos.y - 30, winColor)
      );
    }
  }

  private updateMecha(
    me: Mecha,
    input: { left: boolean; right: boolean; up: boolean; down: boolean; attack: boolean; special: boolean; defend: boolean },
    opponent: Mecha
  ) {
    if (me.hurtTimer > 0) {
      me.hurtTimer--;
      if (me.hurtTimer <= 0) {
        me.state = 'idle';
      }
      return;
    }

    if (me.state === 'attack' || me.state === 'special') {
      me.stateTimer--;
      if (me.stateTimer <= 0) {
        me.state = 'idle';
      }
      return;
    }

    me.isDefending = input.defend && me.ep > DEFEND_EP_COST / 60;
    if (me.isDefending) {
      me.state = 'defend';
      me.ep -= DEFEND_EP_COST / 60;
      if (Math.random() < 0.1) {
        const color = me.side === 'p1' ? '#00d4ff' : '#ff3366';
        this.state.particles.push(
          ...createDefendParticles(
            me.pos.x + (me.facingRight ? 20 : -20),
            me.pos.y - 24,
            color
          )
        );
      }
    } else {
      if (me.state === 'defend') {
        me.state = 'idle';
      }

      let moving = false;
      if (input.left) {
        me.pos.x -= MOVE_SPEED;
        moving = true;
      }
      if (input.right) {
        me.pos.x += MOVE_SPEED;
        moving = true;
      }

      me.pos.x = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT, me.pos.x));

      me.state = moving ? 'walk' : 'idle';
    }

    me.facingRight = me.pos.x < opponent.pos.x;

    if (me.attackCooldown > 0) me.attackCooldown--;
    if (me.specialCooldown > 0) me.specialCooldown--;

    const isP1 = me.side === 'p1';
    const attackPressed = isP1 ? this.input.wasP1AttackPressed() : this.input.wasP2AttackPressed();
    const specialPressed = isP1 ? this.input.wasP1SpecialPressed() : this.input.wasP2SpecialPressed();

    if (attackPressed && me.attackCooldown <= 0 && me.ep >= ATTACK_EP_COST && !me.isDefending) {
      me.state = 'attack';
      me.stateTimer = ATTACK_DURATION;
      me.attackCooldown = ATTACK_COOLDOWN;
      me.ep -= ATTACK_EP_COST;
    }

    if (specialPressed && me.specialCooldown <= 0 && me.ep >= SPECIAL_EP_COST && !me.isDefending) {
      me.state = 'special';
      me.stateTimer = SPECIAL_DURATION;
      me.specialCooldown = SPECIAL_COOLDOWN;
      me.ep -= SPECIAL_EP_COST;
    }

    me.ep = Math.min(MAX_EP, me.ep + EP_REGEN);
  }

  private handleAttacks() {
    this.checkAttack(this.state.p1, this.state.p2);
    this.checkAttack(this.state.p2, this.state.p1);
  }

  private checkAttack(attacker: Mecha, defender: Mecha) {
    if (attacker.state !== 'attack' && attacker.state !== 'special') return;

    const hitFrame = attacker.state === 'attack'
      ? attacker.stateTimer === ATTACK_DURATION - 6
      : attacker.stateTimer === SPECIAL_DURATION - 10;

    if (!hitFrame) return;

    if (checkAttackHit(attacker, defender)) {
      const isSpecial = attacker.state === 'special';
      let damage = isSpecial ? SPECIAL_DAMAGE : ATTACK_DAMAGE;

      if (defender.isDefending) {
        damage = Math.floor(damage * (1 - DEFEND_DAMAGE_REDUCTION));
        const color = defender.side === 'p1' ? '#00d4ff' : '#ff3366';
        this.state.particles.push(
          ...createDefendParticles(
            defender.pos.x + (defender.facingRight ? -15 : 15),
            defender.pos.y - 24,
            color
          )
        );
      } else {
        defender.state = 'hurt';
        defender.hurtTimer = HURT_DURATION;

        const knockback = isSpecial ? 8 : 4;
        const dir = attacker.facingRight ? 1 : -1;
        defender.pos.x += dir * knockback;
        defender.pos.x = Math.max(ARENA_LEFT, Math.min(ARENA_RIGHT, defender.pos.x));
      }

      defender.hp = Math.max(0, defender.hp - damage);
      this.state.screenShake = isSpecial ? 6 : 3;

      const hitX = (attacker.pos.x + defender.pos.x) / 2;
      const hitY = defender.pos.y - 24;
      const hitColor = isSpecial ? '#ffcc00' : '#ffffff';
      this.state.particles.push(...createHitParticles(hitX, hitY, hitColor));
    }
  }

  private render() {
    const { ctx, canvas } = this;
    const scale = Math.min(canvas.width / VIRTUAL_W, canvas.height / VIRTUAL_H);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - VIRTUAL_W * scale) / 2;
    const offsetY = (canvas.height - VIRTUAL_H * scale) / 2;
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    switch (this.state.phase) {
      case 'start':
        renderStartScreen(ctx, this.frame);
        break;
      case 'countdown':
      case 'fighting':
        renderGame(ctx, this.state, this.frame);
        break;
      case 'result':
        renderResultScreen(ctx, this.state, this.frame);
        break;
    }

    ctx.restore();
  }

  getState(): GameState {
    return this.state;
  }
}
