import { Mecha, MechaState } from './types';

type ColorMap = Record<number, string>;

const BLUE_COLORS: ColorMap = {
  1: '#00d4ff',
  2: '#0099cc',
  3: '#006688',
  4: '#003344',
  5: '#ffffff',
  6: '#00ff88',
  7: '#ffcc00',
  8: '#ff3366',
};

const RED_COLORS: ColorMap = {
  1: '#ff3366',
  2: '#cc2255',
  3: '#881133',
  4: '#440011',
  5: '#ffffff',
  6: '#00ff88',
  7: '#ffcc00',
  8: '#00d4ff',
};

const PIXEL_SIZE = 2;

const IDLE_FRAME_1 = [
  '0000003333000000000003333000000',
  '000003355330000000003355330000',
  '000033555533000000335555330000',
  '000033555533000000335555330000',
  '000033666633000000336666330000',
  '000003333300000000003333300000',
  '000000111100000000001111000000',
  '000001111110000000111111000000',
  '000011771111000011117711100000',
  '000011111111000011111111100000',
  '000011111111000011111111100000',
  '000001111110000001111111000000',
  '000000111100000000111100000000',
  '000001111100000001111100000000',
  '000011111110000011111110000000',
  '000011111110000011111110000000',
  '000011111110000011111110000000',
  '000001111100000001111100000000',
  '000001111100000001111100000000',
  '000011331100000011331100000000',
  '000011331100000011331100000000',
  '000011111100000011111100000000',
  '000011111100000011111100000000',
  '000001111000000001111000000000',
  '000001111000000001111000000000',
  '000001331000000001331000000000',
  '000001331000000001331000000000',
  '000001111000000001111000000000',
  '000001111000000001111000000000',
  '000000110000000000011000000000',
  '000000110000000000011000000000',
  '000000110000000000011000000000',
  '000000330000000000033000000000',
  '000000330000000000033000000000',
  '000000330000000000033000000000',
];

function parseSpriteFrame(lines: string[]): number[][] {
  return lines.map((line) =>
    line.split('').map((ch) => {
      const n = parseInt(ch, 10);
      return isNaN(n) ? 0 : n;
    })
  );
}

function flipHorizontal(data: number[][]): number[][] {
  return data.map((row) => [...row].reverse());
}

export function drawMecha(
  ctx: CanvasRenderingContext2D,
  mecha: Mecha,
  frame: number
) {
  const colors = mecha.side === 'p1' ? BLUE_COLORS : RED_COLORS;
  const spriteData = generateMechaSprite(mecha.state, frame, mecha.facingRight);

  ctx.save();
  const drawX = mecha.pos.x - 16 * PIXEL_SIZE;
  const drawY = mecha.pos.y - 35 * PIXEL_SIZE;

  if (mecha.hurtTimer > 0 && Math.floor(mecha.hurtTimer / 3) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  for (let row = 0; row < spriteData.length; row++) {
    for (let col = 0; col < spriteData[row].length; col++) {
      const colorIdx = spriteData[row][col];
      if (colorIdx === 0) continue;
      const color = colors[colorIdx];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        drawX + col * PIXEL_SIZE,
        drawY + row * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  }

  if (mecha.isDefending) {
    ctx.globalAlpha = 0.4;
    const shieldX = mecha.facingRight ? drawX + 32 * PIXEL_SIZE : drawX - 6 * PIXEL_SIZE;
    ctx.fillStyle = colors[1];
    ctx.fillRect(shieldX, drawY + 5 * PIXEL_SIZE, 4 * PIXEL_SIZE, 15 * PIXEL_SIZE);
    ctx.globalAlpha = 0.2;
    ctx.fillRect(shieldX - PIXEL_SIZE, drawY + 3 * PIXEL_SIZE, 6 * PIXEL_SIZE, 17 * PIXEL_SIZE);
  }

  ctx.restore();
}

function generateMechaSprite(
  state: MechaState,
  frame: number,
  facingRight: boolean
): number[][] {
  let data: number[][];

  switch (state) {
    case 'idle':
      data = generateIdleFrame(frame);
      break;
    case 'walk':
      data = generateWalkFrame(frame);
      break;
    case 'attack':
      data = generateAttackFrame(frame);
      break;
    case 'special':
      data = generateSpecialFrame(frame);
      break;
    case 'defend':
      data = generateDefendFrame(frame);
      break;
    case 'hurt':
      data = generateHurtFrame(frame);
      break;
    default:
      data = generateIdleFrame(0);
  }

  if (!facingRight) {
    data = flipHorizontal(data);
  }

  return data;
}

function generateIdleFrame(frame: number): number[][] {
  const base = parseSpriteFrame(IDLE_FRAME_1);
  const bobOffset = frame % 4 < 2 ? 0 : 1;

  const result = Array.from({ length: 35 }, () => Array(32).fill(0));

  for (let row = 0; row < base.length; row++) {
    for (let col = 0; col < base[row].length; col++) {
      if (base[row][col] !== 0 && row + bobOffset < 35) {
        result[row + bobOffset][col] = base[row][col];
      }
    }
  }

  return result;
}

function generateWalkFrame(frame: number): number[][] {
  const base = parseSpriteFrame(IDLE_FRAME_1);
  const result = Array.from({ length: 35 }, () => Array(32).fill(0));

  const legPhase = frame % 4;
  const legShiftL = legPhase === 0 ? 2 : legPhase === 2 ? -2 : 0;
  const legShiftR = legPhase === 0 ? -2 : legPhase === 2 ? 2 : 0;
  const bodyBob = legPhase === 1 || legPhase === 3 ? 1 : 0;

  for (let row = 0; row < base.length; row++) {
    for (let col = 0; col < base[row].length; col++) {
      if (base[row][col] === 0) continue;
      let targetCol = col;
      if (row >= 30 && col < 16) targetCol = col + legShiftL;
      if (row >= 30 && col >= 16) targetCol = col + legShiftR;
      if (targetCol >= 0 && targetCol < 32 && row + bodyBob < 35) {
        result[row + bodyBob][targetCol] = base[row][col];
      }
    }
  }

  return result;
}

function generateAttackFrame(frame: number): number[][] {
  const base = parseSpriteFrame(IDLE_FRAME_1);
  const result = Array.from({ length: 35 }, () => Array(32).fill(0));

  const punchExtend = frame === 1 ? 4 : frame === 2 ? 2 : 0;

  for (let row = 0; row < base.length; row++) {
    for (let col = 0; col < base[row].length; col++) {
      if (base[row][col] === 0) continue;
      let targetCol = col;
      if (row >= 8 && row <= 14 && col >= 24) {
        targetCol = Math.min(31, col + punchExtend);
      }
      if (targetCol >= 0 && targetCol < 32) {
        result[row][targetCol] = base[row][col];
      }
    }
  }

  if (frame === 1) {
    for (let r = 8; r <= 14; r++) {
      for (let c = 28; c <= 31; c++) {
        result[r][c] = 7;
      }
    }
  }

  return result;
}

function generateSpecialFrame(frame: number): number[][] {
  const base = parseSpriteFrame(IDLE_FRAME_1);
  const result = Array.from({ length: 35 }, () => Array(32).fill(0));

  const glow = frame === 1 ? 6 : frame === 2 ? 7 : 6;

  for (let row = 0; row < base.length; row++) {
    for (let col = 0; col < base[row].length; col++) {
      if (base[row][col] === 0) continue;
      result[row][col] = base[row][col];
    }
  }

  if (frame >= 1) {
    for (let r = 6; r <= 10; r++) {
      for (let c = 12; c <= 19; c++) {
        if (result[r][c] === 0) result[r][c] = glow;
      }
    }
    for (let r = 8; r <= 12; r++) {
      for (let c = 26; c <= 31; c++) {
        result[r][c] = glow;
      }
    }
  }

  return result;
}

function generateDefendFrame(frame: number): number[][] {
  const base = parseSpriteFrame(IDLE_FRAME_1);
  const result = Array.from({ length: 35 }, () => Array(32).fill(0));

  const shieldPulse = frame % 2 === 0 ? 0 : 1;

  for (let row = 0; row < base.length; row++) {
    for (let col = 0; col < base[row].length; col++) {
      if (base[row][col] === 0) continue;
      let targetCol = col;
      if (row >= 6 && row <= 18 && col >= 24) {
        targetCol = Math.max(col - 3 - shieldPulse, 0);
      }
      if (targetCol >= 0 && targetCol < 32) {
        result[row][targetCol] = base[row][col];
      }
    }
  }

  return result;
}

function generateHurtFrame(frame: number): number[][] {
  const base = parseSpriteFrame(IDLE_FRAME_1);
  const result = Array.from({ length: 35 }, () => Array(32).fill(0));

  const shift = frame === 0 ? 2 : 1;

  for (let row = 0; row < base.length; row++) {
    for (let col = 0; col < base[row].length; col++) {
      if (base[row][col] === 0) continue;
      const targetCol = Math.min(31, col + shift);
      result[row][targetCol] = base[row][col];
    }
  }

  return result;
}

export function drawBackground(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, 800, 450);

  drawStars(ctx, frame);
  drawCityscape(ctx);
  drawGround(ctx);
}

const stars: { x: number; y: number; brightness: number; speed: number }[] = [];
function initStars() {
  if (stars.length > 0) return;
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * 800,
      y: Math.random() * 200,
      brightness: 0.3 + Math.random() * 0.7,
      speed: 0.5 + Math.random() * 2,
    });
  }
}

function drawStars(ctx: CanvasRenderingContext2D, frame: number) {
  initStars();
  for (const star of stars) {
    const flicker = Math.sin(frame * 0.05 * star.speed + star.x) * 0.3 + 0.7;
    const alpha = star.brightness * flicker;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 2, 2);
  }
}

function drawCityscape(ctx: CanvasRenderingContext2D) {
  const buildings = [
    { x: 0, w: 60, h: 120, seed: 42 },
    { x: 55, w: 40, h: 90, seed: 73 },
    { x: 100, w: 50, h: 150, seed: 17 },
    { x: 155, w: 35, h: 80, seed: 91 },
    { x: 200, w: 55, h: 130, seed: 33 },
    { x: 260, w: 45, h: 100, seed: 58 },
    { x: 310, w: 60, h: 160, seed: 24 },
    { x: 375, w: 40, h: 95, seed: 66 },
    { x: 420, w: 50, h: 140, seed: 81 },
    { x: 475, w: 55, h: 110, seed: 45 },
    { x: 530, w: 40, h: 85, seed: 12 },
    { x: 575, w: 60, h: 155, seed: 37 },
    { x: 640, w: 45, h: 100, seed: 54 },
    { x: 690, w: 55, h: 130, seed: 29 },
    { x: 745, w: 55, h: 90, seed: 68 },
  ];

  for (const b of buildings) {
    const baseY = 360;
    ctx.fillStyle = '#0d0d2b';
    ctx.fillRect(b.x, baseY - b.h, b.w, b.h);

    ctx.fillStyle = '#141440';
    let rng = b.seed;
    for (let wy = baseY - b.h + 8; wy < baseY - 5; wy += 12) {
      for (let wx = b.x + 5; wx < b.x + b.w - 5; wx += 10) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        if ((rng % 10) > 3) {
          ctx.fillRect(wx, wy, 4, 4);
        }
      }
    }
  }
}

function drawGround(ctx: CanvasRenderingContext2D) {
  for (let x = 0; x < 800; x += 32) {
    for (let y = 360; y < 450; y += 16) {
      const shade = ((x / 32 + y / 16) % 2 === 0) ? '#1a1a3e' : '#161638';
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, 32, 16);
    }
  }

  ctx.fillStyle = '#2a2a5e';
  ctx.fillRect(0, 358, 800, 3);

  ctx.fillStyle = '#00ff8844';
  ctx.fillRect(40, 361, 720, 1);
}

export function drawCRT(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }

  const vignette = ctx.createRadialGradient(
    w / 2, h / 2, w * 0.3,
    w / 2, h / 2, w * 0.7
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}
