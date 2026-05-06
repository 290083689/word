import { GameState, VIRTUAL_W, VIRTUAL_H } from './types';
import { drawMecha, drawBackground, drawCRT } from './sprites';
import { Particle } from './types';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  frame: number
) {
  ctx.save();

  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground(ctx, frame);

  drawMecha(ctx, state.p1, frame);
  drawMecha(ctx, state.p2, frame);

  drawParticles(ctx, state.particles);

  drawHUD(ctx, state);

  if (state.phase === 'countdown') {
    drawCountdown(ctx, state);
  }

  drawCRT(ctx, VIRTUAL_W, VIRTUAL_H);

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.ceil(p.size), Math.ceil(p.size));
  }
  ctx.globalAlpha = 1;
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  drawHealthBar(ctx, 20, 15, 300, 16, state.p1.hp, state.p1.maxHp, '#00d4ff', '#003344');
  drawHealthBar(ctx, 480, 15, 300, 16, state.p2.hp, state.p2.maxHp, '#ff3366', '#440011');

  drawEnergyBar(ctx, 20, 35, 200, 8, state.p1.ep, state.p1.maxEp, '#00ff88');
  drawEnergyBar(ctx, 580, 35, 200, 8, state.p2.ep, state.p2.maxEp, '#00ff88');

  drawPixelText(ctx, 'P1', 25, 52, '#00d4ff', 1);
  drawPixelText(ctx, 'P2', 755, 52, '#ff3366', 1);

  const timerStr = Math.ceil(state.timer).toString().padStart(2, '0');
  const timerColor = state.timer <= 10 ? '#ff3366' : '#ffffff';
  drawPixelText(ctx, timerStr, 385, 18, timerColor, 2);
}

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  current: number,
  max: number,
  color: string,
  bgColor: string
) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  const ratio = Math.max(0, current / max);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * ratio, h);

  ctx.strokeStyle = '#ffffff44';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  for (let i = 1; i < 10; i++) {
    ctx.fillStyle = '#00000044';
    ctx.fillRect(x + (w / 10) * i, y, 1, h);
  }
}

function drawEnergyBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  current: number,
  max: number,
  color: string
) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(x, y, w, h);

  const ratio = Math.max(0, current / max);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * ratio, h);

  ctx.strokeStyle = '#ffffff22';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawCountdown(ctx: CanvasRenderingContext2D, state: GameState) {
  const num = Math.ceil(state.countdown);
  const text = num > 0 ? num.toString() : 'FIGHT!';
  const scale = num > 0 ? 4 : 3;
  const color = num > 0 ? '#ffcc00' : '#ff3366';

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `bold ${scale * 8}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillText(text, VIRTUAL_W / 2, VIRTUAL_H / 2 - 40);
  ctx.shadowBlur = 0;
  ctx.restore();
}

const PIXEL_FONT: Record<string, number[][]> = {
  '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
  '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
  '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
  '7': [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
  '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
  '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
  'P': [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
};

function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale: number
) {
  ctx.fillStyle = color;
  let offsetX = 0;
  for (const ch of text) {
    const glyph = PIXEL_FONT[ch];
    if (!glyph) {
      offsetX += 4 * scale;
      continue;
    }
    for (let row = 0; row < glyph.length; row++) {
      for (let col = 0; col < glyph[row].length; col++) {
        if (glyph[row][col]) {
          ctx.fillRect(
            x + offsetX + col * scale,
            y + row * scale,
            scale,
            scale
          );
        }
      }
    }
    offsetX += 4 * scale;
  }
}

export function renderStartScreen(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  drawStarsCustom(ctx, frame);

  ctx.save();
  const glow = Math.sin(frame * 0.05) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(0, 212, 255, ${glow})`;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 30;
  ctx.fillText('MECHA COMBAT', VIRTUAL_W / 2, 120);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ff3366';
  ctx.font = 'bold 18px monospace';
  ctx.shadowColor = '#ff3366';
  ctx.shadowBlur = 15;
  ctx.fillText('像素机甲对战', VIRTUAL_W / 2, 160);
  ctx.shadowBlur = 0;
  ctx.restore();

  drawControlsInfo(ctx);

  const blink = Math.sin(frame * 0.08) > 0;
  if (blink) {
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS ENTER TO START', VIRTUAL_W / 2, 400);
  }

  drawCRT(ctx, VIRTUAL_W, VIRTUAL_H);
}

function drawStarsCustom(ctx: CanvasRenderingContext2D, frame: number) {
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137 + 50) % 800;
    const sy = (i * 89 + 30) % 300;
    const flicker = Math.sin(frame * 0.03 + i) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255,255,255,${flicker * 0.6})`;
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function drawControlsInfo(ctx: CanvasRenderingContext2D) {
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';

  const boxY = 200;
  ctx.fillStyle = '#00d4ff33';
  ctx.fillRect(80, boxY, 280, 140);
  ctx.strokeStyle = '#00d4ff66';
  ctx.strokeRect(80, boxY, 280, 140);

  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('PLAYER 1 (BLUE)', 100, boxY + 25);

  ctx.fillStyle = '#aaddff';
  ctx.font = '11px monospace';
  ctx.fillText('W/A/S/D  -  Move', 100, boxY + 50);
  ctx.fillText('F        -  Attack', 100, boxY + 70);
  ctx.fillText('R        -  Special', 100, boxY + 90);
  ctx.fillText('G        -  Defend', 100, boxY + 110);

  ctx.fillStyle = '#ff336633';
  ctx.fillRect(440, boxY, 280, 140);
  ctx.strokeStyle = '#ff336666';
  ctx.strokeRect(440, boxY, 280, 140);

  ctx.fillStyle = '#ff3366';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PLAYER 2 (RED)', 460, boxY + 25);

  ctx.fillStyle = '#ffaacc';
  ctx.font = '11px monospace';
  ctx.fillText('Arrows   -  Move', 460, boxY + 50);
  ctx.fillText('J        -  Attack', 460, boxY + 70);
  ctx.fillText('U        -  Special', 460, boxY + 90);
  ctx.fillText('K        -  Defend', 460, boxY + 110);
}

export function renderResultScreen(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  frame: number
) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

  drawStarsCustom(ctx, frame);

  ctx.save();
  if (state.winner === 'p1') {
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
  } else if (state.winner === 'p2') {
    ctx.fillStyle = '#ff3366';
    ctx.shadowColor = '#ff3366';
  } else {
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
  }

  ctx.shadowBlur = 30;
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';

  if (state.winner === 'draw') {
    ctx.fillText('DRAW!', VIRTUAL_W / 2, 160);
  } else {
    const winnerName = state.winner === 'p1' ? 'PLAYER 1' : 'PLAYER 2';
    ctx.fillText(`${winnerName} WINS!`, VIRTUAL_W / 2, 160);
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.fillStyle = '#ffffff88';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `P1 HP: ${Math.max(0, Math.ceil(state.p1.hp))}  |  P2 HP: ${Math.max(0, Math.ceil(state.p2.hp))}`,
    VIRTUAL_W / 2,
    220
  );

  const blink = Math.sin(frame * 0.08) > 0;
  if (blink) {
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS ENTER TO RESTART', VIRTUAL_W / 2, 320);
  }

  drawParticles(ctx, state.particles);
  drawCRT(ctx, VIRTUAL_W, VIRTUAL_H);
}
