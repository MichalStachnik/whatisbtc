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

// Green neon palette
const NEON_GREEN = 0x22c55e;
const NEON_LIME = 0x00ff88;
const NEON_WHITE_GREEN = 0xb0ffd0;

const TRACK3_LESSONS: LessonInfo[] = [
  { id: 'les-3-1-1', title: 'Private Keys & Addresses',     xp: 75,  terminalIndex: 0 },
  { id: 'les-3-1-2', title: 'Types of Wallets',             xp: 50,  terminalIndex: 1 },
  { id: 'les-3-2-1', title: 'How Transactions Work',        xp: 100, terminalIndex: 2 },
  { id: 'les-3-2-2', title: 'Satoshi & Dollar Calculator',  xp: 50,  terminalIndex: 3 },
];

export class PracticalDojo extends Phaser.Scene {
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
  private tickerGraphics!: Phaser.GameObjects.Graphics;

  constructor() { super({ key: 'PracticalDojo' }); }

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

    this.tickerGraphics = this.add.graphics().setDepth(12);

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

    // Base — deep dark green-black
    g.fillStyle(0x081408);
    g.fillRect(0, 0, COLS * TILE, ROWS * TILE);

    // Floor tiles — dark with green market grid
    for (let row = 1; row < ROWS - 1; row++) {
      for (let col = 1; col < COLS - 1; col++) {
        const seed = row * COLS + col;
        const shade = (row + col) % 2 === 0 ? 0x0c1c10 : 0x0a1a0e;
        g.fillStyle(shade);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);

        // Market floor pattern — subtle green lines like a trading floor
        g.fillStyle(NEON_GREEN, 0.05);
        if (seed % 4 === 0) {
          g.fillRect(col * TILE, row * TILE + 15, TILE, 1);
        }
        if (seed % 6 === 1) {
          g.fillRect(col * TILE + 15, row * TILE, 1, TILE);
        }
        // ₿ watermark dots
        if (seed % 9 === 4) {
          g.fillStyle(NEON_GREEN, 0.06);
          g.fillRect(col * TILE + 12, row * TILE + 12, 4, 4);
        }
      }
    }

    // Floor grid lines — green neon
    g.fillStyle(NEON_GREEN, 0.06);
    for (let row = 1; row <= ROWS - 1; row++) {
      g.fillRect(TILE, row * TILE, (COLS - 2) * TILE, 1);
    }
    for (let col = 1; col <= COLS - 1; col++) {
      g.fillRect(col * TILE, TILE, 1, (ROWS - 2) * TILE);
    }

    // ── Central trading desk / price display zone ──────
    const haloX = 5 * TILE;
    const haloY = 6 * TILE;
    const haloW = 10 * TILE;
    const haloH = 6 * TILE;

    // Dark zone beneath display
    g.fillStyle(0x081c0c);
    g.fillRect(haloX, haloY, haloW, haloH);

    // Glowing floor border — green neon
    g.fillStyle(NEON_GREEN, 0.5);
    g.fillRect(haloX, haloY, haloW, 2);
    g.fillRect(haloX, haloY + haloH - 2, haloW, 2);
    g.fillRect(haloX, haloY, 2, haloH);
    g.fillRect(haloX + haloW - 2, haloY, 2, haloH);

    // Corner brackets — bright lime
    g.fillStyle(NEON_LIME, 0.7);
    g.fillRect(haloX, haloY, 12, 2); g.fillRect(haloX, haloY, 2, 12);
    g.fillRect(haloX + haloW - 12, haloY, 12, 2); g.fillRect(haloX + haloW - 2, haloY, 2, 12);
    g.fillRect(haloX, haloY + haloH - 2, 12, 2); g.fillRect(haloX, haloY + haloH - 12, 2, 12);
    g.fillRect(haloX + haloW - 12, haloY + haloH - 2, 12, 2); g.fillRect(haloX + haloW - 2, haloY + haloH - 12, 2, 12);

    // Inner glow
    g.fillStyle(NEON_GREEN, 0.03);
    g.fillRect(haloX + 4, haloY + 4, haloW - 8, haloH - 8);

    // Holographic ₿ symbol in center
    const bx = COLS / 2 * TILE - 8;
    const by = haloY + haloH / 2 - 14;
    g.fillStyle(NEON_GREEN, 0.18);
    // ₿ vertical bars
    g.fillRect(bx + 4, by, 3, 28);
    g.fillRect(bx + 10, by + 2, 3, 24);
    // ₿ horizontal strokes
    g.fillRect(bx + 2, by + 4, 14, 3);
    g.fillRect(bx + 2, by + 12, 14, 3);
    g.fillRect(bx + 2, by + 20, 14, 3);
    // ₿ curves (approximated with rects)
    g.fillRect(bx + 14, by + 6, 3, 7);
    g.fillRect(bx + 14, by + 14, 3, 7);

    // Candlestick chart pattern in the display zone
    const chartY = haloY + 20;
    const bars = [12, 18, 14, 22, 16, 20, 24, 18, 26, 20, 16, 22, 28, 24];
    for (let i = 0; i < bars.length; i++) {
      const cx = haloX + 16 + i * 20;
      const h = bars[i];
      const isGreen = i % 3 !== 1;
      g.fillStyle(isGreen ? NEON_GREEN : 0xff4444, 0.08);
      g.fillRect(cx, chartY + (30 - h), 4, h);
      // Wick
      g.fillStyle(isGreen ? NEON_GREEN : 0xff4444, 0.05);
      g.fillRect(cx + 1, chartY + (30 - h) - 4, 2, h + 8);
    }

    // Scanline overlay
    g.fillStyle(0x000000, 0.04);
    for (let sy = 0; sy < haloH; sy += 3) {
      g.fillRect(haloX, haloY + sy, haloW, 1);
    }

    // Exit tile — green glow
    g.fillStyle(NEON_GREEN, 0.30);
    g.fillRect(EXIT_COL * TILE, EXIT_ROW * TILE, TILE, TILE);
    g.fillStyle(NEON_GREEN, 0.12);
    g.fillRect(EXIT_COL * TILE - 4, EXIT_ROW * TILE - 8, TILE + 8, TILE + 8);
  }

  drawWalls() {
    const g = this.add.graphics();

    // ── Top wall — market display panels ──
    g.fillStyle(0x0c1810);
    g.fillRect(0, 0, COLS * TILE, TILE);
    g.fillStyle(0x0a140c);
    g.fillRect(0, 0, COLS * TILE, TILE - 2);

    // Market display bar across top
    g.fillStyle(0x102818);
    g.fillRect(0, 6, COLS * TILE, 3);
    g.fillRect(0, 18, COLS * TILE, 2);

    // Green neon accent strip
    g.fillStyle(NEON_GREEN);
    g.fillRect(0, TILE - 2, COLS * TILE, 2);
    g.fillStyle(NEON_GREEN, 0.12);
    g.fillRect(0, TILE - 10, COLS * TILE, 8);

    // Price ticker segments on top wall
    for (let col = 2; col < COLS - 2; col += 3) {
      g.fillStyle(NEON_GREEN, 0.15);
      g.fillRect(col * TILE + 2, 8, TILE * 2, 8);
      // Up arrow for green candles
      if (col % 2 === 0) {
        g.fillStyle(NEON_LIME, 0.4);
        g.fillRect(col * TILE + 8, 9, 4, 1);
        g.fillRect(col * TILE + 9, 10, 2, 1);
        g.fillRect(col * TILE + 10, 11, 1, 4);
      } else {
        g.fillStyle(0xff4444, 0.3);
        g.fillRect(col * TILE + 10, 9, 1, 4);
        g.fillRect(col * TILE + 9, 13, 2, 1);
        g.fillRect(col * TILE + 8, 14, 4, 1);
      }
    }

    // ── Side walls ──
    for (let row = 1; row < ROWS - 1; row++) {
      const py = row * TILE;

      // Left wall — market stall panels
      g.fillStyle(0x0c1810); g.fillRect(0, py, TILE, TILE);
      g.fillStyle(0x0a140c); g.fillRect(0, py, TILE - 2, TILE);
      g.fillStyle(0x102818); g.fillRect(2, py + TILE / 2, TILE - 6, 1);
      g.fillStyle(NEON_GREEN, 0.6); g.fillRect(TILE - 2, py, 2, TILE);
      g.fillStyle(NEON_GREEN, 0.06); g.fillRect(TILE - 10, py, 8, TILE);

      // Wallet icons / key symbols on left wall
      if (row >= 3 && row <= 11 && row % 2 === 1) {
        const seed = row * 7;
        // Key symbol
        g.fillStyle(NEON_GREEN, 0.5);
        g.fillRect(6, py + 8, 4, 4);
        g.fillStyle(NEON_LIME, 0.3);
        g.fillRect(10, py + 9, 8, 2);
        g.fillRect(14, py + 11, 2, 3);
        g.fillRect(17, py + 11, 2, 3);
        // LED
        g.fillStyle((seed + row) % 2 === 0 ? NEON_GREEN : NEON_LIME, 0.6);
        g.fillRect(6, py + 18, 3, 2);
      }

      // Right wall
      g.fillStyle(0x0c1810); g.fillRect((COLS - 1) * TILE, py, TILE, TILE);
      g.fillStyle(0x0a140c); g.fillRect((COLS - 1) * TILE + 2, py, TILE - 2, TILE);
      g.fillStyle(0x102818); g.fillRect((COLS - 1) * TILE + 4, py + TILE / 2, TILE - 6, 1);
      g.fillStyle(NEON_GREEN, 0.6); g.fillRect((COLS - 1) * TILE, py, 2, TILE);
      g.fillStyle(NEON_GREEN, 0.06); g.fillRect((COLS - 1) * TILE, py, 8, TILE);

      // QR code patterns on right wall
      if (row >= 3 && row <= 11 && row % 2 === 0) {
        g.fillStyle(NEON_GREEN, 0.25);
        const rx = (COLS - 1) * TILE + 6;
        // QR-like grid
        for (let qr = 0; qr < 3; qr++) {
          for (let qc = 0; qc < 3; qc++) {
            if ((qr + qc) % 2 === 0) {
              g.fillRect(rx + qc * 5, py + 6 + qr * 5, 4, 4);
            }
          }
        }
      }
    }

    // ── Bottom wall ──
    for (let col = 0; col < COLS; col++) {
      if (col === EXIT_COL) continue;
      const px = col * TILE; const py = (ROWS - 1) * TILE;
      g.fillStyle(0x0c1810); g.fillRect(px, py, TILE, TILE);
      g.fillStyle(0x0a140c); g.fillRect(px + 2, py + 2, TILE - 4, TILE);
      g.fillStyle(0x102818); g.fillRect(px + 2, py + TILE / 3, TILE - 4, 1);
      g.fillStyle(NEON_GREEN, 0.4); g.fillRect(px, py, TILE, 2);
    }

    // ── Exit door — green neon portal ──
    const epx = EXIT_COL * TILE;
    const epy = (ROWS - 1) * TILE;
    g.fillStyle(0x081c0c); g.fillRect(epx, epy, TILE, TILE);
    g.fillStyle(0x0c2e14); g.fillRect(epx + 2, epy, TILE - 4, TILE);
    g.fillStyle(0x104020); g.fillRect(epx + 4, epy, TILE - 8, TILE);
    g.fillStyle(0x185830); g.fillRect(epx + 6, epy, TILE - 12, TILE);
    g.fillStyle(0x207040); g.fillRect(epx + 8, epy, TILE - 16, TILE);
    // Scanlines
    g.fillStyle(0x000000, 0.10);
    for (let sl = 0; sl < TILE; sl += 3) g.fillRect(epx + 4, epy + sl, TILE - 8, 1);
    // Green neon frame
    g.fillStyle(NEON_GREEN);
    g.fillRect(epx + 2, epy, 2, TILE);
    g.fillRect(epx + TILE - 4, epy, 2, TILE);
    g.fillRect(epx, epy, TILE, 2);
    g.fillStyle(NEON_GREEN, 0.12);
    g.fillRect(epx - 8, epy - 6, TILE + 16, TILE + 6);

    // ── Market counter pillars ──
    for (let r = 2; r <= 14; r += 3) {
      const py = r * TILE;
      // Left counter
      g.fillStyle(0x183828); g.fillRect(TILE + 2, py + 2, 12, TILE - 4);
      g.fillStyle(0x143020); g.fillRect(TILE + 3, py + 3, 10, TILE - 6);
      g.fillStyle(NEON_GREEN); g.fillRect(TILE + 2, py + 2, 2, TILE - 4);
      g.fillStyle(NEON_GREEN, 0.10); g.fillRect(TILE, py, 18, TILE);
      g.fillStyle(NEON_LIME, 0.25); g.fillRect(TILE + 12, py + 4, 1, TILE - 8);

      // Right counter
      g.fillStyle(0x183828); g.fillRect((COLS - 2) * TILE - 14, py + 2, 12, TILE - 4);
      g.fillStyle(0x143020); g.fillRect((COLS - 2) * TILE - 13, py + 3, 10, TILE - 6);
      g.fillStyle(NEON_GREEN); g.fillRect((COLS - 2) * TILE - 2, py + 2, 2, TILE - 4);
      g.fillStyle(NEON_GREEN, 0.10); g.fillRect((COLS - 2) * TILE - 18, py, 18, TILE);
      g.fillStyle(NEON_LIME, 0.25); g.fillRect((COLS - 2) * TILE - 13, py + 4, 1, TILE - 8);
    }

    // ── Banner text ──
    this.add.text(COLS * TILE / 2, 16, 'USING BITCOIN', {
      fontSize: '9px', color: '#22c55e',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 0.5).setDepth(10);

    // Exit label
    this.add.text(EXIT_COL * TILE + TILE / 2, (ROWS - 1) * TILE - 3, 'EXIT', {
      fontSize: '6px', color: '#40cc70',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 1).setDepth(10);
  }

  // ── TERMINALS ──────────────────────────────────────────

  createTerminals() {
    TRACK3_LESSONS.forEach((_, i) => {
      const [col, row] = TERMINALS[i];
      const px = col * TILE; const py = row * TILE;

      const g = this.add.graphics();
      this.terminalGraphics.push(g);
      this.drawTerminal(g, px, py, false);

    });
  }

  drawTerminal(g: Phaser.GameObjects.Graphics, px: number, py: number, completed: boolean) {
    g.clear();

    // Floor light pool — green glow
    if (completed) {
      g.fillStyle(NEON_GREEN, 0.30); g.fillRect(px - 16, py + 22, TILE + 32, 22);
      g.fillStyle(NEON_GREEN, 0.15); g.fillRect(px - 28, py + 32, TILE + 56, 20);
    } else {
      g.fillStyle(NEON_LIME, 0.25); g.fillRect(px - 14, py + 22, TILE + 28, 20);
      g.fillStyle(NEON_LIME, 0.12); g.fillRect(px - 24, py + 30, TILE + 48, 18);
    }

    // Desk — dark wood/metal market counter
    g.fillStyle(0x142818);
    g.fillRect(px - 3, py + 22, TILE + 6, 10);
    g.fillStyle(0x1c3820);
    g.fillRect(px - 3, py + 22, TILE + 6, 2);
    g.fillStyle(completed ? NEON_GREEN : NEON_LIME, 0.4);
    g.fillRect(px - 3, py + 31, TILE + 6, 1);

    // Monitor stand
    g.fillStyle(0x142818);
    g.fillRect(px + 12, py + 18, 8, 5);
    g.fillStyle(0x1c3820);
    g.fillRect(px + 13, py + 18, 6, 1);

    // Monitor chassis
    g.fillStyle(0x142818);
    g.fillRect(px - 1, py - 2, TILE + 2, 23);
    g.fillStyle(0x1c3820);
    g.fillRect(px - 1, py - 2, TILE + 2, 2);
    g.fillRect(px - 1, py - 2, 2, 23);
    g.fillStyle(0x0c1c10);
    g.fillRect(px + TILE - 1, py - 2, 2, 23);

    // Bezel
    g.fillStyle(0x102010);
    g.fillRect(px, py, TILE, 20);

    // Screen
    const screenBg = completed ? 0x0c2c14 : 0x081c0c;
    g.fillStyle(screenBg);
    g.fillRect(px + 2, py + 2, TILE - 4, 15);

    if (completed) {
      g.fillStyle(NEON_GREEN, 0.30);
      g.fillRect(px + 2, py + 2, TILE - 4, 15);
      // Header bar
      g.fillStyle(NEON_GREEN);
      g.fillRect(px + 2, py + 2, TILE - 4, 2);
      // Checkmark — wallet verified
      const cx = px + 10; const cy = py + 6;
      g.fillStyle(NEON_WHITE_GREEN);
      g.fillRect(cx + 2, cy + 4, 2, 3);
      g.fillRect(cx + 4, cy + 6, 2, 2);
      g.fillRect(cx + 6, cy + 2, 2, 6);
      // Wallet icon
      g.fillStyle(NEON_GREEN);
      g.fillRect(cx - 2, cy, 6, 8);
      g.fillStyle(0x0c2c14);
      g.fillRect(cx - 1, cy + 1, 4, 6);
    } else {
      // Green candlestick chart lines
      g.fillStyle(NEON_LIME);
      g.fillRect(px + 4, py + 12, 3, 4);
      g.fillRect(px + 8, py + 8, 3, 8);
      g.fillRect(px + 12, py + 10, 3, 6);
      g.fillRect(px + 16, py + 6, 3, 10);
      g.fillRect(px + 20, py + 9, 3, 7);
      // Wicks
      g.fillStyle(NEON_GREEN, 0.4);
      g.fillRect(px + 5, py + 4, 1, 12);
      g.fillRect(px + 9, py + 5, 1, 12);
      g.fillRect(px + 13, py + 7, 1, 10);
      g.fillRect(px + 17, py + 4, 1, 13);
      g.fillRect(px + 21, py + 6, 1, 11);
      // Price line
      g.fillStyle(0x40aa60);
      g.fillRect(px + 3, py + 14, 22, 1);
    }

    // LED indicators
    g.fillStyle(0x142818);
    g.fillRect(px + 2, py + 17, TILE - 4, 2);
    g.fillStyle(completed ? NEON_GREEN : NEON_LIME);
    g.fillRect(px + TILE - 7, py + 17, 3, 2);
    g.fillStyle(completed ? NEON_LIME : 0x204830);
    g.fillRect(px + TILE - 11, py + 17, 3, 2);
  }

  updateTerminals() {
    TRACK3_LESSONS.forEach((lesson, i) => {
      const [col, row] = TERMINALS[i];
      const completed = this.completedLessons.has(lesson.id);
      this.drawTerminal(this.terminalGraphics[i], col * TILE, row * TILE, completed);
    });
    this.updateSenseiState();
  }

  // ── SENSEI (Market Master) ─────────────────────────────

  createSensei() {
    const px = SENSEI_COL * TILE; const py = SENSEI_ROW * TILE;

    this.senseiGlow = this.add.graphics();
    this.senseiGlow.setVisible(false);

    this.senseiGraphics = this.add.graphics();
    this.drawSensei(this.senseiGraphics, px + TILE / 2, py + TILE / 2, false);

    this.senseiPrompt = this.add.text(px + TILE / 2, py - 12, '★ CLAIM BADGE ★', {
      fontSize: '7px', color: '#40ff88',
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
      g.fillStyle(NEON_LIME, 0.08); g.fillCircle(cx, cy, 62);
      g.fillStyle(NEON_GREEN, 0.12); g.fillCircle(cx, cy, 46);
      g.fillStyle(NEON_LIME, 0.16); g.fillCircle(cx, cy, 32);
      g.fillStyle(NEON_WHITE_GREEN, 0.20); g.fillCircle(cx, cy, 20);
    }

    // Robe — market master coat (dark green)
    const robeDeep  = active ? 0x1a4828 : 0x103018;
    const robeMid   = active ? 0x205830 : 0x183820;
    const robeFront = active ? 0x286838 : 0x1c4828;
    g.fillStyle(robeDeep);  g.fillRect(cx - 10, cy - 10, 20, 26);
    g.fillStyle(robeMid);   g.fillRect(cx - 9, cy - 9, 18, 24);
    g.fillStyle(robeFront); g.fillRect(cx - 7, cy - 8, 14, 22);

    // ₿ symbols on robe
    g.fillStyle(NEON_GREEN, active ? 0.35 : 0.12);
    g.fillRect(cx - 4, cy - 4, 1, 5);
    g.fillRect(cx - 2, cy - 3, 3, 1);
    g.fillRect(cx - 2, cy - 1, 3, 1);
    g.fillRect(cx + 2, cy + 4, 1, 5);
    g.fillRect(cx + 0, cy + 5, 3, 1);
    g.fillRect(cx + 0, cy + 7, 3, 1);

    // Robe trim — green neon
    const trimColor = active ? NEON_GREEN : 0x206040;
    g.fillStyle(trimColor);
    g.fillRect(cx - 7, cy - 8, 2, 22);
    g.fillRect(cx + 5, cy - 8, 2, 22);
    g.fillRect(cx - 7, cy + 12, 14, 2);
    g.fillStyle(active ? NEON_LIME : 0x184028);
    g.fillRect(cx - 1, cy - 8, 2, 20);

    // Head
    g.fillStyle(active ? 0x90c0a0 : 0x608070);
    g.fillRect(cx - 5, cy - 22, 10, 12);
    g.fillStyle(active ? 0x78a888 : 0x507060);
    g.fillRect(cx - 5, cy - 13, 10, 3);

    // Chin
    g.fillStyle(active ? 0xa0d0b0 : 0x709080);
    g.fillRect(cx - 1, cy - 18, 2, 4);

    // Beard — market elder
    g.fillStyle(active ? NEON_GREEN : 0x406848);
    g.fillRect(cx - 4, cy - 13, 8, 5);
    g.fillStyle(active ? NEON_WHITE_GREEN : 0x508860);
    for (let i = 0; i < 4; i++) {
      g.fillRect(cx - 3 + i * 2, cy - 12, 1, 3);
    }

    // Eyes — green glow
    g.fillStyle(active ? NEON_LIME : 0x40a060);
    g.fillRect(cx - 4, cy - 19, 2, 2);
    g.fillRect(cx + 2, cy - 19, 2, 2);
    if (active) {
      g.fillStyle(NEON_LIME, 0.5);
      g.fillRect(cx - 5, cy - 20, 4, 4);
      g.fillRect(cx + 1, cy - 20, 4, 4);
    }
    g.fillStyle(0xffffff);
    g.fillRect(cx - 4, cy - 19, 1, 1);
    g.fillRect(cx + 2, cy - 19, 1, 1);

    // Merchant cap
    g.fillStyle(active ? 0x103818 : 0x0c2810);
    g.fillRect(cx - 6, cy - 26, 12, 6);
    g.fillStyle(active ? 0x184820 : 0x103418);
    g.fillRect(cx - 5, cy - 25, 10, 4);
    // Cap brim
    g.fillStyle(active ? NEON_GREEN : 0x206040);
    g.fillRect(cx - 7, cy - 21, 14, 2);
    // Green gem on cap
    g.fillStyle(active ? NEON_LIME : 0x30a050);
    g.fillRect(cx - 1, cy - 24, 2, 2);

    // Abacus/ledger staff
    g.fillStyle(0x1c3820);
    g.fillRect(cx + 10, cy - 24, 4, 38);
    g.fillStyle(0x244830);
    g.fillRect(cx + 11, cy - 24, 1, 38);
    if (active) {
      g.fillStyle(NEON_GREEN, 0.5);
      g.fillRect(cx + 13, cy - 24, 1, 38);
    }

    // Orb housing — green
    g.fillStyle(active ? 0x1a5028 : 0x103818);
    g.fillRect(cx + 8, cy - 30, 10, 10);
    g.fillStyle(active ? NEON_GREEN : 0x206840);
    g.fillRect(cx + 9, cy - 29, 8, 8);
    g.fillStyle(active ? NEON_LIME : 0x30a060);
    g.fillRect(cx + 10, cy - 28, 6, 6);
    if (active) {
      g.fillStyle(0xffffff); g.fillRect(cx + 11, cy - 27, 2, 2);
      g.fillStyle(NEON_LIME, 0.25); g.fillRect(cx + 5, cy - 34, 18, 18);
      g.fillStyle(NEON_GREEN, 0.12); g.fillRect(cx + 2, cy - 38, 24, 24);
    }
  }

  updateSenseiState() {
    const allDone = TRACK3_LESSONS.every((l) => this.completedLessons.has(l.id));
    const px = SENSEI_COL * TILE; const py = SENSEI_ROW * TILE;
    this.drawSensei(this.senseiGraphics, px + TILE / 2, py + TILE / 2, allDone);

    if (allDone) {
      this.senseiGlow.clear();
      this.senseiGlow.fillStyle(NEON_LIME, 0.05);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 64);
      this.senseiGlow.fillStyle(NEON_GREEN, 0.07);
      this.senseiGlow.fillCircle(px + TILE / 2, py + TILE / 2, 48);
      this.senseiGlow.fillStyle(NEON_LIME, 0.10);
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

    // Boots with green reflection
    g.fillStyle(0x0c1410); g.fillRect(cx - 7, cy + 8, 6, 6); g.fillRect(cx + 1, cy + 8, 6, 6);
    g.fillStyle(NEON_GREEN, 0.3); g.fillRect(cx - 7, cy + 8, 6, 1); g.fillRect(cx + 1, cy + 8, 6, 1);
    g.fillStyle(0x0a100c); g.fillRect(cx - 8, cy + 13, 7, 1); g.fillRect(cx + 1, cy + 13, 7, 1);

    // Legs
    g.fillStyle(0x182c1e); g.fillRect(cx - 6, cy + 1, 5, 8); g.fillRect(cx + 1, cy + 1, 5, 8);

    // Belt
    g.fillStyle(0x1c3820); g.fillRect(cx - 7, cy, 14, 3);
    g.fillStyle(NEON_GREEN); g.fillRect(cx - 1, cy + 1, 3, 2);

    // Coat
    g.fillStyle(0x142c18); g.fillRect(cx - 7, cy - 9, 14, 10);
    g.fillStyle(0x1c3420); g.fillRect(cx - 6, cy - 8, 12, 9);
    g.fillStyle(0x122818); g.fillRect(cx - 3, cy - 8, 6, 9);
    g.fillStyle(NEON_GREEN); g.fillRect(cx + 6, cy - 9, 1, 10);
    g.fillStyle(NEON_GREEN, 0.12); g.fillRect(cx - 6, cy - 8, 12, 9);

    // Arms
    g.fillStyle(0x142c18); g.fillRect(cx - 9, cy - 8, 3, 9); g.fillRect(cx + 6, cy - 8, 3, 9);

    // Hood
    g.fillStyle(0x122818); g.fillRect(cx - 7, cy - 21, 14, 13);
    g.fillStyle(0x0c1c10); g.fillRect(cx - 5, cy - 19, 10, 10);
    g.fillStyle(0x3c3828); g.fillRect(cx - 3, cy - 16, 6, 6);

    // Glowing green eyes
    g.fillStyle(NEON_GREEN, 0.40);
    g.fillRect(cx - 4, cy - 14, 4, 3); g.fillRect(cx, cy - 14, 4, 3);
    g.fillStyle(NEON_LIME);
    g.fillRect(cx - 3, cy - 13, 2, 2); g.fillRect(cx + 1, cy - 13, 2, 2);
    g.fillStyle(0xffffff);
    g.fillRect(cx - 3, cy - 13, 1, 1); g.fillRect(cx + 1, cy - 13, 1, 1);
  }

  // ── UI ─────────────────────────────────────────────────

  createUI() {
    this.interactPrompt = this.add.text(0, 0, '▶ Press SPACE', {
      fontSize: '8px', color: '#22c55e',
      fontFamily: '"Press Start 2P", monospace',
      backgroundColor: '#000000dd', padding: { x: 6, y: 3 },
    }).setVisible(false).setDepth(20);

    this.add.text(4, ROWS * TILE - 12, 'SPACE: interact  |  Arrow keys / WASD: move  |  ESC: Classic Mode', {
      fontSize: '7px', color: '#1a3828', fontFamily: 'monospace',
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

    // Animated price ticker scrolling across top
    this.updateTicker();

    const interactable = this.getAdjacentInteractable();

    if (interactable === 'terminal') {
      const idx = this.getTerminalIndexAtPlayer();
      const lesson = TRACK3_LESSONS[idx];
      const completed = this.completedLessons.has(lesson.id);
      this.interactPrompt
        .setText(completed ? '▶ Review Lesson' : '▶ Press SPACE')
        .setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32)
        .setVisible(true);
      this.senseiPrompt.setVisible(false);
    } else if (interactable === 'sensei') {
      const allDone = TRACK3_LESSONS.every((l) => this.completedLessons.has(l.id));
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
          const lesson = TRACK3_LESSONS[idx];
          EventBus.emit('lessonActivated', { lessonId: lesson.id, lessonTitle: lesson.title, xp: lesson.xp, terminalIndex: idx });
        }
      } else if (interactable === 'sensei') {
        const allDone = TRACK3_LESSONS.every((l) => this.completedLessons.has(l.id));
        EventBus.emit(allDone ? 'awardBadge' : 'senseiMessage', allDone ? 'using-complete' : 'Complete all 4 terminals first!');
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

  updateTicker() {
    const tg = this.tickerGraphics;
    tg.clear();

    // Scrolling price ticker dots across the top wall
    const tickerY = 10;
    const speed = this.elapsedTime * 40;
    for (let i = 0; i < 8; i++) {
      const tx = ((i * 80 + speed) % (COLS * TILE + 80)) - 40;
      if (tx < -20 || tx > COLS * TILE + 20) continue;
      const isUp = i % 3 !== 1;
      tg.fillStyle(isUp ? NEON_GREEN : 0xff4444, 0.25);
      tg.fillRect(tx, tickerY, 3, 3);
      tg.fillStyle(isUp ? NEON_GREEN : 0xff4444, 0.08);
      tg.fillRect(tx - 2, tickerY - 1, 7, 5);
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
