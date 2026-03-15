import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { AudioManager } from '../AudioManager';

const TILE = 32;
const COLS = 20;
const ROWS = 16;

const MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const EXIT_COL = 10;
const EXIT_ROW = 15;

const TERMINALS: [number, number][] = [
  [3, 4], [7, 4], [11, 4], [15, 4],
];

const SENSEI_COL = 10;
const SENSEI_ROW = 2;

const MOVE_INITIAL_DELAY = 200;
const MOVE_REPEAT_RATE = 140;

export interface LessonInfo {
  id: string;
  title: string;
  xp: number;
  terminalIndex: number;
}

const TRACK1_LESSONS: LessonInfo[] = [
  { id: 'les-1-1-1', title: 'The History of Money',         xp: 50, terminalIndex: 0 },
  { id: 'les-1-1-2', title: 'Problems with Modern Finance', xp: 50, terminalIndex: 1 },
  { id: 'les-1-2-1', title: 'What is Bitcoin?',             xp: 75, terminalIndex: 2 },
  { id: 'les-1-2-2', title: 'Bitcoin vs Other Crypto',      xp: 50, terminalIndex: 3 },
];

export class DojoScene extends Phaser.Scene {
  private playerGridX = 10;
  private playerGridY = 13;
  private isMoving = false;
  private blockInput = false;
  private playerContainer!: Phaser.GameObjects.Container;
  private playerGraphics!: Phaser.GameObjects.Graphics;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private upKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private interactPrompt!: Phaser.GameObjects.Text;
  private terminalGraphics: Phaser.GameObjects.Graphics[] = [];
  private completedLessons: Set<string> = new Set();
  private senseiGraphics!: Phaser.GameObjects.Graphics;
  private senseiGlow!: Phaser.GameObjects.Graphics;
  private senseiPrompt!: Phaser.GameObjects.Text;
  private lastDx = 0;
  private lastDy = 0;
  private moveTimer = 0;

  constructor() { super({ key: 'DojoScene' }); }

  create() {
    this.isMoving = false; this.blockInput = false;
    this.lastDx = 0; this.lastDy = 0; this.moveTimer = 0;
    this.terminalGraphics = [];
    this.completedLessons = new Set();

    this.drawFloor();
    this.drawWalls();
    this.createTerminals();
    this.createSensei();
    this.createPlayer();
    this.createUI();
    this.setupControls();

    this.events.on(Phaser.Scenes.Events.SLEEP, this.onSleep, this);
    this.events.on(Phaser.Scenes.Events.WAKE,  this.onWake,  this);

    this.registerEventBusListeners();
    AudioManager.setIndoor();
    EventBus.emit('dojoReady');
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  private registerEventBusListeners() {
    EventBus.on('setCompletedLessons', this.onSetCompletedLessons, this);
    EventBus.on('lessonComplete',      this.onLessonComplete,      this);
    EventBus.on('blockInput',          this.onBlockInput,          this);
    EventBus.on('unblockInput',        this.onUnblockInput,        this);
  }

  private unregisterEventBusListeners() {
    EventBus.off('setCompletedLessons', this.onSetCompletedLessons, this);
    EventBus.off('lessonComplete',      this.onLessonComplete,      this);
    EventBus.off('blockInput',          this.onBlockInput,          this);
    EventBus.off('unblockInput',        this.onUnblockInput,        this);
  }

  onSleep() { this.unregisterEventBusListeners(); }

  onWake() {
    this.playerGridX = EXIT_COL;
    this.playerGridY = EXIT_ROW - 1;
    this.playerContainer.setPosition(
      this.playerGridX * TILE + TILE / 2,
      this.playerGridY * TILE + TILE / 2
    );
    this.isMoving = false; this.blockInput = false;
    this.lastDx = 0; this.lastDy = 0; this.moveTimer = 0;
    this.registerEventBusListeners();
    AudioManager.setIndoor();
    this.cameras.main.fadeIn(350, 0, 0, 0);
    EventBus.emit('dojoReady');
  }

  // ── DRAWING ──────────────────────────────────────────────────

  drawFloor() {
    const g = this.add.graphics();

    // Base — deep slate blue, clearly visible
    g.fillStyle(0x3a4a5e);
    g.fillRect(0, 0, COLS * TILE, ROWS * TILE);

    // Alternating floor tiles — two clearly different shades of slate
    for (let row = 1; row < ROWS - 1; row++) {
      for (let col = 1; col < COLS - 1; col++) {
        const shade = (row + col) % 2 === 0 ? 0x445466 : 0x324050;
        g.fillStyle(shade);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);
      }
    }

    // Tile grid lines — clearly visible dark gap
    g.fillStyle(0x28364a);
    for (let row = 1; row <= ROWS - 1; row++) {
      g.fillRect(TILE, row * TILE, (COLS - 2) * TILE, 1);
    }
    for (let col = 1; col <= COLS - 1; col++) {
      g.fillRect(col * TILE, TILE, 1, (ROWS - 2) * TILE);
    }

    // ── Central training mat ───────────────────────────────────
    const matL = 2 * TILE;  const matT = 6 * TILE;
    const matW = 16 * TILE; const matH = 6 * TILE;

    // Mat surface — warm brown, clearly distinct from cold blue floor
    g.fillStyle(0x6e5234);
    g.fillRect(matL, matT, matW, matH);
    // Mat tile grid (warm-toned lines)
    g.fillStyle(0x56401e);
    for (let row = 0; row <= 6; row++) {
      g.fillRect(matL, matT + row * TILE, matW, 1);
    }
    for (let col = 0; col <= 16; col++) {
      g.fillRect(matL + col * TILE, matT, 1, matH);
    }

    // Mat border — solid amber, clearly visible
    g.fillStyle(0xF7931A);
    g.fillRect(matL, matT, matW, 2);
    g.fillRect(matL, matT + matH - 2, matW, 2);
    g.fillRect(matL, matT, 2, matH);
    g.fillRect(matL + matW - 2, matT, 2, matH);

    // Corner bracket accents
    g.fillStyle(0xffb84d);
    g.fillRect(matL,            matT,            10, 2); g.fillRect(matL,            matT,            2, 10);
    g.fillRect(matL + matW - 10, matT,           10, 2); g.fillRect(matL + matW - 2, matT,            2, 10);
    g.fillRect(matL,            matT + matH - 2, 10, 2); g.fillRect(matL,            matT + matH - 10, 2, 10);
    g.fillRect(matL + matW - 10, matT + matH - 2, 10, 2); g.fillRect(matL + matW - 2, matT + matH - 10, 2, 10);

    // ₿ glyph on mat — amber, clearly visible
    const bx = COLS / 2 * TILE - 9;
    const by = matT + matH / 2 - 14;
    g.fillStyle(0xF7931A, 0.35);
    g.fillRect(bx,      by,      3, 28);
    g.fillRect(bx + 10, by,      3, 28);
    g.fillRect(bx - 2,  by + 2,  18, 3);
    g.fillRect(bx - 2,  by + 12, 18, 3);
    g.fillRect(bx - 2,  by + 23, 18, 3);
    g.fillRect(bx + 1,  by + 5,  10, 7);
    g.fillRect(bx + 1,  by + 15, 10, 8);

    // Exit tile — warm amber suggestion
    g.fillStyle(0xF7931A, 0.30);
    g.fillRect(EXIT_COL * TILE, EXIT_ROW * TILE, TILE, TILE);
    g.fillStyle(0xF7931A, 0.12);
    g.fillRect(EXIT_COL * TILE - 4, EXIT_ROW * TILE - 8, TILE + 8, TILE + 8);
  }

  drawWalls() {
    const g = this.add.graphics();

    // ── Top/header wall ────────────────────────────────────────
    // Warm stone — clearly visible dark brown
    g.fillStyle(0x6e5030);
    g.fillRect(0, 0, COLS * TILE, TILE);
    g.fillStyle(0x5a3e22);
    g.fillRect(0, 0, COLS * TILE, TILE - 2);
    // Mortar lines
    g.fillStyle(0x3e2a12);
    g.fillRect(0, 10, COLS * TILE, 1);
    g.fillRect(0, 22, COLS * TILE, 1);
    // Amber base strip
    g.fillStyle(0xF7931A);
    g.fillRect(0, TILE - 2, COLS * TILE, 2);
    g.fillStyle(0xF7931A, 0.22);
    g.fillRect(0, TILE - 10, COLS * TILE, 8);

    // ── Side walls ─────────────────────────────────────────────
    for (let row = 1; row < ROWS - 1; row++) {
      const py = row * TILE;

      // Left wall
      g.fillStyle(0x6e5030); g.fillRect(0, py, TILE, TILE);
      g.fillStyle(0x5a3e22); g.fillRect(0, py, TILE - 2, TILE);
      g.fillStyle(0x3e2a12); g.fillRect(2, py + TILE / 2, TILE - 6, 1);
      g.fillStyle(0xF7931A, 0.85); g.fillRect(TILE - 2, py, 2, TILE);
      g.fillStyle(0xF7931A, 0.12); g.fillRect(TILE - 10, py, 8, TILE);

      // Right wall
      g.fillStyle(0x6e5030); g.fillRect((COLS - 1) * TILE, py, TILE, TILE);
      g.fillStyle(0x5a3e22); g.fillRect((COLS - 1) * TILE + 2, py, TILE - 2, TILE);
      g.fillStyle(0x3e2a12); g.fillRect((COLS - 1) * TILE + 4, py + TILE / 2, TILE - 6, 1);
      g.fillStyle(0xF7931A, 0.85); g.fillRect((COLS - 1) * TILE, py, 2, TILE);
      g.fillStyle(0xF7931A, 0.12); g.fillRect((COLS - 1) * TILE, py, 8, TILE);
    }

    // ── Bottom wall ────────────────────────────────────────────
    for (let col = 0; col < COLS; col++) {
      if (col === EXIT_COL) continue;
      const px = col * TILE; const py = (ROWS - 1) * TILE;
      g.fillStyle(0x6e5030); g.fillRect(px, py, TILE, TILE);
      g.fillStyle(0x5a3e22); g.fillRect(px + 2, py + 2, TILE - 4, TILE);
      g.fillStyle(0x3e2a12); g.fillRect(px + 2, py + TILE / 3, TILE - 4, 1);
      g.fillStyle(0xF7931A, 0.65); g.fillRect(px, py, TILE, 2);
    }

    // ── Exit door ─────────────────────────────────────────────
    const epx = EXIT_COL * TILE;
    const epy = (ROWS - 1) * TILE;
    g.fillStyle(0x2e1c08); g.fillRect(epx, epy, TILE, TILE);
    g.fillStyle(0x4a2e10); g.fillRect(epx + 2, epy, TILE - 4, TILE);
    g.fillStyle(0x6e4018); g.fillRect(epx + 4, epy, TILE - 8, TILE);
    g.fillStyle(0x9a5820); g.fillRect(epx + 6, epy, TILE - 12, TILE);
    g.fillStyle(0xc4742a); g.fillRect(epx + 8, epy, TILE - 16, TILE);
    g.fillStyle(0x000000, 0.15);
    for (let sl = 0; sl < TILE; sl += 3) {
      g.fillRect(epx + 4, epy + sl, TILE - 8, 1);
    }
    g.fillStyle(0xF7931A);
    g.fillRect(epx + 2, epy, 2, TILE);
    g.fillRect(epx + TILE - 4, epy, 2, TILE);
    g.fillRect(epx, epy, TILE, 2);
    g.fillStyle(0xF7931A, 0.15);
    g.fillRect(epx - 8, epy - 6, TILE + 16, TILE + 6);

    // ── Column pillars on inner wall faces ─────────────────────
    for (let r = 2; r <= 14; r += 3) {
      const py = r * TILE;
      // Left pillar
      g.fillStyle(0x7a5c38); g.fillRect(TILE + 2, py + 2, 12, TILE - 4);
      g.fillStyle(0x644a28); g.fillRect(TILE + 3, py + 3, 10, TILE - 6);
      g.fillStyle(0xF7931A); g.fillRect(TILE + 2, py + 2, 2, TILE - 4);
      g.fillStyle(0xF7931A, 0.16); g.fillRect(TILE, py, 18, TILE);
      // Right pillar
      g.fillStyle(0x7a5c38); g.fillRect((COLS - 2) * TILE - 14, py + 2, 12, TILE - 4);
      g.fillStyle(0x644a28); g.fillRect((COLS - 2) * TILE - 13, py + 3, 10, TILE - 6);
      g.fillStyle(0xF7931A); g.fillRect((COLS - 2) * TILE - 2, py + 2, 2, TILE - 4);
      g.fillStyle(0xF7931A, 0.16); g.fillRect((COLS - 2) * TILE - 18, py, 18, TILE);
    }

    // ── Banner text ───────────────────────────────────────────
    this.add.text(COLS * TILE / 2, 16, 'BITCOIN BASICS', {
      fontSize: '9px',
      color: '#F7931A',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 0.5).setDepth(10);

    // Exit label
    this.add.text(EXIT_COL * TILE + TILE / 2, (ROWS - 1) * TILE - 3, 'EXIT', {
      fontSize: '6px',
      color: '#ffb84d',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 1).setDepth(10);
  }

  createTerminals() {
    TRACK1_LESSONS.forEach((lesson, i) => {
      const [col, row] = TERMINALS[i];
      const px = col * TILE; const py = row * TILE;

      const g = this.add.graphics();
      this.terminalGraphics.push(g);
      this.drawTerminal(g, px, py, false);

    });
  }

  drawTerminal(g: Phaser.GameObjects.Graphics, px: number, py: number, completed: boolean) {
    g.clear();

    // ── Floor light pool — large, clearly visible colored pool ──
    if (completed) {
      g.fillStyle(0xF7931A, 0.40); g.fillRect(px - 16, py + 22, TILE + 32, 22);
      g.fillStyle(0xF7931A, 0.20); g.fillRect(px - 28, py + 32, TILE + 56, 20);
    } else {
      g.fillStyle(0x30c870, 0.35); g.fillRect(px - 14, py + 22, TILE + 28, 20);
      g.fillStyle(0x30c870, 0.16); g.fillRect(px - 24, py + 30, TILE + 48, 18);
    }

    // ── Desk surface — clearly visible warm metal ─────────────
    g.fillStyle(0x3e3420);
    g.fillRect(px - 3, py + 22, TILE + 6, 10);
    g.fillStyle(0x504430);
    g.fillRect(px - 3, py + 22, TILE + 6, 2);
    g.fillStyle(completed ? 0xc07028 : 0x3ab870, 0.7);
    g.fillRect(px - 3, py + 31, TILE + 6, 1);

    // Monitor stand
    g.fillStyle(0x3a3022);
    g.fillRect(px + 12, py + 18, 8, 5);
    g.fillStyle(0x4a4030);
    g.fillRect(px + 13, py + 18, 6, 1);

    // Monitor chassis — warm dark metal, clearly visible
    g.fillStyle(0x403828);
    g.fillRect(px - 1, py - 2, TILE + 2, 23);
    g.fillStyle(0x544a36);
    g.fillRect(px - 1, py - 2, TILE + 2, 2);
    g.fillRect(px - 1, py - 2, 2, 23);
    g.fillStyle(0x2e2818);
    g.fillRect(px + TILE - 1, py - 2, 2, 23);

    // Bezel inner
    g.fillStyle(0x302a1c);
    g.fillRect(px, py, TILE, 20);

    // Screen — clearly visible colored glow
    const screenBg = completed ? 0x3c1e08 : 0x0e2c14;
    g.fillStyle(screenBg);
    g.fillRect(px + 2, py + 2, TILE - 4, 15);

    if (completed) {
      g.fillStyle(0xF7931A, 0.40);
      g.fillRect(px + 2, py + 2, TILE - 4, 15);
      // Header bar
      g.fillStyle(0xF7931A);
      g.fillRect(px + 2, py + 2, TILE - 4, 2);
      // ₿ — bright gold on amber
      const bx = px + 9; const by = py + 6;
      g.fillStyle(0xffdd66);
      g.fillRect(bx, by, 2, 9);     g.fillRect(bx + 5, by, 2, 9);
      g.fillRect(bx - 1, by + 1, 9, 2); g.fillRect(bx - 1, by + 4, 9, 2); g.fillRect(bx - 1, by + 8, 9, 2);
      g.fillRect(bx + 1, by + 3, 4, 2); g.fillRect(bx + 1, by + 6, 4, 2);
      // Checkmark
      g.fillStyle(0x60f880);
      g.fillRect(px + TILE - 8, py + 5, 2, 3);
      g.fillRect(px + TILE - 6, py + 7, 2, 2);
      g.fillRect(px + TILE - 4, py + 4, 2, 5);
      g.fillStyle(0xF7931A, 0.30);
      g.fillRect(px + 1, py + 1, 1, 18);
      g.fillRect(px + TILE - 2, py + 1, 1, 18);
    } else {
      // Green text lines — clearly visible bright green
      g.fillStyle(0x50e870);
      g.fillRect(px + 3, py + 4,  16, 1);
      g.fillRect(px + 3, py + 7,  22, 1);
      g.fillRect(px + 3, py + 10, 12, 1);
      g.fillRect(px + 3, py + 13, 18, 1);
      g.fillStyle(0x38a850);
      g.fillRect(px + 3, py + 5,  10, 1);
      g.fillRect(px + 3, py + 9,   6, 1);
      g.fillRect(px + 3, py + 12, 14, 1);
      // Bright cursor block
      g.fillStyle(0x80ff9a);
      g.fillRect(px + 22, py + 13, 4, 2);
      g.fillStyle(0x38a850, 0.25);
      g.fillRect(px + 1, py + 1, 1, 18);
      g.fillRect(px + TILE - 2, py + 1, 1, 18);
    }

    // LED indicators on bezel
    g.fillStyle(0x403828);
    g.fillRect(px + 2, py + 17, TILE - 4, 2);
    g.fillStyle(completed ? 0xF7931A : 0x50e870);
    g.fillRect(px + TILE - 7, py + 17, 3, 2);
    g.fillStyle(completed ? 0x50e870 : 0x287840);
    g.fillRect(px + TILE - 11, py + 17, 3, 2);
  }

  updateTerminals() {
    TRACK1_LESSONS.forEach((lesson, i) => {
      const [col, row] = TERMINALS[i];
      const completed = this.completedLessons.has(lesson.id);
      this.drawTerminal(this.terminalGraphics[i], col * TILE, row * TILE, completed);
    });
    this.updateSenseiState();
  }

  createSensei() {
    const px = SENSEI_COL * TILE; const py = SENSEI_ROW * TILE;

    this.senseiGlow = this.add.graphics();
    this.senseiGlow.setVisible(false);

    this.senseiGraphics = this.add.graphics();
    this.drawSensei(this.senseiGraphics, px + TILE / 2, py + TILE / 2, false);

    this.senseiPrompt = this.add.text(px + TILE / 2, py - 12, '★ CLAIM BADGE ★', {
      fontSize: '7px', color: '#ffcc44',
      fontFamily: '"Press Start 2P", monospace', fontStyle: 'bold',
      backgroundColor: '#000000cc', padding: { x: 5, y: 3 },
    }).setOrigin(0.5, 1).setVisible(false).setDepth(20);
  }

  drawSensei(g: Phaser.GameObjects.Graphics, cx: number, cy: number, active: boolean) {
    g.clear();

    // Ground shadow
    g.fillStyle(0x000000, 0.55);
    g.fillEllipse(cx, cy + 16, 24, 7);

    if (active) {
      // Warm golden aura halos — clearly visible
      g.fillStyle(0xffd700, 0.14); g.fillCircle(cx, cy, 62);
      g.fillStyle(0xF7931A,  0.18); g.fillCircle(cx, cy, 46);
      g.fillStyle(0xffd700,  0.22); g.fillCircle(cx, cy, 32);
      g.fillStyle(0xffcc44,  0.28); g.fillCircle(cx, cy, 20);
    }

    // Robe — clearly visible warm browns
    const robeDeep  = active ? 0x7a4c28 : 0x5a3c20;
    const robeMid   = active ? 0x9a6030 : 0x7a5030;
    const robeFront = active ? 0xba7838 : 0x926040;
    g.fillStyle(robeDeep);  g.fillRect(cx - 10, cy - 10, 20, 26);
    g.fillStyle(robeMid);   g.fillRect(cx - 9,  cy - 9,  18, 24);
    g.fillStyle(robeFront); g.fillRect(cx - 7,  cy - 8,  14, 22);

    // Robe trim
    const trimColor = active ? 0xF7931A : 0xa87030;
    g.fillStyle(trimColor);
    g.fillRect(cx - 7, cy - 8,  2, 22);
    g.fillRect(cx + 5, cy - 8,  2, 22);
    g.fillRect(cx - 7, cy + 12, 14, 2);
    g.fillStyle(active ? 0xffb84d : 0x7a5020);
    g.fillRect(cx - 1, cy - 8, 2, 20); // seam

    // ₿ on chest — warm gold, always visible
    const bx = cx - 4; const by = cy - 6;
    g.fillStyle(active ? 0xffdd66 : 0x8a5c20);
    g.fillRect(bx, by, 2, 8);     g.fillRect(bx + 5, by, 2, 8);
    g.fillRect(bx - 1, by + 1, 9, 2); g.fillRect(bx - 1, by + 4, 9, 2); g.fillRect(bx - 1, by + 7, 9, 2);
    g.fillRect(bx + 1, by + 2, 4, 2); g.fillRect(bx + 1, by + 5, 4, 2);

    // Head — clearly visible warm skin tone
    g.fillStyle(active ? 0xc89060 : 0x9a6840);
    g.fillRect(cx - 5, cy - 22, 10, 12);
    g.fillStyle(active ? 0xa87848 : 0x7a5030);
    g.fillRect(cx - 5, cy - 13, 10, 3);
    g.fillStyle(active ? 0xd8a870 : 0xb08050);
    g.fillRect(cx - 1, cy - 18, 2, 4);

    // Beard — white-gray, clearly visible
    g.fillStyle(active ? 0xf0e8d0 : 0xb0a890);
    g.fillRect(cx - 4, cy - 13, 8, 5);
    g.fillStyle(active ? 0xe0d8b8 : 0x988878);
    g.fillRect(cx - 3, cy - 12, 6, 3);

    // Eyes
    g.fillStyle(active ? 0xffcc44 : 0x6090c0);
    g.fillRect(cx - 4, cy - 19, 2, 2);
    g.fillRect(cx + 2, cy - 19, 2, 2);
    if (active) {
      g.fillStyle(0xffd700, 0.5);
      g.fillRect(cx - 5, cy - 20, 4, 4);
      g.fillRect(cx + 1, cy - 20, 4, 4);
    }
    g.fillStyle(0xffffff);
    g.fillRect(cx - 4, cy - 19, 1, 1);
    g.fillRect(cx + 2, cy - 19, 1, 1);

    // Headband
    g.fillStyle(active ? 0x6a3410 : 0x403018);
    g.fillRect(cx - 5, cy - 25, 10, 5);
    g.fillStyle(active ? 0xF7931A : 0x8a6420);
    g.fillRect(cx - 4, cy - 24, 8, 3);
    g.fillStyle(active ? 0xffdd66 : 0xb08830);
    g.fillRect(cx - 1, cy - 24, 2, 2);

    // ── Staff ──────────────────────────────────────────────────
    g.fillStyle(0x4a3820);
    g.fillRect(cx + 10, cy - 24, 4, 38);
    g.fillStyle(0x5e4c2c);
    g.fillRect(cx + 11, cy - 24, 1, 38);
    if (active) {
      g.fillStyle(0xF7931A, 0.8);
      g.fillRect(cx + 13, cy - 24, 1, 38);
    }

    // Orb housing
    g.fillStyle(active ? 0xa05c18 : 0x5a4020);
    g.fillRect(cx + 8, cy - 30, 10, 10);
    g.fillStyle(active ? 0xF7931A : 0x7a5828);
    g.fillRect(cx + 9, cy - 29, 8, 8);
    g.fillStyle(active ? 0xffdd66 : 0x9a7840);
    g.fillRect(cx + 10, cy - 28, 6, 6);
    if (active) {
      g.fillStyle(0xffffff); g.fillRect(cx + 11, cy - 27, 2, 2);
      g.fillStyle(0xffd700, 0.35); g.fillRect(cx + 5,  cy - 34, 18, 18);
      g.fillStyle(0xF7931A, 0.18); g.fillRect(cx + 2,  cy - 38, 24, 24);
    }
  }

  updateSenseiState() {
    const allDone = TRACK1_LESSONS.every((l) => this.completedLessons.has(l.id));
    const px = SENSEI_COL * TILE; const py = SENSEI_ROW * TILE;
    this.drawSensei(this.senseiGraphics, px + TILE / 2, py + TILE / 2, allDone);

    if (allDone) {
      this.senseiGlow.clear();
      this.senseiGlow.fillStyle(0xffd700, 0.06);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 64);
      this.senseiGlow.fillStyle(0xF7931A, 0.08);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 48);
      this.senseiGlow.fillStyle(0xffd700, 0.12);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 32);
      this.senseiGlow.setVisible(true);
    }
  }

  createPlayer() {
    const px = this.playerGridX * TILE + TILE / 2;
    const py = this.playerGridY * TILE + TILE / 2;
    this.playerContainer = this.add.container(px, py);
    this.playerGraphics = this.add.graphics();
    this.drawPlayer(this.playerGraphics, 0, 0);
    this.playerContainer.add(this.playerGraphics);
    this.playerContainer.setDepth(10);
  }

  drawPlayer(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
    g.clear();

    // Ground shadow
    g.fillStyle(0x000000, 0.55);
    g.fillEllipse(cx, cy + 14, 20, 6);

    // Boots — dark leather, warm highlight on toe
    g.fillStyle(0x28201c);
    g.fillRect(cx - 7, cy + 8, 6, 6);
    g.fillRect(cx + 1, cy + 8, 6, 6);
    g.fillStyle(0x6a4820, 0.8);
    g.fillRect(cx - 7, cy + 8, 6, 1);
    g.fillRect(cx + 1, cy + 8, 6, 1);
    g.fillStyle(0x181410);
    g.fillRect(cx - 8, cy + 13, 7, 1);
    g.fillRect(cx + 1, cy + 13, 7, 1);

    // Legs — dark navy trousers
    g.fillStyle(0x28283c);
    g.fillRect(cx - 6, cy + 1, 5, 8);
    g.fillRect(cx + 1, cy + 1, 5, 8);
    g.fillStyle(0x1e1e30);
    g.fillRect(cx - 5, cy + 3, 1, 5);
    g.fillRect(cx + 4, cy + 3, 1, 5);

    // Belt
    g.fillStyle(0x5a3c18);
    g.fillRect(cx - 7, cy, 14, 3);
    g.fillStyle(0xF7931A);
    g.fillRect(cx - 1, cy + 1, 3, 2);

    // Coat body — layered dark grays with visible structure
    g.fillStyle(0x28263a);
    g.fillRect(cx - 7, cy - 9, 14, 10);
    g.fillStyle(0x34304a);
    g.fillRect(cx - 6, cy - 8, 12, 9);
    // Lapels / center
    g.fillStyle(0x22202e);
    g.fillRect(cx - 3, cy - 8, 6, 9);
    // Amber coat edge — bright standout
    g.fillStyle(0xF7931A);
    g.fillRect(cx + 6, cy - 9, 1, 10);
    g.fillStyle(0xc07028, 0.25);
    g.fillRect(cx - 6, cy - 8, 12, 9);

    // Arms
    g.fillStyle(0x28263a);
    g.fillRect(cx - 9, cy - 8, 3, 9);
    g.fillRect(cx + 6, cy - 8, 3, 9);
    g.fillStyle(0x34304a);
    g.fillRect(cx - 8, cy - 8, 1, 9);
    g.fillRect(cx + 7, cy - 8, 1, 9);
    g.fillStyle(0x1e1c28);
    g.fillRect(cx - 9, cy, 3, 4);
    g.fillRect(cx + 6, cy, 3, 4);

    // Hood outer — deep charcoal
    g.fillStyle(0x22203a);
    g.fillRect(cx - 7, cy - 21, 14, 13);
    // Hood cavity
    g.fillStyle(0x14121e);
    g.fillRect(cx - 5, cy - 19, 10, 10);
    // Face in shadow — warm dark skin just visible
    g.fillStyle(0x5a3c28);
    g.fillRect(cx - 3, cy - 16, 6, 6);

    // Glowing amber eyes — most defined element
    g.fillStyle(0xF7931A, 0.40);
    g.fillRect(cx - 4, cy - 14, 4, 3);
    g.fillRect(cx,     cy - 14, 4, 3);
    g.fillStyle(0xffb84d);
    g.fillRect(cx - 3, cy - 13, 2, 2);
    g.fillRect(cx + 1, cy - 13, 2, 2);
    g.fillStyle(0xfff0c0);
    g.fillRect(cx - 3, cy - 13, 1, 1);
    g.fillRect(cx + 1, cy - 13, 1, 1);
  }

  createUI() {
    this.interactPrompt = this.add.text(0, 0, '▶ Press SPACE', {
      fontSize: '8px', color: '#F7931A',
      fontFamily: '"Press Start 2P", monospace',
      backgroundColor: '#000000dd', padding: { x: 6, y: 3 },
    }).setVisible(false).setDepth(20);

    this.add.text(4, ROWS * TILE - 12, 'SPACE: interact  |  Arrow keys / WASD: move  |  ESC: Classic Mode', {
      fontSize: '7px', color: '#3a4050', fontFamily: 'monospace',
    }).setDepth(20);
  }

  setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.upKey    = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.downKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.leftKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  getAdjacentInteractable(): 'terminal' | 'sensei' | 'exit' | null {
    const px = this.playerGridX; const py = this.playerGridY;
    for (let i = 0; i < TERMINALS.length; i++) {
      const [tc, tr] = TERMINALS[i];
      if (px === tc && py === tr + 1) return 'terminal';
    }
    if (px === SENSEI_COL && py === SENSEI_ROW + 1) return 'sensei';
    if (px === EXIT_COL   && py === EXIT_ROW)        return 'exit';
    return null;
  }

  getTerminalIndexAtPlayer(): number {
    for (let i = 0; i < TERMINALS.length; i++) {
      const [tc, tr] = TERMINALS[i];
      if (this.playerGridX === tc && this.playerGridY === tr + 1) return i;
    }
    return -1;
  }

  update(_time: number, delta: number) {
    if (this.blockInput) return;

    const interactable = this.getAdjacentInteractable();

    if (interactable === 'terminal') {
      const idx = this.getTerminalIndexAtPlayer();
      const lesson = TRACK1_LESSONS[idx];
      const completed = this.completedLessons.has(lesson.id);
      this.interactPrompt
        .setText(completed ? '▶ Review Lesson' : '▶ Press SPACE')
        .setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32)
        .setVisible(true);
      this.senseiPrompt.setVisible(false);
    } else if (interactable === 'sensei') {
      const allDone = TRACK1_LESSONS.every((l) => this.completedLessons.has(l.id));
      this.interactPrompt.setVisible(false);
      this.senseiPrompt.setVisible(allDone);
    } else {
      this.interactPrompt.setVisible(false);
      this.senseiPrompt.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (interactable === 'terminal') {
        const idx = this.getTerminalIndexAtPlayer();
        if (idx >= 0) {
          const lesson = TRACK1_LESSONS[idx];
          EventBus.emit('lessonActivated', { lessonId: lesson.id, lessonTitle: lesson.title, xp: lesson.xp, terminalIndex: idx });
        }
      } else if (interactable === 'sensei') {
        const allDone = TRACK1_LESSONS.every((l) => this.completedLessons.has(l.id));
        EventBus.emit(allDone ? 'awardBadge' : 'senseiMessage', allDone ? undefined : 'Complete all 4 terminals first!');
      } else if (interactable === 'exit') {
        this.exitDojo();
      }
    }

    // Held-key movement (tick timer even while moving)
    let dx = 0, dy = 0;
    if (this.cursors.up!.isDown || this.upKey.isDown) dy = -1;
    else if (this.cursors.down!.isDown || this.downKey.isDown) dy = 1;
    else if (this.cursors.left!.isDown || this.leftKey.isDown) dx = -1;
    else if (this.cursors.right!.isDown || this.rightKey.isDown) dx = 1;

    if (dx !== 0 || dy !== 0) {
      const sameDir = dx === this.lastDx && dy === this.lastDy;
      if (!sameDir) {
        this.lastDx = dx; this.lastDy = dy; this.moveTimer = MOVE_INITIAL_DELAY;
        if (!this.isMoving) this.tryMove(dx, dy);
      } else {
        this.moveTimer -= delta;
        if (this.moveTimer <= 0 && !this.isMoving) { this.moveTimer += MOVE_REPEAT_RATE; this.tryMove(dx, dy); }
      }
    } else {
      this.lastDx = 0; this.lastDy = 0; this.moveTimer = 0;
    }
  }

  tryMove(dx: number, dy: number) {
    const newX = this.playerGridX + dx; const newY = this.playerGridY + dy;
    if (newY < 0 || newY >= ROWS || newX < 0 || newX >= COLS) return;
    const tile = MAP[newY][newX];
    if (tile === 1) return;
    if (TERMINALS.some(([tc, tr]) => tc === newX && tr === newY)) return;
    if (newX === SENSEI_COL && newY === SENSEI_ROW) return;

    this.playerGridX = newX; this.playerGridY = newY; this.isMoving = true;
    AudioManager.playFootstep();

    this.tweens.add({
      targets: this.playerContainer,
      x: newX * TILE + TILE / 2, y: newY * TILE + TILE / 2,
      duration: 140, ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        if (newX === EXIT_COL && newY === EXIT_ROW) this.exitDojo();
      },
    });
  }

  exitDojo() {
    this.blockInput = true;
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.switch('OverworldScene');
    });
  }

  onSetCompletedLessons(ids: string[]) { this.completedLessons = new Set(ids); this.updateTerminals(); }
  onLessonComplete(lessonId: string)   { this.completedLessons.add(lessonId);   this.updateTerminals(); }
  onBlockInput()   { this.blockInput = true;  }
  onUnblockInput() { this.blockInput = false; }

  shutdown() { this.unregisterEventBusListeners(); }
}
