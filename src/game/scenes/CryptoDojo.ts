import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { AudioManager } from '../AudioManager';
import type { LessonInfo } from './DojoScene';

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

// Blue/cyan neon palette
const NEON_BLUE = 0x3B82F6;
const NEON_CYAN = 0x00e5ff;
const NEON_WHITE_BLUE = 0xc0d8ff;

const TRACK2_LESSONS: LessonInfo[] = [
  { id: 'les-2-1-1', title: 'Hash Functions',                xp: 75,  terminalIndex: 0 },
  { id: 'les-2-1-2', title: 'The Blockchain Explained',      xp: 100, terminalIndex: 1 },
  { id: 'les-2-2-1', title: 'Elliptic Curve Cryptography',   xp: 100, terminalIndex: 2 },
  { id: 'les-2-2-2', title: 'Bitcoin Keys & Addresses',      xp: 75,  terminalIndex: 3 },
];

export class CryptoDojo extends Phaser.Scene {
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
  private elapsedTime = 0;
  private dripGraphics!: Phaser.GameObjects.Graphics;

  constructor() { super({ key: 'CryptoDojo' }); }

  create() {
    this.isMoving = false; this.blockInput = false;
    this.lastDx = 0; this.lastDy = 0; this.moveTimer = 0;
    this.elapsedTime = 0;
    this.terminalGraphics = [];
    this.completedLessons = new Set();

    this.drawFloor();
    this.drawWalls();
    this.createTerminals();
    this.createSensei();
    this.createPlayer();
    this.createUI();
    this.setupControls();

    this.dripGraphics = this.add.graphics().setDepth(12);

    this.events.on(Phaser.Scenes.Events.SLEEP, this.onSleep, this);
    this.events.on(Phaser.Scenes.Events.WAKE, this.onWake, this);

    this.registerEventBusListeners();
    AudioManager.setIndoor();
    EventBus.emit('dojoReady');
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  private registerEventBusListeners() {
    EventBus.on('setCompletedLessons', this.onSetCompletedLessons, this);
    EventBus.on('lessonComplete', this.onLessonComplete, this);
    EventBus.on('blockInput', this.onBlockInput, this);
    EventBus.on('unblockInput', this.onUnblockInput, this);
  }

  private unregisterEventBusListeners() {
    EventBus.off('setCompletedLessons', this.onSetCompletedLessons, this);
    EventBus.off('lessonComplete', this.onLessonComplete, this);
    EventBus.off('blockInput', this.onBlockInput, this);
    EventBus.off('unblockInput', this.onUnblockInput, this);
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

  // ── DRAWING ──────────────────────────────────────────────

  drawFloor() {
    const g = this.add.graphics();

    // Base — deep navy void
    g.fillStyle(0x0a1020);
    g.fillRect(0, 0, COLS * TILE, ROWS * TILE);

    // Floor tiles — dark steel with circuit traces
    for (let row = 1; row < ROWS - 1; row++) {
      for (let col = 1; col < COLS - 1; col++) {
        const seed = row * COLS + col;
        const shade = (row + col) % 2 === 0 ? 0x0e1830 : 0x0c1628;
        g.fillStyle(shade);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);

        // Circuit trace patterns — thin blue lines
        g.fillStyle(NEON_BLUE, 0.06);
        if (seed % 3 === 0) {
          g.fillRect(col * TILE, row * TILE + 15, TILE, 1);
        }
        if (seed % 5 === 1) {
          g.fillRect(col * TILE + 15, row * TILE, 1, TILE);
        }
        // Circuit node dots at intersections
        if (seed % 7 === 3) {
          g.fillStyle(NEON_CYAN, 0.1);
          g.fillRect(col * TILE + 14, row * TILE + 14, 3, 3);
        }
      }
    }

    // Floor neon strip grid — glowing blue lines embedded in floor
    g.fillStyle(NEON_BLUE, 0.08);
    for (let row = 1; row <= ROWS - 1; row++) {
      g.fillRect(TILE, row * TILE, (COLS - 2) * TILE, 1);
    }
    for (let col = 1; col <= COLS - 1; col++) {
      g.fillRect(col * TILE, TILE, 1, (ROWS - 2) * TILE);
    }

    // ── Central holographic projection zone ──────────────
    const haloX = 5 * TILE;
    const haloY = 6 * TILE;
    const haloW = 10 * TILE;
    const haloH = 6 * TILE;

    // Dark zone beneath projection
    g.fillStyle(0x081428);
    g.fillRect(haloX, haloY, haloW, haloH);

    // Glowing floor border — blue neon
    g.fillStyle(NEON_BLUE, 0.6);
    g.fillRect(haloX, haloY, haloW, 2);
    g.fillRect(haloX, haloY + haloH - 2, haloW, 2);
    g.fillRect(haloX, haloY, 2, haloH);
    g.fillRect(haloX + haloW - 2, haloY, 2, haloH);

    // Corner brackets — bright cyan
    g.fillStyle(NEON_CYAN, 0.8);
    g.fillRect(haloX, haloY, 12, 2); g.fillRect(haloX, haloY, 2, 12);
    g.fillRect(haloX + haloW - 12, haloY, 12, 2); g.fillRect(haloX + haloW - 2, haloY, 2, 12);
    g.fillRect(haloX, haloY + haloH - 2, 12, 2); g.fillRect(haloX, haloY + haloH - 12, 2, 12);
    g.fillRect(haloX + haloW - 12, haloY + haloH - 2, 12, 2); g.fillRect(haloX + haloW - 2, haloY + haloH - 12, 2, 12);

    // Inner glow
    g.fillStyle(NEON_BLUE, 0.04);
    g.fillRect(haloX + 4, haloY + 4, haloW - 8, haloH - 8);

    // Holographic hash symbol (# for crypto/hash)
    const hx = COLS / 2 * TILE - 10;
    const hy = haloY + haloH / 2 - 14;
    g.fillStyle(NEON_CYAN, 0.2);
    // Vertical bars
    g.fillRect(hx + 4, hy, 3, 28);
    g.fillRect(hx + 14, hy, 3, 28);
    // Horizontal bars
    g.fillRect(hx, hy + 6, 22, 3);
    g.fillRect(hx, hy + 16, 22, 3);

    // Scanline overlay on projection zone
    g.fillStyle(0x000000, 0.05);
    for (let sy = 0; sy < haloH; sy += 3) {
      g.fillRect(haloX, haloY + sy, haloW, 1);
    }

    // Exit tile — blue glow
    g.fillStyle(NEON_BLUE, 0.30);
    g.fillRect(EXIT_COL * TILE, EXIT_ROW * TILE, TILE, TILE);
    g.fillStyle(NEON_BLUE, 0.12);
    g.fillRect(EXIT_COL * TILE - 4, EXIT_ROW * TILE - 8, TILE + 8, TILE + 8);
  }

  drawWalls() {
    const g = this.add.graphics();

    // ── Top wall — dark steel panels with blue accents ──
    g.fillStyle(0x101828);
    g.fillRect(0, 0, COLS * TILE, TILE);
    g.fillStyle(0x0c1220);
    g.fillRect(0, 0, COLS * TILE, TILE - 2);

    // Exposed conduit/cable lines across top
    g.fillStyle(0x182040);
    g.fillRect(0, 8, COLS * TILE, 2);
    g.fillRect(0, 20, COLS * TILE, 1);

    // Blue neon accent strip at base of top wall
    g.fillStyle(NEON_BLUE);
    g.fillRect(0, TILE - 2, COLS * TILE, 2);
    g.fillStyle(NEON_BLUE, 0.15);
    g.fillRect(0, TILE - 10, COLS * TILE, 8);

    // ── Side walls ──
    for (let row = 1; row < ROWS - 1; row++) {
      const py = row * TILE;

      // Left wall — dark steel
      g.fillStyle(0x101828); g.fillRect(0, py, TILE, TILE);
      g.fillStyle(0x0c1220); g.fillRect(0, py, TILE - 2, TILE);
      // Horizontal panel seam
      g.fillStyle(0x182040); g.fillRect(2, py + TILE / 2, TILE - 6, 1);
      // Blue neon inner edge
      g.fillStyle(NEON_BLUE, 0.7); g.fillRect(TILE - 2, py, 2, TILE);
      g.fillStyle(NEON_BLUE, 0.08); g.fillRect(TILE - 10, py, 8, TILE);

      // Server rack LEDs on left wall (rows 2-12)
      if (row >= 2 && row <= 12 && row % 2 === 0) {
        const seed = row * 7;
        for (let i = 0; i < 4; i++) {
          const ledColor = (seed + i) % 3 === 0 ? NEON_CYAN : (seed + i) % 3 === 1 ? NEON_BLUE : 0x40ff80;
          g.fillStyle(ledColor, 0.7);
          g.fillRect(6, py + 6 + i * 6, 3, 2);
          g.fillStyle(ledColor, 0.15);
          g.fillRect(4, py + 4 + i * 6, 7, 6);
        }
      }

      // Right wall
      g.fillStyle(0x101828); g.fillRect((COLS - 1) * TILE, py, TILE, TILE);
      g.fillStyle(0x0c1220); g.fillRect((COLS - 1) * TILE + 2, py, TILE - 2, TILE);
      g.fillStyle(0x182040); g.fillRect((COLS - 1) * TILE + 4, py + TILE / 2, TILE - 6, 1);
      g.fillStyle(NEON_BLUE, 0.7); g.fillRect((COLS - 1) * TILE, py, 2, TILE);
      g.fillStyle(NEON_BLUE, 0.08); g.fillRect((COLS - 1) * TILE, py, 8, TILE);

      // Server rack LEDs on right wall
      if (row >= 2 && row <= 12 && row % 2 === 1) {
        const seed = row * 11;
        for (let i = 0; i < 4; i++) {
          const ledColor = (seed + i) % 3 === 0 ? NEON_CYAN : (seed + i) % 3 === 1 ? NEON_BLUE : 0x40ff80;
          g.fillStyle(ledColor, 0.7);
          g.fillRect((COLS - 1) * TILE + TILE - 9, py + 6 + i * 6, 3, 2);
          g.fillStyle(ledColor, 0.15);
          g.fillRect((COLS - 1) * TILE + TILE - 11, py + 4 + i * 6, 7, 6);
        }
      }
    }

    // ── Bottom wall ──
    for (let col = 0; col < COLS; col++) {
      if (col === EXIT_COL) continue;
      const px = col * TILE; const py = (ROWS - 1) * TILE;
      g.fillStyle(0x101828); g.fillRect(px, py, TILE, TILE);
      g.fillStyle(0x0c1220); g.fillRect(px + 2, py + 2, TILE - 4, TILE);
      g.fillStyle(0x182040); g.fillRect(px + 2, py + TILE / 3, TILE - 4, 1);
      g.fillStyle(NEON_BLUE, 0.5); g.fillRect(px, py, TILE, 2);
    }

    // ── Exit door — blue neon portal ──
    const epx = EXIT_COL * TILE;
    const epy = (ROWS - 1) * TILE;
    g.fillStyle(0x081428); g.fillRect(epx, epy, TILE, TILE);
    g.fillStyle(0x0c1e3c); g.fillRect(epx + 2, epy, TILE - 4, TILE);
    g.fillStyle(0x102850); g.fillRect(epx + 4, epy, TILE - 8, TILE);
    g.fillStyle(0x183870); g.fillRect(epx + 6, epy, TILE - 12, TILE);
    g.fillStyle(0x2050a0); g.fillRect(epx + 8, epy, TILE - 16, TILE);
    // Scanlines
    g.fillStyle(0x000000, 0.12);
    for (let sl = 0; sl < TILE; sl += 3) g.fillRect(epx + 4, epy + sl, TILE - 8, 1);
    // Blue neon frame
    g.fillStyle(NEON_BLUE);
    g.fillRect(epx + 2, epy, 2, TILE);
    g.fillRect(epx + TILE - 4, epy, 2, TILE);
    g.fillRect(epx, epy, TILE, 2);
    g.fillStyle(NEON_BLUE, 0.15);
    g.fillRect(epx - 8, epy - 6, TILE + 16, TILE + 6);

    // ── Pillars with exposed cables ──
    for (let r = 2; r <= 14; r += 3) {
      const py = r * TILE;
      // Left pillar
      g.fillStyle(0x182848); g.fillRect(TILE + 2, py + 2, 12, TILE - 4);
      g.fillStyle(0x142040); g.fillRect(TILE + 3, py + 3, 10, TILE - 6);
      g.fillStyle(NEON_BLUE); g.fillRect(TILE + 2, py + 2, 2, TILE - 4);
      g.fillStyle(NEON_BLUE, 0.12); g.fillRect(TILE, py, 18, TILE);
      // Cable on pillar
      g.fillStyle(NEON_CYAN, 0.3); g.fillRect(TILE + 12, py + 4, 1, TILE - 8);

      // Right pillar
      g.fillStyle(0x182848); g.fillRect((COLS - 2) * TILE - 14, py + 2, 12, TILE - 4);
      g.fillStyle(0x142040); g.fillRect((COLS - 2) * TILE - 13, py + 3, 10, TILE - 6);
      g.fillStyle(NEON_BLUE); g.fillRect((COLS - 2) * TILE - 2, py + 2, 2, TILE - 4);
      g.fillStyle(NEON_BLUE, 0.12); g.fillRect((COLS - 2) * TILE - 18, py, 18, TILE);
      g.fillStyle(NEON_CYAN, 0.3); g.fillRect((COLS - 2) * TILE - 13, py + 4, 1, TILE - 8);
    }

    // ── Ventilation grates on ceiling (top wall) ──
    for (let col = 3; col < COLS - 3; col += 4) {
      g.fillStyle(0x0a1020); g.fillRect(col * TILE + 4, 4, TILE - 8, 18);
      g.fillStyle(0x141e30);
      for (let i = 0; i < 5; i++) {
        g.fillRect(col * TILE + 6, 6 + i * 3, TILE - 12, 1);
      }
    }

    // ── Banner text ──
    this.add.text(COLS * TILE / 2, 16, 'THE TECHNOLOGY', {
      fontSize: '9px', color: '#3B82F6',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 0.5).setDepth(10);

    // Exit label
    this.add.text(EXIT_COL * TILE + TILE / 2, (ROWS - 1) * TILE - 3, 'EXIT', {
      fontSize: '6px', color: '#6090ff',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 1).setDepth(10);
  }

  // ── TERMINALS ──────────────────────────────────────────

  createTerminals() {
    TRACK2_LESSONS.forEach((lesson, i) => {
      const [col, row] = TERMINALS[i];
      const px = col * TILE; const py = row * TILE;

      const g = this.add.graphics();
      this.terminalGraphics.push(g);
      this.drawTerminal(g, px, py, false);

    });
  }

  drawTerminal(g: Phaser.GameObjects.Graphics, px: number, py: number, completed: boolean) {
    g.clear();

    // Floor light pool — holographic blue/cyan
    if (completed) {
      g.fillStyle(NEON_BLUE, 0.35); g.fillRect(px - 16, py + 22, TILE + 32, 22);
      g.fillStyle(NEON_BLUE, 0.18); g.fillRect(px - 28, py + 32, TILE + 56, 20);
    } else {
      g.fillStyle(NEON_CYAN, 0.30); g.fillRect(px - 14, py + 22, TILE + 28, 20);
      g.fillStyle(NEON_CYAN, 0.14); g.fillRect(px - 24, py + 30, TILE + 48, 18);
    }

    // Desk — dark metal
    g.fillStyle(0x141e30);
    g.fillRect(px - 3, py + 22, TILE + 6, 10);
    g.fillStyle(0x1c2840);
    g.fillRect(px - 3, py + 22, TILE + 6, 2);
    g.fillStyle(completed ? NEON_BLUE : NEON_CYAN, 0.5);
    g.fillRect(px - 3, py + 31, TILE + 6, 1);

    // Monitor stand
    g.fillStyle(0x141e30);
    g.fillRect(px + 12, py + 18, 8, 5);
    g.fillStyle(0x1c2840);
    g.fillRect(px + 13, py + 18, 6, 1);

    // Monitor chassis — dark steel
    g.fillStyle(0x141e30);
    g.fillRect(px - 1, py - 2, TILE + 2, 23);
    g.fillStyle(0x1c2840);
    g.fillRect(px - 1, py - 2, TILE + 2, 2);
    g.fillRect(px - 1, py - 2, 2, 23);
    g.fillStyle(0x0c1220);
    g.fillRect(px + TILE - 1, py - 2, 2, 23);

    // Bezel
    g.fillStyle(0x101828);
    g.fillRect(px, py, TILE, 20);

    // Screen
    const screenBg = completed ? 0x0c1838 : 0x081828;
    g.fillStyle(screenBg);
    g.fillRect(px + 2, py + 2, TILE - 4, 15);

    if (completed) {
      g.fillStyle(NEON_BLUE, 0.35);
      g.fillRect(px + 2, py + 2, TILE - 4, 15);
      // Header bar
      g.fillStyle(NEON_BLUE);
      g.fillRect(px + 2, py + 2, TILE - 4, 2);
      // Lock symbol — completed crypto lesson
      const bx = px + 10; const by = py + 5;
      g.fillStyle(NEON_WHITE_BLUE);
      g.fillRect(bx + 2, by, 6, 4); // shackle
      g.fillRect(bx + 1, by + 3, 8, 6); // body
      g.fillStyle(NEON_BLUE);
      g.fillRect(bx + 3, by + 1, 4, 2); // inner shackle
      g.fillRect(bx + 4, by + 5, 2, 3); // keyhole
      // Checkmark
      g.fillStyle(0x60f880);
      g.fillRect(px + TILE - 8, py + 5, 2, 3);
      g.fillRect(px + TILE - 6, py + 7, 2, 2);
      g.fillRect(px + TILE - 4, py + 4, 2, 5);
    } else {
      // Cyan code/hash lines
      g.fillStyle(NEON_CYAN);
      g.fillRect(px + 3, py + 4, 16, 1);
      g.fillRect(px + 3, py + 7, 22, 1);
      g.fillRect(px + 3, py + 10, 12, 1);
      g.fillRect(px + 3, py + 13, 18, 1);
      g.fillStyle(0x2080c0);
      g.fillRect(px + 3, py + 5, 10, 1);
      g.fillRect(px + 3, py + 9, 6, 1);
      g.fillRect(px + 3, py + 12, 14, 1);
      // Cursor
      g.fillStyle(0x80ddff);
      g.fillRect(px + 22, py + 13, 4, 2);
    }

    // LED indicators
    g.fillStyle(0x141e30);
    g.fillRect(px + 2, py + 17, TILE - 4, 2);
    g.fillStyle(completed ? NEON_BLUE : NEON_CYAN);
    g.fillRect(px + TILE - 7, py + 17, 3, 2);
    g.fillStyle(completed ? NEON_CYAN : 0x204860);
    g.fillRect(px + TILE - 11, py + 17, 3, 2);
  }

  updateTerminals() {
    TRACK2_LESSONS.forEach((lesson, i) => {
      const [col, row] = TERMINALS[i];
      const completed = this.completedLessons.has(lesson.id);
      this.drawTerminal(this.terminalGraphics[i], col * TILE, row * TILE, completed);
    });
    this.updateSenseiState();
  }

  // ── SENSEI (Cipher Master) ─────────────────────────────

  createSensei() {
    const px = SENSEI_COL * TILE; const py = SENSEI_ROW * TILE;

    this.senseiGlow = this.add.graphics();
    this.senseiGlow.setVisible(false);

    this.senseiGraphics = this.add.graphics();
    this.drawSensei(this.senseiGraphics, px + TILE / 2, py + TILE / 2, false);

    this.senseiPrompt = this.add.text(px + TILE / 2, py - 12, '★ CLAIM BADGE ★', {
      fontSize: '7px', color: '#60aaff',
      fontFamily: '"Press Start 2P", monospace', fontStyle: 'bold',
      backgroundColor: '#000000cc', padding: { x: 5, y: 3 },
    }).setOrigin(0.5, 1).setVisible(false).setDepth(20);
  }

  drawSensei(g: Phaser.GameObjects.Graphics, cx: number, cy: number, active: boolean) {
    g.clear();

    // Shadow
    g.fillStyle(0x000000, 0.55);
    g.fillEllipse(cx, cy + 16, 24, 7);

    if (active) {
      // Blue/cyan aura halos
      g.fillStyle(NEON_CYAN, 0.10); g.fillCircle(cx, cy, 62);
      g.fillStyle(NEON_BLUE, 0.14); g.fillCircle(cx, cy, 46);
      g.fillStyle(NEON_CYAN, 0.18); g.fillCircle(cx, cy, 32);
      g.fillStyle(NEON_WHITE_BLUE, 0.22); g.fillCircle(cx, cy, 20);
    }

    // Robe — deep indigo/blue
    const robeDeep  = active ? 0x1a2860 : 0x101840;
    const robeMid   = active ? 0x203470 : 0x182050;
    const robeFront = active ? 0x2840a0 : 0x1c2860;
    g.fillStyle(robeDeep);  g.fillRect(cx - 10, cy - 10, 20, 26);
    g.fillStyle(robeMid);   g.fillRect(cx - 9, cy - 9, 18, 24);
    g.fillStyle(robeFront); g.fillRect(cx - 7, cy - 8, 14, 22);

    // Digital rune patterns on robe
    g.fillStyle(NEON_CYAN, active ? 0.4 : 0.15);
    g.fillRect(cx - 5, cy - 4, 2, 2);
    g.fillRect(cx + 3, cy - 2, 2, 2);
    g.fillRect(cx - 3, cy + 4, 2, 2);
    g.fillRect(cx + 1, cy + 8, 2, 2);

    // Robe trim — blue neon
    const trimColor = active ? NEON_BLUE : 0x2040a0;
    g.fillStyle(trimColor);
    g.fillRect(cx - 7, cy - 8, 2, 22);
    g.fillRect(cx + 5, cy - 8, 2, 22);
    g.fillRect(cx - 7, cy + 12, 14, 2);
    g.fillStyle(active ? NEON_CYAN : 0x182860);
    g.fillRect(cx - 1, cy - 8, 2, 20);

    // Hash # on chest
    const bx = cx - 4; const by = cy - 6;
    g.fillStyle(active ? NEON_WHITE_BLUE : 0x3050a0);
    g.fillRect(bx + 1, by, 1, 8); g.fillRect(bx + 5, by, 1, 8);
    g.fillRect(bx - 1, by + 2, 9, 1); g.fillRect(bx - 1, by + 5, 9, 1);

    // Head
    g.fillStyle(active ? 0x90a0c0 : 0x607090);
    g.fillRect(cx - 5, cy - 22, 10, 12);
    g.fillStyle(active ? 0x7888a8 : 0x506080);
    g.fillRect(cx - 5, cy - 13, 10, 3);

    // Chin detail
    g.fillStyle(active ? 0xa0b0d0 : 0x708098);
    g.fillRect(cx - 1, cy - 18, 2, 4);

    // Digital beard — glowing dots
    g.fillStyle(active ? NEON_CYAN : 0x405878);
    g.fillRect(cx - 4, cy - 13, 8, 5);
    g.fillStyle(active ? NEON_WHITE_BLUE : 0x506888);
    for (let i = 0; i < 4; i++) {
      g.fillRect(cx - 3 + i * 2, cy - 12, 1, 3);
    }

    // Eyes — blue/cyan glow
    g.fillStyle(active ? NEON_CYAN : 0x4080c0);
    g.fillRect(cx - 4, cy - 19, 2, 2);
    g.fillRect(cx + 2, cy - 19, 2, 2);
    if (active) {
      g.fillStyle(NEON_CYAN, 0.5);
      g.fillRect(cx - 5, cy - 20, 4, 4);
      g.fillRect(cx + 1, cy - 20, 4, 4);
    }
    g.fillStyle(0xffffff);
    g.fillRect(cx - 4, cy - 19, 1, 1);
    g.fillRect(cx + 2, cy - 19, 1, 1);

    // Headband — dark with blue gem
    g.fillStyle(active ? 0x101840 : 0x0c1030);
    g.fillRect(cx - 5, cy - 25, 10, 5);
    g.fillStyle(active ? NEON_BLUE : 0x2040a0);
    g.fillRect(cx - 4, cy - 24, 8, 3);
    g.fillStyle(active ? NEON_CYAN : 0x3060c0);
    g.fillRect(cx - 1, cy - 24, 2, 2);

    // Staff — dark with blue orb
    g.fillStyle(0x1c2840);
    g.fillRect(cx + 10, cy - 24, 4, 38);
    g.fillStyle(0x243050);
    g.fillRect(cx + 11, cy - 24, 1, 38);
    if (active) {
      g.fillStyle(NEON_BLUE, 0.6);
      g.fillRect(cx + 13, cy - 24, 1, 38);
    }

    // Orb housing
    g.fillStyle(active ? 0x1a3080 : 0x102060);
    g.fillRect(cx + 8, cy - 30, 10, 10);
    g.fillStyle(active ? NEON_BLUE : 0x2040a0);
    g.fillRect(cx + 9, cy - 29, 8, 8);
    g.fillStyle(active ? NEON_CYAN : 0x3060c0);
    g.fillRect(cx + 10, cy - 28, 6, 6);
    if (active) {
      g.fillStyle(0xffffff); g.fillRect(cx + 11, cy - 27, 2, 2);
      g.fillStyle(NEON_CYAN, 0.30); g.fillRect(cx + 5, cy - 34, 18, 18);
      g.fillStyle(NEON_BLUE, 0.15); g.fillRect(cx + 2, cy - 38, 24, 24);
    }
  }

  updateSenseiState() {
    const allDone = TRACK2_LESSONS.every((l) => this.completedLessons.has(l.id));
    const px = SENSEI_COL * TILE; const py = SENSEI_ROW * TILE;
    this.drawSensei(this.senseiGraphics, px + TILE / 2, py + TILE / 2, allDone);

    if (allDone) {
      this.senseiGlow.clear();
      this.senseiGlow.fillStyle(NEON_CYAN, 0.06);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 64);
      this.senseiGlow.fillStyle(NEON_BLUE, 0.08);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 48);
      this.senseiGlow.fillStyle(NEON_CYAN, 0.12);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 32);
      this.senseiGlow.setVisible(true);
    }
  }

  // ── PLAYER ─────────────────────────────────────────────

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

    g.fillStyle(0x000000, 0.55); g.fillEllipse(cx, cy + 14, 20, 6);

    // Boots with blue reflection
    g.fillStyle(0x0c1018); g.fillRect(cx - 7, cy + 8, 6, 6); g.fillRect(cx + 1, cy + 8, 6, 6);
    g.fillStyle(NEON_BLUE, 0.3); g.fillRect(cx - 7, cy + 8, 6, 1); g.fillRect(cx + 1, cy + 8, 6, 1);
    g.fillStyle(0x0a0e14); g.fillRect(cx - 8, cy + 13, 7, 1); g.fillRect(cx + 1, cy + 13, 7, 1);

    // Legs
    g.fillStyle(0x181e2c); g.fillRect(cx - 6, cy + 1, 5, 8); g.fillRect(cx + 1, cy + 1, 5, 8);

    // Belt
    g.fillStyle(0x1c2840); g.fillRect(cx - 7, cy, 14, 3);
    g.fillStyle(NEON_BLUE); g.fillRect(cx - 1, cy + 1, 3, 2);

    // Coat — dark blue-gray
    g.fillStyle(0x141c2c); g.fillRect(cx - 7, cy - 9, 14, 10);
    g.fillStyle(0x1c2438); g.fillRect(cx - 6, cy - 8, 12, 9);
    g.fillStyle(0x121828); g.fillRect(cx - 3, cy - 8, 6, 9);
    // Blue neon coat edge
    g.fillStyle(NEON_BLUE); g.fillRect(cx + 6, cy - 9, 1, 10);
    g.fillStyle(NEON_BLUE, 0.15); g.fillRect(cx - 6, cy - 8, 12, 9);

    // Arms
    g.fillStyle(0x141c2c); g.fillRect(cx - 9, cy - 8, 3, 9); g.fillRect(cx + 6, cy - 8, 3, 9);

    // Hood
    g.fillStyle(0x121828); g.fillRect(cx - 7, cy - 21, 14, 13);
    g.fillStyle(0x0c1018); g.fillRect(cx - 5, cy - 19, 10, 10);
    g.fillStyle(0x3c2828); g.fillRect(cx - 3, cy - 16, 6, 6);

    // Glowing blue eyes
    g.fillStyle(NEON_BLUE, 0.40);
    g.fillRect(cx - 4, cy - 14, 4, 3); g.fillRect(cx, cy - 14, 4, 3);
    g.fillStyle(NEON_CYAN);
    g.fillRect(cx - 3, cy - 13, 2, 2); g.fillRect(cx + 1, cy - 13, 2, 2);
    g.fillStyle(0xffffff);
    g.fillRect(cx - 3, cy - 13, 1, 1); g.fillRect(cx + 1, cy - 13, 1, 1);
  }

  // ── UI ─────────────────────────────────────────────────

  createUI() {
    this.interactPrompt = this.add.text(0, 0, '▶ Press SPACE', {
      fontSize: '8px', color: '#3B82F6',
      fontFamily: '"Press Start 2P", monospace',
      backgroundColor: '#000000dd', padding: { x: 6, y: 3 },
    }).setVisible(false).setDepth(20);

    this.add.text(4, ROWS * TILE - 12, 'SPACE: interact  |  Arrow keys / WASD: move  |  ESC: Classic Mode', {
      fontSize: '7px', color: '#1a2848', fontFamily: 'monospace',
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

  // ── GAME LOOP ──────────────────────────────────────────

  getAdjacentInteractable(): 'terminal' | 'sensei' | 'exit' | null {
    const px = this.playerGridX; const py = this.playerGridY;
    for (let i = 0; i < TERMINALS.length; i++) {
      const [tc, tr] = TERMINALS[i];
      if (px === tc && py === tr + 1) return 'terminal';
    }
    if (px === SENSEI_COL && py === SENSEI_ROW + 1) return 'sensei';
    if (px === EXIT_COL && py === EXIT_ROW) return 'exit';
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

    this.elapsedTime += delta / 1000;

    // Animated ceiling drips
    this.updateDrips();

    const interactable = this.getAdjacentInteractable();

    if (interactable === 'terminal') {
      const idx = this.getTerminalIndexAtPlayer();
      const lesson = TRACK2_LESSONS[idx];
      const completed = this.completedLessons.has(lesson.id);
      this.interactPrompt
        .setText(completed ? '▶ Review Lesson' : '▶ Press SPACE')
        .setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32)
        .setVisible(true);
      this.senseiPrompt.setVisible(false);
    } else if (interactable === 'sensei') {
      const allDone = TRACK2_LESSONS.every((l) => this.completedLessons.has(l.id));
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
          const lesson = TRACK2_LESSONS[idx];
          EventBus.emit('lessonActivated', { lessonId: lesson.id, lessonTitle: lesson.title, xp: lesson.xp, terminalIndex: idx });
        }
      } else if (interactable === 'sensei') {
        const allDone = TRACK2_LESSONS.every((l) => this.completedLessons.has(l.id));
        EventBus.emit(allDone ? 'awardBadge' : 'senseiMessage', allDone ? 'tech-complete' : 'Complete all 4 terminals first!');
      } else if (interactable === 'exit') {
        this.exitDojo();
      }
    }

    // Movement
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

  updateDrips() {
    const dg = this.dripGraphics;
    dg.clear();

    // Animated water drips from ceiling vents
    const dripPositions = [3, 7, 11, 15];
    for (const col of dripPositions) {
      const phase = (this.elapsedTime * 1.2 + col * 0.7) % 2;
      if (phase < 1.2) {
        const dropY = TILE + phase * (TILE * 2);
        const alpha = 1 - phase / 1.2;
        dg.fillStyle(NEON_CYAN, 0.3 * alpha);
        dg.fillRect(col * TILE + 15, dropY, 2, 4);
        dg.fillStyle(NEON_CYAN, 0.1 * alpha);
        dg.fillRect(col * TILE + 14, dropY + 1, 4, 2);
      }
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
