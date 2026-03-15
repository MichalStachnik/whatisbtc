import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { AudioManager } from '../AudioManager';

const TILE = 32;
const COLS = 40;
const ROWS = 32;

// Tile types: 0=street, 1=building, 2=dojoWall, 3=dojoDoor, 4=path, 5=sidewalk, 6=neonShop, 7=alley
// prettier-ignore
const MAP: number[][] = [
  // Row 0-1: Top skyline buildings
  [1,1,6,1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1],
  [1,1,6,1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1],
  // Row 2: Sidewalk
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  // Row 3-5: Upper street
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 6: Sidewalk
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  // Row 7-11: Building block with dojo (cols 16-22)
  [1,1,7,6,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,6,1,1,1,1,1,6,7,1,1,1],
  [1,1,7,1,1,1,6,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,2,1,1,6,1,1,1,1,1,1,1,1,1,1,7,1,1,1],
  [1,1,7,1,1,1,1,1,1,6,1,1,1,1,1,1,2,0,0,0,0,0,2,1,1,1,1,1,6,1,1,1,1,6,1,1,7,1,1,1],
  [1,1,7,6,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,2,1,1,1,1,1,1,1,1,6,1,1,1,1,7,1,1,1],
  [1,1,7,1,1,1,1,1,1,1,6,1,1,1,1,1,2,2,2,3,2,2,2,1,1,1,1,1,1,1,1,1,1,1,6,1,7,1,1,1],
  // Row 12: Sidewalk with path from dojo
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  // Row 13-15: Middle street (main east-west road)
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 16: Sidewalk
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  // Row 17-21: Lower building block with crypto dojo (cols 29-35) and practical dojo (cols 1-7)
  [1,10,10,10,10,10,10,10,7,1,1,1,1,1,6,1,1,1,1,1,1,1,1,6,1,1,1,1,7,8,8,8,8,8,8,8,1,1,1,1],
  [1,10,0,0,0,0,0,10,7,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,7,8,0,0,0,0,0,8,1,1,1,1],
  [1,10,0,0,0,0,0,10,7,6,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,7,8,0,0,0,0,0,8,1,1,6,1],
  [1,10,0,0,0,0,0,10,7,1,1,1,1,6,1,1,1,1,1,0,0,1,1,1,1,6,1,1,7,8,0,0,0,0,0,8,1,1,1,1],
  [1,10,10,10,11,10,10,10,7,1,1,1,1,1,1,6,1,1,1,0,0,1,1,1,1,1,1,1,7,8,8,8,9,8,8,8,1,1,1,1],
  // Row 22: Sidewalk
  [5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,5,5,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5],
  // Row 23-25: Lower street
  [0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 26: Sidewalk
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  // Row 27-30: Bottom building block
  [1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,1,1,1,6,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,1],
  [1,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,6,1,1],
  [1,6,1,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1],
  [1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1,6,1,1,1,1,1,1,6,1,1,1,1,1,6,1,1,1,1],
  // Row 31: Bottom edge
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const DOOR_COL = 19; // single door tile column
const DOOR_ROW = 11;
const DOOR2_COL = 32; // crypto dojo door
const DOOR2_ROW = 21;
const DOOR3_COL = 4;  // practical dojo door
const DOOR3_ROW = 21;

const MOVE_INITIAL_DELAY = 200;
const MOVE_REPEAT_RATE   = 140;

// Neon color palette
const NEON_CYAN    = 0x00e5ff;
const NEON_MAGENTA = 0xff00aa;
const NEON_ORANGE  = 0xF7931A;
const NEON_PINK    = 0xff4488;
const NEON_BLUE    = 0x4488ff;
const NEON_GREEN   = 0x00ff88;

// ── NPC Definitions ──────────────────────────────────────

interface NPCDef {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  color: number;
  accentColor: number;
}

const NPCS: NPCDef[] = [
  { id: 'cash-saver',    name: 'Dollar Dave',    gridX: 5,  gridY: 14, color: NEON_GREEN,  accentColor: 0x44aa44 },
  { id: 'gold-bug',      name: 'Aurum',          gridX: 34, gridY: 14, color: 0xffd700,    accentColor: 0xccaa00 },
  { id: 'bitcoin-miner', name: 'Satoshi',        gridX: 19, gridY: 24, color: NEON_ORANGE, accentColor: NEON_CYAN },
];

// ── Atmospheric types ────────────────────────────────────

interface RainDrop {
  x: number; y: number; speed: number; length: number; alpha: number;
}

interface Puddle {
  x: number; y: number; w: number; h: number; shimmerPhase: number; color: number;
}

interface NeonSign {
  x: number; y: number; w: number; h: number; color: number; flicker: number; flickerSpeed: number;
}

// ═════════════════════════════════════════════════════════

export class OverworldScene extends Phaser.Scene {
  private playerGridX = 19;
  private playerGridY = 14;
  private isMoving    = false;
  private enteringDojo = false;
  private lastDojo: 1 | 2 | 3 = 1;
  private blockInput   = false;
  private playerContainer!: Phaser.GameObjects.Container;
  private playerGraphics!:  Phaser.GameObjects.Graphics;
  private cursors!:   Phaser.Types.Input.Keyboard.CursorKeys;
  private upKey!:     Phaser.Input.Keyboard.Key;
  private downKey!:   Phaser.Input.Keyboard.Key;
  private leftKey!:   Phaser.Input.Keyboard.Key;
  private rightKey!:  Phaser.Input.Keyboard.Key;
  private spaceKey!:  Phaser.Input.Keyboard.Key;
  private interactPrompt!: Phaser.GameObjects.Text;
  private lastDx = 0;
  private lastDy = 0;
  private moveTimer = 0;

  // NPCs
  private npcContainers: Map<string, Phaser.GameObjects.Container> = new Map();

  // Atmospheric effects
  private rainDrops: RainDrop[] = [];
  private rainGraphics!: Phaser.GameObjects.Graphics;
  private puddles: Puddle[] = [];
  private puddleGraphics!: Phaser.GameObjects.Graphics;
  private neonSigns: NeonSign[] = [];
  private neonGraphics!: Phaser.GameObjects.Graphics;
  private fogGraphics!: Phaser.GameObjects.Graphics;
  private elapsedTime = 0;

  constructor() { super({ key: 'OverworldScene' }); }

  create() {
    this.enteringDojo = false;
    this.blockInput   = false;
    this.isMoving     = false;
    this.lastDx = 0; this.lastDy = 0; this.moveTimer = 0;
    this.elapsedTime = 0;
    this.neonSigns = [];

    this.drawMap();
    this.initAtmosphere();
    this.createNPCs();
    this.createPlayer();
    this.createUI();
    this.setupControls();
    this.setupCamera();
    this.setupEventBus();

    this.events.on(Phaser.Scenes.Events.WAKE, this.onWake, this);
    AudioManager.setOutdoor();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  private setupCamera() {
    this.cameras.main.setBounds(0, 0, COLS * TILE, ROWS * TILE);
    this.cameras.main.startFollow(this.playerContainer, true, 0.12, 0.12);
  }

  private setupEventBus() {
    EventBus.on('blockInput',   this.onBlockInput,   this);
    EventBus.on('unblockInput', this.onUnblockInput, this);
  }

  private onBlockInput()   { this.blockInput = true;  }
  private onUnblockInput() { this.blockInput = false; }

  onWake() {
    if (this.lastDojo === 3) {
      this.playerGridX = DOOR3_COL;
      this.playerGridY = DOOR3_ROW + 1;
    } else if (this.lastDojo === 2) {
      this.playerGridX = DOOR2_COL;
      this.playerGridY = DOOR2_ROW + 1;
    } else {
      this.playerGridX = DOOR_COL;
      this.playerGridY = DOOR_ROW + 1;
    }
    this.playerContainer.setPosition(
      this.playerGridX * TILE + TILE / 2,
      this.playerGridY * TILE + TILE / 2
    );
    this.enteringDojo = false;
    this.blockInput   = false;
    this.isMoving     = false;
    this.lastDx = 0; this.lastDy = 0; this.moveTimer = 0;
    AudioManager.setOutdoor();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ── MAP DRAWING ───────────────────────────────────────────

  drawMap() {
    const g = this.add.graphics();
    g.fillStyle(0x030508);
    g.fillRect(0, 0, COLS * TILE, ROWS * TILE);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tile = MAP[row][col];
        const px = col * TILE;
        const py = row * TILE;
        switch (tile) {
          case 0: this.drawStreet(g, px, py, row, col); break;
          case 1: this.drawBuilding(g, px, py, row, col); break;
          case 2: this.drawDojoWall(g, px, py, row, col); break;
          case 3: this.drawDojoDoor(g, px, py); break;
          case 4: this.drawPath(g, px, py, row, col); break;
          case 5: this.drawSidewalk(g, px, py, row, col); break;
          case 6: this.drawNeonShopFront(g, px, py, row, col); break;
          case 7: this.drawAlley(g, px, py); break;
          case 8: this.drawCryptoDojoWall(g, px, py, row, col); break;
          case 9: this.drawCryptoDojoDoor(g, px, py); break;
          case 10: this.drawPracticalDojoWall(g, px, py, row, col); break;
          case 11: this.drawPracticalDojoDoor(g, px, py); break;
        }
      }
    }

    this.drawDoorGlow(g);
    this.drawDojoRoof(g);
    this.drawDoorGlow2(g);
    this.drawCryptoDojoRoof(g);
    this.drawDoorGlow3(g);
    this.drawPracticalDojoRoof(g);

    // Dojo sign
    this.add.text(DOOR_COL * TILE + TILE / 2, 7 * TILE + 8, 'BITCOIN BASICS', {
      fontSize: '9px', color: '#F7931A',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 0.5).setDepth(5);

    // Crypto dojo sign
    this.add.text(DOOR2_COL * TILE + TILE / 2, 17 * TILE + 8, 'THE TECHNOLOGY', {
      fontSize: '9px', color: '#3B82F6',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 0.5).setDepth(5);

    // Practical dojo sign
    this.add.text(DOOR3_COL * TILE + TILE / 2, 17 * TILE + 8, 'USING BITCOIN', {
      fontSize: '9px', color: '#22c55e',
      fontFamily: '"Press Start 2P", monospace',
    }).setOrigin(0.5, 0.5).setDepth(5);
  }

  drawStreet(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    const base = (row + col) % 3 === 0 ? 0x08101a : (row + col) % 3 === 1 ? 0x0a1220 : 0x070e18;
    g.fillStyle(base); g.fillRect(px, py, TILE, TILE);

    const seed = row * COLS + col;
    g.fillStyle(0x060c14);
    g.fillRect(px + (seed % 7) * 4, py + (seed % 5) * 6, 3, 2);

    // Center road markings on middle street rows
    if (row === 14) {
      if (col % 3 !== 2) {
        g.fillStyle(0x1a2838); g.fillRect(px, py + 14, TILE, 4);
        g.fillStyle(0x2a3848); g.fillRect(px, py + 15, TILE, 2);
      }
    }
    if (row === 24) {
      if (col % 3 !== 2) {
        g.fillStyle(0x1a2838); g.fillRect(px, py + 14, TILE, 4);
        g.fillStyle(0x2a3848); g.fillRect(px, py + 15, TILE, 2);
      }
    }

    // Rain streaks
    g.fillStyle(0x0e1828, 0.6);
    for (let dx = 2 + (seed % 5); dx < TILE; dx += 7 + (seed % 4)) {
      g.fillRect(px + dx, py, 1, TILE);
    }

    // Wet specular
    if (seed % 11 === 3) {
      g.fillStyle(0x182840, 0.8);
      g.fillRect(px + 4 + (seed % 12), py + 8 + (seed % 10), 8, 3);
    }
  }

  drawBuilding(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    const seed = row * COLS + col;
    const baseTone = [0x0c0e16, 0x0e1018, 0x0a0c14, 0x101220][seed % 4];
    g.fillStyle(baseTone); g.fillRect(px, py, TILE, TILE);

    g.fillStyle(0x080a12);
    g.fillRect(px, py + 8, TILE, 1);
    g.fillRect(px, py + 16, TILE, 1);
    g.fillRect(px, py + 24, TILE, 1);
    g.fillStyle(0x080a10);
    g.fillRect(px + 16, py, 1, TILE);

    // Windows
    const winColors = [NEON_CYAN, NEON_ORANGE, NEON_PINK, NEON_BLUE, 0x886622, 0x444444];
    if (seed % 3 !== 0) {
      const wc = winColors[seed % winColors.length];
      g.fillStyle(0x0a0c10); g.fillRect(px + 3, py + 4, 10, 8);
      g.fillStyle(wc, 0.3 + (seed % 5) * 0.1);
      g.fillRect(px + 4, py + 5, 8, 6);
      g.fillStyle(0x181c24);
      g.fillRect(px + 4, py + 8, 8, 1);
      g.fillRect(px + 8, py + 5, 1, 6);
      g.fillStyle(wc, 0.04); g.fillRect(px, py + 2, 16, 14);
    }
    if (seed % 4 !== 0) {
      const wc2 = winColors[(seed * 3 + 2) % winColors.length];
      g.fillStyle(0x0a0c10); g.fillRect(px + 19, py + 4, 10, 8);
      g.fillStyle(wc2, 0.25 + (seed % 4) * 0.1);
      g.fillRect(px + 20, py + 5, 8, 6);
      g.fillStyle(0x181c24);
      g.fillRect(px + 20, py + 8, 8, 1);
      g.fillRect(px + 24, py + 5, 1, 6);
      g.fillStyle(wc2, 0.04); g.fillRect(px + 16, py + 2, 16, 14);
    }

    // Pipes on certain buildings
    if (seed % 7 === 2) {
      g.fillStyle(0x141820); g.fillRect(px + 26, py, 3, TILE);
      g.fillStyle(0x1c2028); g.fillRect(px + 26, py, 1, TILE);
    }

    // AC unit
    if (seed % 13 === 3) {
      g.fillStyle(0x181c22); g.fillRect(px + 2, py + 20, 14, 10);
      g.fillStyle(0x202830); g.fillRect(px + 3, py + 21, 12, 8);
      g.fillStyle(0x141820);
      for (let i = 0; i < 4; i++) g.fillRect(px + 4, py + 22 + i * 2, 10, 1);
    }

    // Antenna on row 0
    if (row === 0 && seed % 5 === 0) {
      g.fillStyle(0x181c24); g.fillRect(px + 14, py, 2, 4);
      g.fillStyle(0xff2200); g.fillRect(px + 14, py, 2, 1);
      g.fillStyle(0xff2200, 0.15); g.fillRect(px + 12, py - 1, 6, 4);
    }
  }

  drawNeonShopFront(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    this.drawBuilding(g, px, py, row, col);
    const seed = row * COLS + col;
    const neonColor = [NEON_CYAN, NEON_MAGENTA, NEON_PINK, NEON_GREEN][seed % 4];

    g.fillStyle(0x181c24); g.fillRect(px + 2, py + 2, TILE - 4, 14);
    g.fillStyle(neonColor, 0.15); g.fillRect(px + 3, py + 3, TILE - 6, 12);

    // Border
    g.fillStyle(neonColor, 0.9);
    g.fillRect(px + 2, py + 2, TILE - 4, 1);
    g.fillRect(px + 2, py + 15, TILE - 4, 1);
    g.fillRect(px + 2, py + 2, 1, 14);
    g.fillRect(px + TILE - 3, py + 2, 1, 14);

    // Text bars
    g.fillStyle(neonColor, 0.8);
    g.fillRect(px + 5, py + 5, 8, 2);
    g.fillRect(px + 5, py + 9, 6, 2);
    g.fillRect(px + 15, py + 5, 10, 2);
    g.fillRect(px + 17, py + 9, 6, 2);

    // Bloom
    g.fillStyle(neonColor, 0.06); g.fillRect(px - 8, py - 4, TILE + 16, 24);
    g.fillStyle(neonColor, 0.03); g.fillRect(px - 16, py - 8, TILE + 32, 32);

    if (row <= 1) {
      g.fillStyle(neonColor, 0.08); g.fillRect(px - 4, py + TILE, TILE + 8, TILE);
      g.fillStyle(neonColor, 0.04); g.fillRect(px - 8, py + TILE, TILE + 16, TILE * 2);
    }

    this.neonSigns.push({
      x: px + 2, y: py + 2, w: TILE - 4, h: 14,
      color: neonColor, flicker: 1, flickerSpeed: 0.5 + Math.random() * 2,
    });
  }

  drawAlley(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    g.fillStyle(0x060a10); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x0a0e18); g.fillRect(px + 2, py, TILE - 4, TILE);
    g.fillStyle(0x0c1420, 0.8); g.fillRect(px + 4, py + 8, TILE - 8, 12);
    g.fillStyle(NEON_CYAN, 0.04); g.fillRect(px + 6, py + 10, TILE - 12, 8);
    g.fillStyle(0x040810);
    g.fillRect(px, py, 2, TILE);
    g.fillRect(px + TILE - 2, py, 2, TILE);
    g.fillStyle(0x101828, 0.6);
    g.fillRect(px + 8, py, 1, TILE);
    g.fillRect(px + 22, py, 1, TILE);
  }

  drawSidewalk(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    const seed = row * COLS + col;
    const base = (row + col) % 2 === 0 ? 0x141c28 : 0x121a24;
    g.fillStyle(base); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x0e1620);
    g.fillRect(px, py + TILE - 1, TILE, 1);
    g.fillRect(px + TILE - 1, py, 1, TILE);

    // Curb edges
    if (row === 2 || row === 12 || row === 22) {
      g.fillStyle(0x1e2838); g.fillRect(px, py + TILE - 3, TILE, 3);
      g.fillStyle(0x283848); g.fillRect(px, py + TILE - 2, TILE, 1);
    }
    if (row === 6 || row === 16 || row === 26) {
      g.fillStyle(0x1e2838); g.fillRect(px, py, TILE, 3);
      g.fillStyle(0x283848); g.fillRect(px, py + 1, TILE, 1);
      g.fillStyle(0x1e2838); g.fillRect(px, py + TILE - 3, TILE, 3);
    }

    // Puddle
    if (seed % 17 === 5) {
      g.fillStyle(0x0c1420, 0.6); g.fillRect(px + 4, py + 10, 20, 8);
      g.fillStyle(0x182838, 0.4); g.fillRect(px + 5, py + 11, 18, 1);
    }

    // Streetlights
    if ((row === 6 || row === 16 || row === 26) && col % 6 === 1) {
      this.drawStreetlight(g, px, py);
    }
    if ((row === 2 || row === 12 || row === 22) && col % 6 === 4) {
      this.drawStreetlight(g, px, py);
    }
  }

  drawStreetlight(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    g.fillStyle(0x1a2030);
    g.fillRect(px + 14, py + 4, 4, TILE - 4);
    g.fillStyle(0x242c3c); g.fillRect(px + 14, py + 4, 1, TILE - 4);
    g.fillStyle(0x1a2030); g.fillRect(px + 8, py + 4, 16, 3);
    g.fillStyle(0x202838); g.fillRect(px + 8, py, 12, 6);
    g.fillStyle(0x283040); g.fillRect(px + 8, py, 12, 2);
    g.fillStyle(0xffcc66, 0.7); g.fillRect(px + 10, py + 2, 8, 3);
    g.fillStyle(0xffeebb); g.fillRect(px + 11, py + 2, 6, 2);
    g.fillStyle(0xffcc66, 0.08); g.fillRect(px + 2, py - 2, 24, 16);
    g.fillStyle(0xffcc66, 0.04); g.fillRect(px - 6, py - 4, TILE + 12, 24);
    g.fillStyle(0xffcc66, 0.06); g.fillRect(px - 4, py + TILE - 8, TILE + 8, 10);
  }

  drawDojoWall(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    g.fillStyle(0x14100a); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x1c1810);
    g.fillRect(px, py + 8, TILE, 1);
    g.fillRect(px, py + 16, TILE, 1);
    g.fillRect(px, py + 24, TILE, 1);
    g.fillStyle(0x100e08); g.fillRect(px + 16, py, 1, TILE);

    // Windows on side walls
    if (row >= 8 && row <= 10) {
      if (col === 16) {
        g.fillStyle(0x1e1608); g.fillRect(px + 16, py + 6, 14, 12);
        g.fillStyle(0x6a3c10); g.fillRect(px + 17, py + 7, 12, 10);
        g.fillStyle(0xc07030); g.fillRect(px + 18, py + 8, 10, 8);
        g.fillStyle(0x1e1608);
        g.fillRect(px + 22, py + 7, 1, 10);
        g.fillRect(px + 17, py + 12, 12, 1);
        g.fillStyle(NEON_ORANGE, 0.08); g.fillRect(px + 12, py + 2, 20, 20);
        g.fillStyle(0xd4944c, 0.6); g.fillRect(px + 21, py + 7, 1, 10);
      }
      if (col === 22) {
        g.fillStyle(0x1e1608); g.fillRect(px + 2, py + 6, 14, 12);
        g.fillStyle(0x6a3c10); g.fillRect(px + 3, py + 7, 12, 10);
        g.fillStyle(0xc07030); g.fillRect(px + 4, py + 8, 10, 8);
        g.fillStyle(0x1e1608);
        g.fillRect(px + 9, py + 7, 1, 10);
        g.fillRect(px + 3, py + 12, 12, 1);
        g.fillStyle(NEON_ORANGE, 0.08); g.fillRect(px, py + 2, 20, 20);
        g.fillStyle(0xd4944c, 0.6); g.fillRect(px + 10, py + 7, 1, 10);
      }
    }

    // Neon trim on dojo edges
    if (col === 16 && row >= 7 && row <= 11) {
      g.fillStyle(NEON_ORANGE, 0.7); g.fillRect(px + TILE - 2, py, 2, TILE);
      g.fillStyle(NEON_ORANGE, 0.1); g.fillRect(px + TILE - 8, py, 8, TILE);
    }
    if (col === 22 && row >= 7 && row <= 11) {
      g.fillStyle(NEON_ORANGE, 0.7); g.fillRect(px, py, 2, TILE);
      g.fillStyle(NEON_ORANGE, 0.1); g.fillRect(px, py, 8, TILE);
    }
    if (row === 7) {
      g.fillStyle(NEON_ORANGE, 0.7); g.fillRect(px, py + TILE - 2, TILE, 2);
      g.fillStyle(NEON_ORANGE, 0.08); g.fillRect(px, py + TILE - 8, TILE, 8);
    }
  }

  drawDojoDoor(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    g.fillStyle(0x14100a); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x1e1208); g.fillRect(px + 2, py + 1, 28, 31);
    g.fillStyle(0x3c2210); g.fillRect(px + 4, py + 2, 24, 29);
    g.fillStyle(0x6a3a18); g.fillRect(px + 6, py + 3, 20, 27);
    g.fillStyle(0xa85e22); g.fillRect(px + 8, py + 4, 16, 25);
    g.fillStyle(0xd4822a); g.fillRect(px + 9, py + 5, 14, 23);
    g.fillStyle(0xeeA030); g.fillRect(px + 10, py + 6, 12, 21);
    g.fillStyle(0xffb840); g.fillRect(px + 11, py + 7, 10, 19);
    g.fillStyle(0xffd06a); g.fillRect(px + 12, py + 9, 8, 15);
    g.fillStyle(0xfff0c0); g.fillRect(px + 13, py + 12, 6, 9);

    g.fillStyle(0x000000, 0.08);
    for (let sl = 0; sl < 30; sl += 3) g.fillRect(px + 2, py + 1 + sl, 28, 1);

    const bx = px + 11; const by = py + 6;
    g.fillStyle(0x7a4000, 0.7);
    g.fillRect(bx + 1, by, 2, 16); g.fillRect(bx + 5, by, 2, 16);
    g.fillRect(bx, by + 1, 8, 2); g.fillRect(bx, by + 7, 8, 2); g.fillRect(bx, by + 13, 8, 2);
    g.fillRect(bx + 2, by + 3, 3, 4); g.fillRect(bx + 2, by + 9, 3, 4);

    g.fillStyle(NEON_ORANGE);
    g.fillRect(px + 2, py + 1, 2, 31); g.fillRect(px + 28, py + 1, 2, 31);
    g.fillRect(px + 2, py + 1, 28, 2);
    g.fillStyle(NEON_ORANGE, 0.15); g.fillRect(px - 2, py - 3, 36, 38);
  }

  drawPath(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    const isDojo2 = col === DOOR2_COL;
    const isDojo3 = col === DOOR3_COL;
    const neonColor = isDojo2 ? NEON_BLUE : isDojo3 ? NEON_GREEN : NEON_ORANGE;
    const doorRow = isDojo2 ? DOOR2_ROW : isDojo3 ? DOOR3_ROW : DOOR_ROW;
    const dist = row - doorRow;

    if (isDojo2) {
      const coolBase = [0x0e1228, 0x0c1020, 0x0a0e1c, 0x080c18][Math.min(Math.abs(dist) - 1, 3)] ?? 0x080c18;
      g.fillStyle(coolBase); g.fillRect(px, py, TILE, TILE);
      g.fillStyle(0x0c1428, 0.6);
      for (let dx = 3; dx < TILE; dx += 7) g.fillRect(px + dx, py, 1, TILE);
    } else if (isDojo3) {
      const greenBase = [0x0e1c10, 0x0c1a0e, 0x0a160c, 0x08140a][Math.min(Math.abs(dist) - 1, 3)] ?? 0x08140a;
      g.fillStyle(greenBase); g.fillRect(px, py, TILE, TILE);
      g.fillStyle(0x0c1c10, 0.6);
      for (let dx = 3; dx < TILE; dx += 7) g.fillRect(px + dx, py, 1, TILE);
    } else {
      const warmBase = [0x1e1208, 0x18100a, 0x120e08, 0x0e0c08][Math.min(Math.abs(dist) - 1, 3)] ?? 0x0e0c08;
      g.fillStyle(warmBase); g.fillRect(px, py, TILE, TILE);
      g.fillStyle(0x1a1408, 0.6);
      for (let dx = 3; dx < TILE; dx += 7) g.fillRect(px + dx, py, 1, TILE);
    }

    if (Math.abs(dist) <= 1) {
      g.fillStyle(neonColor, 0.16); g.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
      const innerGlow = isDojo2 ? 0x4d88ff : isDojo3 ? 0x4dff88 : 0xffb84d;
      g.fillStyle(innerGlow, 0.12); g.fillRect(px + 6, py + 6, TILE - 12, TILE - 12);
    } else if (Math.abs(dist) <= 2) {
      g.fillStyle(neonColor, 0.08); g.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
    }
  }

  drawDoorGlow(g: Phaser.GameObjects.Graphics) {
    const cx = DOOR_COL * TILE + TILE / 2;
    const cy = DOOR_ROW * TILE + TILE / 2;
    g.fillStyle(NEON_ORANGE, 0.012); g.fillRect(cx - 140, cy - 120, 280, 240);
    g.fillStyle(NEON_ORANGE, 0.02);  g.fillRect(cx - 100, cy - 90, 200, 180);
    g.fillStyle(NEON_ORANGE, 0.035); g.fillRect(cx - 70, cy - 60, 140, 120);
    g.fillStyle(NEON_ORANGE, 0.06);  g.fillRect(cx - 44, cy - 40, 88, 80);
    g.fillStyle(NEON_ORANGE, 0.09);  g.fillRect(cx - 28, cy - 24, 56, 48);
    g.fillStyle(NEON_ORANGE, 0.12);  g.fillRect(cx - 16, cy - 12, 32, 24);
  }

  drawDojoRoof(g: Phaser.GameObjects.Graphics) {
    const roofLeft = 16 * TILE;
    const roofY = 7 * TILE;
    const roofW = 7 * TILE;
    g.fillStyle(0x0e0c08); g.fillRect(roofLeft, roofY - 6, roofW, 8);
    g.fillStyle(0x1a1610); g.fillRect(roofLeft, roofY - 4, roofW, 6);
    g.fillStyle(NEON_ORANGE, 0.9); g.fillRect(roofLeft, roofY - 2, roofW, 2);
    g.fillStyle(NEON_ORANGE);
    g.fillRect(roofLeft + 2, roofY - 4, 4, 4);
    g.fillRect(roofLeft + roofW - 6, roofY - 4, 4, 4);
    g.fillStyle(NEON_ORANGE, 0.2);
    g.fillRect(roofLeft - 2, roofY - 8, 10, 12);
    g.fillRect(roofLeft + roofW - 8, roofY - 8, 10, 12);
  }

  // ── Crypto Dojo Drawing ──────────────────────────────────

  drawCryptoDojoWall(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    g.fillStyle(0x0a1020); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x0e1428);
    g.fillRect(px, py + 8, TILE, 1);
    g.fillRect(px, py + 16, TILE, 1);
    g.fillRect(px, py + 24, TILE, 1);
    g.fillStyle(0x0a1020); g.fillRect(px + 16, py, 1, TILE);

    // Windows on side walls
    if (row >= 18 && row <= 20) {
      if (col === 29) {
        g.fillStyle(0x0c1428); g.fillRect(px + 16, py + 6, 14, 12);
        g.fillStyle(0x102040); g.fillRect(px + 17, py + 7, 12, 10);
        g.fillStyle(0x2060a0); g.fillRect(px + 18, py + 8, 10, 8);
        g.fillStyle(0x0c1428);
        g.fillRect(px + 22, py + 7, 1, 10);
        g.fillRect(px + 17, py + 12, 12, 1);
        g.fillStyle(NEON_BLUE, 0.08); g.fillRect(px + 12, py + 2, 20, 20);
      }
      if (col === 35) {
        g.fillStyle(0x0c1428); g.fillRect(px + 2, py + 6, 14, 12);
        g.fillStyle(0x102040); g.fillRect(px + 3, py + 7, 12, 10);
        g.fillStyle(0x2060a0); g.fillRect(px + 4, py + 8, 10, 8);
        g.fillStyle(0x0c1428);
        g.fillRect(px + 9, py + 7, 1, 10);
        g.fillRect(px + 3, py + 12, 12, 1);
        g.fillStyle(NEON_BLUE, 0.08); g.fillRect(px, py + 2, 20, 20);
      }
    }

    // Blue neon trim on dojo edges
    if (col === 29 && row >= 17 && row <= 21) {
      g.fillStyle(NEON_BLUE, 0.7); g.fillRect(px + TILE - 2, py, 2, TILE);
      g.fillStyle(NEON_BLUE, 0.1); g.fillRect(px + TILE - 8, py, 8, TILE);
    }
    if (col === 35 && row >= 17 && row <= 21) {
      g.fillStyle(NEON_BLUE, 0.7); g.fillRect(px, py, 2, TILE);
      g.fillStyle(NEON_BLUE, 0.1); g.fillRect(px, py, 8, TILE);
    }
    if (row === 17) {
      g.fillStyle(NEON_BLUE, 0.7); g.fillRect(px, py + TILE - 2, TILE, 2);
      g.fillStyle(NEON_BLUE, 0.08); g.fillRect(px, py + TILE - 8, TILE, 8);
    }
  }

  drawCryptoDojoDoor(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    g.fillStyle(0x0a1020); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x0c1830); g.fillRect(px + 2, py + 1, 28, 31);
    g.fillStyle(0x102850); g.fillRect(px + 4, py + 2, 24, 29);
    g.fillStyle(0x183870); g.fillRect(px + 6, py + 3, 20, 27);
    g.fillStyle(0x2050a0); g.fillRect(px + 8, py + 4, 16, 25);
    g.fillStyle(0x3070cc); g.fillRect(px + 9, py + 5, 14, 23);
    g.fillStyle(0x4090e0); g.fillRect(px + 10, py + 6, 12, 21);
    g.fillStyle(0x60b0ff); g.fillRect(px + 11, py + 7, 10, 19);
    g.fillStyle(0x80ccff); g.fillRect(px + 12, py + 9, 8, 15);
    g.fillStyle(0xc0e8ff); g.fillRect(px + 13, py + 12, 6, 9);

    g.fillStyle(0x000000, 0.08);
    for (let sl = 0; sl < 30; sl += 3) g.fillRect(px + 2, py + 1 + sl, 28, 1);

    const bx = px + 11; const by = py + 6;
    g.fillStyle(0x2040a0, 0.7);
    g.fillRect(bx + 1, by, 2, 16); g.fillRect(bx + 5, by, 2, 16);
    g.fillRect(bx, by + 1, 8, 2); g.fillRect(bx, by + 7, 8, 2); g.fillRect(bx, by + 13, 8, 2);

    g.fillStyle(NEON_BLUE);
    g.fillRect(px + 2, py + 1, 2, 31); g.fillRect(px + 28, py + 1, 2, 31);
    g.fillRect(px + 2, py + 1, 28, 2);
    g.fillStyle(NEON_BLUE, 0.15); g.fillRect(px - 2, py - 3, 36, 38);
  }

  drawDoorGlow2(g: Phaser.GameObjects.Graphics) {
    const cx = DOOR2_COL * TILE + TILE / 2;
    const cy = DOOR2_ROW * TILE + TILE / 2;
    g.fillStyle(NEON_BLUE, 0.012); g.fillRect(cx - 140, cy - 120, 280, 240);
    g.fillStyle(NEON_BLUE, 0.02);  g.fillRect(cx - 100, cy - 90, 200, 180);
    g.fillStyle(NEON_BLUE, 0.035); g.fillRect(cx - 70, cy - 60, 140, 120);
    g.fillStyle(NEON_BLUE, 0.06);  g.fillRect(cx - 44, cy - 40, 88, 80);
    g.fillStyle(NEON_BLUE, 0.09);  g.fillRect(cx - 28, cy - 24, 56, 48);
    g.fillStyle(NEON_BLUE, 0.12);  g.fillRect(cx - 16, cy - 12, 32, 24);
  }

  drawCryptoDojoRoof(g: Phaser.GameObjects.Graphics) {
    const roofLeft = 29 * TILE;
    const roofY = 17 * TILE;
    const roofW = 7 * TILE;
    g.fillStyle(0x0a0e18); g.fillRect(roofLeft, roofY - 6, roofW, 8);
    g.fillStyle(0x101828); g.fillRect(roofLeft, roofY - 4, roofW, 6);
    g.fillStyle(NEON_BLUE, 0.9); g.fillRect(roofLeft, roofY - 2, roofW, 2);
    g.fillStyle(NEON_BLUE);
    g.fillRect(roofLeft + 2, roofY - 4, 4, 4);
    g.fillRect(roofLeft + roofW - 6, roofY - 4, 4, 4);
    g.fillStyle(NEON_BLUE, 0.2);
    g.fillRect(roofLeft - 2, roofY - 8, 10, 12);
    g.fillRect(roofLeft + roofW - 8, roofY - 8, 10, 12);
  }

  // ── Practical Dojo Drawing ──────────────────────────────

  drawPracticalDojoWall(g: Phaser.GameObjects.Graphics, px: number, py: number, row: number, col: number) {
    g.fillStyle(0x081408); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x0c1c10);
    g.fillRect(px, py + 8, TILE, 1);
    g.fillRect(px, py + 16, TILE, 1);
    g.fillRect(px, py + 24, TILE, 1);
    g.fillStyle(0x081408); g.fillRect(px + 16, py, 1, TILE);

    // Windows on side walls
    if (row >= 18 && row <= 20) {
      if (col === 1) {
        g.fillStyle(0x0c1c10); g.fillRect(px + 16, py + 6, 14, 12);
        g.fillStyle(0x103820); g.fillRect(px + 17, py + 7, 12, 10);
        g.fillStyle(0x208040); g.fillRect(px + 18, py + 8, 10, 8);
        g.fillStyle(0x0c1c10);
        g.fillRect(px + 22, py + 7, 1, 10);
        g.fillRect(px + 17, py + 12, 12, 1);
        g.fillStyle(NEON_GREEN, 0.08); g.fillRect(px + 12, py + 2, 20, 20);
      }
      if (col === 7) {
        g.fillStyle(0x0c1c10); g.fillRect(px + 2, py + 6, 14, 12);
        g.fillStyle(0x103820); g.fillRect(px + 3, py + 7, 12, 10);
        g.fillStyle(0x208040); g.fillRect(px + 4, py + 8, 10, 8);
        g.fillStyle(0x0c1c10);
        g.fillRect(px + 9, py + 7, 1, 10);
        g.fillRect(px + 3, py + 12, 12, 1);
        g.fillStyle(NEON_GREEN, 0.08); g.fillRect(px, py + 2, 20, 20);
      }
    }

    // Green neon trim on dojo edges
    if (col === 1 && row >= 17 && row <= 21) {
      g.fillStyle(NEON_GREEN, 0.7); g.fillRect(px + TILE - 2, py, 2, TILE);
      g.fillStyle(NEON_GREEN, 0.1); g.fillRect(px + TILE - 8, py, 8, TILE);
    }
    if (col === 7 && row >= 17 && row <= 21) {
      g.fillStyle(NEON_GREEN, 0.7); g.fillRect(px, py, 2, TILE);
      g.fillStyle(NEON_GREEN, 0.1); g.fillRect(px, py, 8, TILE);
    }
    if (row === 17) {
      g.fillStyle(NEON_GREEN, 0.7); g.fillRect(px, py + TILE - 2, TILE, 2);
      g.fillStyle(NEON_GREEN, 0.08); g.fillRect(px, py + TILE - 8, TILE, 8);
    }
  }

  drawPracticalDojoDoor(g: Phaser.GameObjects.Graphics, px: number, py: number) {
    g.fillStyle(0x081408); g.fillRect(px, py, TILE, TILE);
    g.fillStyle(0x0c2e14); g.fillRect(px + 2, py + 1, 28, 31);
    g.fillStyle(0x104020); g.fillRect(px + 4, py + 2, 24, 29);
    g.fillStyle(0x185830); g.fillRect(px + 6, py + 3, 20, 27);
    g.fillStyle(0x207040); g.fillRect(px + 8, py + 4, 16, 25);
    g.fillStyle(0x308850); g.fillRect(px + 9, py + 5, 14, 23);
    g.fillStyle(0x40a060); g.fillRect(px + 10, py + 6, 12, 21);
    g.fillStyle(0x60c080); g.fillRect(px + 11, py + 7, 10, 19);
    g.fillStyle(0x80dda0); g.fillRect(px + 12, py + 9, 8, 15);
    g.fillStyle(0xc0ffd0); g.fillRect(px + 13, py + 12, 6, 9);

    g.fillStyle(0x000000, 0.08);
    for (let sl = 0; sl < 30; sl += 3) g.fillRect(px + 2, py + 1 + sl, 28, 1);

    const bx = px + 11; const by = py + 6;
    g.fillStyle(0x206840, 0.7);
    g.fillRect(bx + 2, by, 2, 16);
    g.fillRect(bx + 0, by + 2, 6, 2);
    g.fillRect(bx + 0, by + 7, 6, 2);
    g.fillRect(bx + 0, by + 12, 6, 2);
    g.fillRect(bx + 5, by + 3, 2, 5);
    g.fillRect(bx + 5, by + 9, 2, 5);

    g.fillStyle(NEON_GREEN);
    g.fillRect(px + 2, py + 1, 2, 31); g.fillRect(px + 28, py + 1, 2, 31);
    g.fillRect(px + 2, py + 1, 28, 2);
    g.fillStyle(NEON_GREEN, 0.15); g.fillRect(px - 2, py - 3, 36, 38);
  }

  drawDoorGlow3(g: Phaser.GameObjects.Graphics) {
    const cx = DOOR3_COL * TILE + TILE / 2;
    const cy = DOOR3_ROW * TILE + TILE / 2;
    g.fillStyle(NEON_GREEN, 0.012); g.fillRect(cx - 140, cy - 120, 280, 240);
    g.fillStyle(NEON_GREEN, 0.02);  g.fillRect(cx - 100, cy - 90, 200, 180);
    g.fillStyle(NEON_GREEN, 0.035); g.fillRect(cx - 70, cy - 60, 140, 120);
    g.fillStyle(NEON_GREEN, 0.06);  g.fillRect(cx - 44, cy - 40, 88, 80);
    g.fillStyle(NEON_GREEN, 0.09);  g.fillRect(cx - 28, cy - 24, 56, 48);
    g.fillStyle(NEON_GREEN, 0.12);  g.fillRect(cx - 16, cy - 12, 32, 24);
  }

  drawPracticalDojoRoof(g: Phaser.GameObjects.Graphics) {
    const roofLeft = 1 * TILE;
    const roofY = 17 * TILE;
    const roofW = 7 * TILE;
    g.fillStyle(0x081408); g.fillRect(roofLeft, roofY - 6, roofW, 8);
    g.fillStyle(0x102810); g.fillRect(roofLeft, roofY - 4, roofW, 6);
    g.fillStyle(NEON_GREEN, 0.9); g.fillRect(roofLeft, roofY - 2, roofW, 2);
    g.fillStyle(NEON_GREEN);
    g.fillRect(roofLeft + 2, roofY - 4, 4, 4);
    g.fillRect(roofLeft + roofW - 6, roofY - 4, 4, 4);
    g.fillStyle(NEON_GREEN, 0.2);
    g.fillRect(roofLeft - 2, roofY - 8, 10, 12);
    g.fillRect(roofLeft + roofW - 8, roofY - 8, 10, 12);
  }

  // ── NPCs ──────────────────────────────────────────────────

  createNPCs() {
    this.npcContainers = new Map();
    for (const npc of NPCS) {
      const px = npc.gridX * TILE + TILE / 2;
      const py = npc.gridY * TILE + TILE / 2;
      const container = this.add.container(px, py);
      const g = this.add.graphics();
      this.drawNPC(g, 0, 0, npc);
      container.add(g);

      // Name label above NPC
      const label = this.add.text(0, -28, npc.name, {
        fontSize: '6px', color: '#' + npc.color.toString(16).padStart(6, '0'),
        fontFamily: '"Press Start 2P", monospace',
        backgroundColor: '#06080ecc', padding: { x: 4, y: 2 },
      }).setOrigin(0.5, 1);
      container.add(label);

      container.setDepth(9);
      this.npcContainers.set(npc.id, container);
    }
  }

  drawNPC(g: Phaser.GameObjects.Graphics, cx: number, cy: number, npc: NPCDef) {
    g.clear();

    // Shadow
    g.fillStyle(0x000000, 0.5); g.fillEllipse(cx, cy + 14, 18, 5);

    if (npc.id === 'cash-saver') {
      this.drawCashSaver(g, cx, cy);
    } else if (npc.id === 'gold-bug') {
      this.drawGoldBug(g, cx, cy);
    } else if (npc.id === 'bitcoin-miner') {
      this.drawBitcoinMiner(g, cx, cy);
    }
  }

  drawCashSaver(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
    // Worn shoes
    g.fillStyle(0x1a1810); g.fillRect(cx - 7, cy + 8, 6, 7); g.fillRect(cx + 1, cy + 8, 6, 7);
    // Faded jeans
    g.fillStyle(0x1a2030); g.fillRect(cx - 6, cy + 1, 5, 8); g.fillRect(cx + 1, cy + 1, 5, 8);
    // Green hoodie — worn
    g.fillStyle(0x1a3820); g.fillRect(cx - 7, cy - 10, 14, 12);
    g.fillStyle(0x244a2c); g.fillRect(cx - 6, cy - 9, 12, 10);
    // Hoodie pocket
    g.fillStyle(0x163018); g.fillRect(cx - 4, cy - 2, 8, 4);
    // Arms hunched (slightly forward)
    g.fillStyle(0x1a3820); g.fillRect(cx - 9, cy - 8, 3, 9); g.fillRect(cx + 6, cy - 8, 3, 9);
    // Dollar bill poking from pocket — green
    g.fillStyle(NEON_GREEN, 0.6); g.fillRect(cx - 2, cy - 3, 5, 2);
    g.fillStyle(0x88ff88, 0.4); g.fillRect(cx - 1, cy - 3, 1, 1);
    // Hood up — worried
    g.fillStyle(0x163018); g.fillRect(cx - 7, cy - 22, 14, 14);
    g.fillStyle(0x0e2010); g.fillRect(cx - 5, cy - 20, 10, 10);
    // Face — stressed
    g.fillStyle(0xaa8858); g.fillRect(cx - 4, cy - 18, 8, 8);
    g.fillStyle(0x0a1008, 0.6); g.fillRect(cx - 4, cy - 18, 8, 3);
    // Worried eyes — green tint
    g.fillStyle(NEON_GREEN, 0.4); g.fillRect(cx - 4, cy - 15, 3, 3); g.fillRect(cx + 1, cy - 15, 3, 3);
    g.fillStyle(NEON_GREEN); g.fillRect(cx - 3, cy - 14, 2, 2); g.fillRect(cx + 1, cy - 14, 2, 2);
    g.fillStyle(0xccffcc); g.fillRect(cx - 3, cy - 14, 1, 1); g.fillRect(cx + 1, cy - 14, 1, 1);
    // Frown
    g.fillStyle(0x664422); g.fillRect(cx - 2, cy - 11, 4, 1);
    // Neon accent glow
    g.fillStyle(NEON_GREEN, 0.05); g.fillRect(cx - 10, cy - 24, 20, 40);
  }

  drawGoldBug(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
    // Heavy boots
    g.fillStyle(0x2a2010); g.fillRect(cx - 8, cy + 8, 7, 7); g.fillRect(cx + 1, cy + 8, 7, 7);
    g.fillStyle(0xffd700, 0.15); g.fillRect(cx - 8, cy + 8, 7, 1); g.fillRect(cx + 1, cy + 8, 7, 1);
    // Sturdy pants
    g.fillStyle(0x2a2818); g.fillRect(cx - 7, cy + 1, 6, 8); g.fillRect(cx + 1, cy + 1, 6, 8);
    // Golden vest/coat — rich but heavy
    g.fillStyle(0x3a2c10); g.fillRect(cx - 8, cy - 10, 16, 12);
    g.fillStyle(0x4a3c18); g.fillRect(cx - 7, cy - 9, 14, 10);
    // Gold trim
    g.fillStyle(0xffd700, 0.6); g.fillRect(cx - 8, cy - 10, 1, 12);
    g.fillStyle(0xffd700, 0.6); g.fillRect(cx + 7, cy - 10, 1, 12);
    g.fillStyle(0xffd700, 0.4); g.fillRect(cx - 1, cy - 9, 2, 10);
    // Arms — bulky, carrying something heavy
    g.fillStyle(0x3a2c10); g.fillRect(cx - 10, cy - 8, 3, 10); g.fillRect(cx + 7, cy - 8, 3, 10);
    // Gold bar in hand
    g.fillStyle(0xccaa00); g.fillRect(cx + 7, cy - 1, 5, 3);
    g.fillStyle(0xffd700); g.fillRect(cx + 7, cy - 1, 5, 1);
    g.fillStyle(0xffee88); g.fillRect(cx + 8, cy - 1, 1, 1);
    // Head — round, prosperous
    g.fillStyle(0xbb9968); g.fillRect(cx - 5, cy - 22, 10, 12);
    g.fillStyle(0xd4aa78); g.fillRect(cx - 4, cy - 21, 8, 10);
    // Top hat silhouette
    g.fillStyle(0x1a1408); g.fillRect(cx - 6, cy - 28, 12, 3);
    g.fillStyle(0x2a2010); g.fillRect(cx - 4, cy - 32, 8, 7);
    g.fillStyle(0x3a3018); g.fillRect(cx - 3, cy - 31, 6, 5);
    // Hat band — gold
    g.fillStyle(0xffd700, 0.7); g.fillRect(cx - 4, cy - 26, 8, 1);
    // Eyes — gold
    g.fillStyle(0xffd700, 0.4); g.fillRect(cx - 4, cy - 19, 3, 3); g.fillRect(cx + 1, cy - 19, 3, 3);
    g.fillStyle(0xffd700); g.fillRect(cx - 3, cy - 18, 2, 2); g.fillRect(cx + 1, cy - 18, 2, 2);
    g.fillStyle(0xffeeaa); g.fillRect(cx - 3, cy - 18, 1, 1); g.fillRect(cx + 1, cy - 18, 1, 1);
    // Mustache
    g.fillStyle(0x4a3c18); g.fillRect(cx - 3, cy - 14, 6, 2);
    g.fillStyle(0x3a2c10); g.fillRect(cx - 4, cy - 13, 2, 2); g.fillRect(cx + 2, cy - 13, 2, 2);
    // Gold glow
    g.fillStyle(0xffd700, 0.05); g.fillRect(cx - 12, cy - 34, 24, 50);
  }

  drawBitcoinMiner(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
    // Tech boots with cyan trim
    g.fillStyle(0x0c0e14); g.fillRect(cx - 7, cy + 8, 6, 7); g.fillRect(cx + 1, cy + 8, 6, 7);
    g.fillStyle(NEON_CYAN, 0.3); g.fillRect(cx - 7, cy + 13, 6, 1); g.fillRect(cx + 1, cy + 13, 6, 1);
    // Cargo pants
    g.fillStyle(0x18181e); g.fillRect(cx - 6, cy + 1, 5, 8); g.fillRect(cx + 1, cy + 1, 5, 8);
    g.fillStyle(NEON_CYAN, 0.1); g.fillRect(cx - 6, cy + 3, 1, 5);
    // Tech jacket — orange with cyan accents
    g.fillStyle(0x1a1008); g.fillRect(cx - 7, cy - 10, 14, 12);
    g.fillStyle(0x2a1c0c); g.fillRect(cx - 6, cy - 9, 12, 10);
    // Orange neon stripe
    g.fillStyle(NEON_ORANGE, 0.5); g.fillRect(cx - 7, cy - 6, 14, 1);
    // Cyan tech lines
    g.fillStyle(NEON_CYAN, 0.4); g.fillRect(cx + 5, cy - 9, 1, 10);
    g.fillStyle(NEON_CYAN, 0.3); g.fillRect(cx - 6, cy - 3, 12, 1);
    // ₿ on chest
    g.fillStyle(NEON_ORANGE, 0.7);
    g.fillRect(cx - 2, cy - 7, 1, 5); g.fillRect(cx + 1, cy - 7, 1, 5);
    g.fillRect(cx - 3, cy - 6, 5, 1); g.fillRect(cx - 3, cy - 4, 5, 1);
    // Arms
    g.fillStyle(0x1a1008); g.fillRect(cx - 9, cy - 8, 3, 9); g.fillRect(cx + 6, cy - 8, 3, 9);
    g.fillStyle(NEON_CYAN, 0.2); g.fillRect(cx - 9, cy - 2, 3, 1);
    // Headset/visor
    g.fillStyle(0x0e1018); g.fillRect(cx - 6, cy - 22, 12, 13);
    g.fillStyle(0x141820); g.fillRect(cx - 5, cy - 21, 10, 11);
    // Face
    g.fillStyle(0xaa8858); g.fillRect(cx - 4, cy - 18, 8, 7);
    g.fillStyle(0x0a0e14, 0.4); g.fillRect(cx - 4, cy - 18, 8, 2);
    // Visor band across eyes — cyan glow
    g.fillStyle(0x0a1418); g.fillRect(cx - 6, cy - 17, 12, 4);
    g.fillStyle(NEON_CYAN, 0.5); g.fillRect(cx - 5, cy - 16, 10, 2);
    g.fillStyle(NEON_CYAN, 0.9); g.fillRect(cx - 4, cy - 16, 3, 2); g.fillRect(cx + 1, cy - 16, 3, 2);
    g.fillStyle(0xffffff, 0.6); g.fillRect(cx - 3, cy - 16, 1, 1); g.fillRect(cx + 2, cy - 16, 1, 1);
    // Visor glow
    g.fillStyle(NEON_CYAN, 0.08); g.fillRect(cx - 8, cy - 19, 16, 8);
    // Antenna on headset
    g.fillStyle(0x181c24); g.fillRect(cx + 5, cy - 24, 2, 6);
    g.fillStyle(NEON_ORANGE); g.fillRect(cx + 5, cy - 24, 2, 1);
    g.fillStyle(NEON_ORANGE, 0.2); g.fillRect(cx + 4, cy - 25, 4, 3);
    // Confident smirk
    g.fillStyle(0x886644); g.fillRect(cx - 1, cy - 12, 3, 1);
    // Overall glow
    g.fillStyle(NEON_ORANGE, 0.03); g.fillRect(cx - 10, cy - 26, 20, 44);
    g.fillStyle(NEON_CYAN, 0.03); g.fillRect(cx - 10, cy - 26, 20, 44);
  }

  // ── ATMOSPHERE ────────────────────────────────────────────

  initAtmosphere() {
    this.rainDrops = [];
    for (let i = 0; i < 300; i++) this.rainDrops.push(this.createRainDrop());
    this.rainGraphics = this.add.graphics().setDepth(15);

    this.puddles = [];
    // Spread puddles across the larger map
    const puddleSpots = [
      { x: 2,  y: 3 }, { x: 8,  y: 4 }, { x: 15, y: 5 }, { x: 25, y: 3 }, { x: 32, y: 4 },
      { x: 5,  y: 14 }, { x: 13, y: 13 }, { x: 26, y: 15 }, { x: 35, y: 14 },
      { x: 3,  y: 24 }, { x: 12, y: 23 }, { x: 24, y: 25 }, { x: 30, y: 24 }, { x: 37, y: 23 },
      { x: 2,  y: 9 }, { x: 36, y: 9 }, { x: 8,  y: 19 }, { x: 28, y: 19 },
    ];
    const puddleColors = [NEON_CYAN, NEON_ORANGE, NEON_MAGENTA, NEON_PINK, NEON_BLUE, NEON_GREEN];
    for (let i = 0; i < puddleSpots.length; i++) {
      const s = puddleSpots[i];
      this.puddles.push({
        x: s.x * TILE + 4, y: s.y * TILE + 8,
        w: 18 + (i % 3) * 6, h: 5 + (i % 2),
        shimmerPhase: Math.random() * Math.PI * 2,
        color: puddleColors[i % puddleColors.length],
      });
    }
    this.puddleGraphics = this.add.graphics().setDepth(3);
    this.neonGraphics = this.add.graphics().setDepth(4);
    this.fogGraphics = this.add.graphics().setDepth(14);
  }

  createRainDrop(): RainDrop {
    return {
      x: Math.random() * COLS * TILE,
      y: Math.random() * ROWS * TILE - ROWS * TILE,
      speed: 180 + Math.random() * 120,
      length: 4 + Math.random() * 8,
      alpha: 0.15 + Math.random() * 0.25,
    };
  }

  updateAtmosphere(delta: number) {
    this.elapsedTime += delta / 1000;

    const cam = this.cameras.main;
    const camL = cam.scrollX - TILE * 2;
    const camT = cam.scrollY - TILE * 2;
    const camR = cam.scrollX + cam.width + TILE * 2;
    const camB = cam.scrollY + cam.height + TILE * 2;

    // Rain
    const rg = this.rainGraphics;
    rg.clear();
    for (const drop of this.rainDrops) {
      drop.y += drop.speed * (delta / 1000);
      drop.x += 12 * (delta / 1000);
      if (drop.y > ROWS * TILE) { Object.assign(drop, this.createRainDrop()); drop.y = -drop.length; }
      if (drop.x > COLS * TILE) drop.x -= COLS * TILE;
      // Camera cull
      if (drop.x < camL || drop.x > camR || drop.y < camT || drop.y > camB) continue;
      rg.fillStyle(0x8899cc, drop.alpha);
      rg.fillRect(drop.x, drop.y, 1, drop.length);
    }

    // Puddle shimmer
    const pg = this.puddleGraphics;
    pg.clear();
    for (const puddle of this.puddles) {
      if (puddle.x + puddle.w < camL || puddle.x > camR || puddle.y + puddle.h < camT || puddle.y > camB) continue;
      puddle.shimmerPhase += delta / 1000 * 1.5;
      const shimmer = Math.sin(puddle.shimmerPhase) * 0.5 + 0.5;
      const alpha = 0.04 + shimmer * 0.08;
      pg.fillStyle(0x0c1420, 0.5); pg.fillRect(puddle.x - 1, puddle.y - 1, puddle.w + 2, puddle.h + 2);
      pg.fillStyle(puddle.color, alpha); pg.fillRect(puddle.x, puddle.y, puddle.w, puddle.h);
      const hlX = puddle.x + Math.floor(shimmer * (puddle.w - 4));
      pg.fillStyle(puddle.color, alpha + 0.06); pg.fillRect(hlX, puddle.y + 1, 4, puddle.h - 2);
    }

    // Neon flicker
    const ng = this.neonGraphics;
    ng.clear();
    for (const sign of this.neonSigns) {
      if (sign.x + sign.w < camL || sign.x > camR || sign.y + sign.h < camT || sign.y > camB) continue;
      const fv = Math.sin(this.elapsedTime * sign.flickerSpeed * 8) *
                 Math.sin(this.elapsedTime * sign.flickerSpeed * 13 + 1.7);
      const isFlicker = fv > 0.85;
      ng.fillStyle(sign.color, isFlicker ? 0.02 : 0.06);
      ng.fillRect(sign.x - 4, sign.y - 2, sign.w + 8, sign.h + 4);
    }

    // Fog bands
    const fg = this.fogGraphics;
    fg.clear();
    const fogOffset = (this.elapsedTime * 6) % (COLS * TILE);
    for (let i = 0; i < 8; i++) {
      const fy = 3 * TILE + i * 4 * TILE + Math.sin(this.elapsedTime * 0.3 + i) * 8;
      if (fy < camT - 20 || fy > camB + 20) continue;
      const fx = -COLS * TILE + fogOffset + i * 120;
      fg.fillStyle(0x1a2440, 0.04);
      fg.fillRect(fx % (COLS * TILE + 100) - 50, fy, 160, 6);
    }
  }

  // ── PLAYER ────────────────────────────────────────────────

  createPlayer() {
    const px = this.playerGridX * TILE + TILE / 2;
    const py = this.playerGridY * TILE + TILE / 2;
    this.playerContainer = this.add.container(px, py);
    this.playerGraphics  = this.add.graphics();
    this.drawPlayer(this.playerGraphics, 0, 0);
    this.playerContainer.add(this.playerGraphics);
    this.playerContainer.setDepth(10);
  }

  drawPlayer(g: Phaser.GameObjects.Graphics, cx: number, cy: number) {
    g.clear();
    g.fillStyle(0x000000, 0.5); g.fillEllipse(cx, cy + 14, 18, 5);
    g.fillStyle(NEON_ORANGE, 0.06); g.fillEllipse(cx, cy + 14, 14, 4);

    // Boots
    g.fillStyle(0x0a0c10); g.fillRect(cx - 7, cy + 8, 6, 7); g.fillRect(cx + 1, cy + 8, 6, 7);
    g.fillStyle(NEON_ORANGE, 0.2); g.fillRect(cx - 7, cy + 8, 6, 1); g.fillRect(cx + 1, cy + 8, 6, 1);
    g.fillStyle(NEON_CYAN, 0.1); g.fillRect(cx - 7, cy + 13, 6, 1); g.fillRect(cx + 1, cy + 13, 6, 1);
    // Legs
    g.fillStyle(0x14151e); g.fillRect(cx - 6, cy + 1, 5, 8); g.fillRect(cx + 1, cy + 1, 5, 8);
    g.fillStyle(0x1e2030); g.fillRect(cx - 6, cy + 1, 1, 7); g.fillRect(cx + 5, cy + 1, 1, 7);
    // Body
    g.fillStyle(0x0e0f14); g.fillRect(cx - 7, cy - 10, 14, 12);
    g.fillStyle(0x181920); g.fillRect(cx - 6, cy - 9, 12, 10);
    g.fillStyle(NEON_ORANGE, 0.2); g.fillRect(cx - 7, cy - 10, 1, 12);
    g.fillStyle(NEON_CYAN, 0.08); g.fillRect(cx + 6, cy - 10, 1, 12);
    g.fillStyle(0x12131a); g.fillRect(cx - 4, cy - 10, 8, 3);
    // Arms
    g.fillStyle(0x0e0f14); g.fillRect(cx - 9, cy - 9, 3, 8); g.fillRect(cx + 6, cy - 9, 3, 8);
    // Hood
    g.fillStyle(0x0a0b10); g.fillRect(cx - 7, cy - 22, 14, 14);
    g.fillStyle(0x050608); g.fillRect(cx - 5, cy - 20, 10, 10);
    // Face
    g.fillStyle(0xaa8858); g.fillRect(cx - 4, cy - 18, 8, 8);
    g.fillStyle(0x070809, 0.75); g.fillRect(cx - 4, cy - 18, 8, 4);
    // Glowing eyes
    g.fillStyle(NEON_ORANGE, 0.4); g.fillRect(cx - 4, cy - 15, 4, 3); g.fillRect(cx, cy - 15, 4, 3);
    g.fillStyle(NEON_ORANGE); g.fillRect(cx - 3, cy - 14, 2, 2); g.fillRect(cx + 1, cy - 14, 2, 2);
    g.fillStyle(0xffd0a0); g.fillRect(cx - 3, cy - 14, 1, 1); g.fillRect(cx + 1, cy - 14, 1, 1);
    g.fillStyle(NEON_ORANGE, 0.06); g.fillRect(cx - 6, cy - 17, 12, 8);
  }

  // ── UI ────────────────────────────────────────────────────

  createUI() {
    this.interactPrompt = this.add.text(0, 0, '', {
      fontSize: '8px', color: '#F7931A',
      fontFamily: '"Press Start 2P", monospace',
      backgroundColor: '#06080ecc', padding: { x: 6, y: 3 },
    }).setVisible(false).setDepth(20);

    this.add.text(4, 500, 'Arrow keys / WASD to move  |  SPACE: interact  |  ESC: pause', {
      fontSize: '7px', color: '#1e2840', fontFamily: 'monospace',
    }).setDepth(20).setScrollFactor(0);
  }

  setupControls() {
    this.cursors  = this.input.keyboard!.createCursorKeys();
    this.upKey    = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.downKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.leftKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  // ── GAME LOOP ─────────────────────────────────────────────

  getAdjacentNPC(): NPCDef | null {
    for (const npc of NPCS) {
      const dx = Math.abs(this.playerGridX - npc.gridX);
      const dy = Math.abs(this.playerGridY - npc.gridY);
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) return npc;
    }
    return null;
  }

  isNearDoor(): 1 | 2 | 3 | 0 {
    const py = this.playerGridY;
    const px = this.playerGridX;
    if (py === DOOR_ROW + 1 && px === DOOR_COL) return 1;
    if (py === DOOR2_ROW + 1 && px === DOOR2_COL) return 2;
    if (py === DOOR3_ROW + 1 && px === DOOR3_COL) return 3;
    return 0;
  }

  update(_time: number, delta: number) {
    // Always update atmosphere (rain, fog, etc.) even when input is blocked
    this.updateAtmosphere(delta);

    if (this.enteringDojo || this.blockInput) return;

    // NPC proximity
    const nearNpc = this.getAdjacentNPC();
    const nearDoor = this.isNearDoor();

    if (nearNpc) {
      this.interactPrompt.setText('▶ SPACE: Talk');
      this.interactPrompt.setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32);
      this.interactPrompt.setVisible(true);
    } else if (nearDoor === 1) {
      this.interactPrompt.setText('▶ Enter Dojo');
      this.interactPrompt.setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32);
      this.interactPrompt.setVisible(true);
    } else if (nearDoor === 2) {
      this.interactPrompt.setText('▶ Enter Dojo');
      this.interactPrompt.setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32);
      this.interactPrompt.setVisible(true);
    } else if (nearDoor === 3) {
      this.interactPrompt.setText('▶ Enter Dojo');
      this.interactPrompt.setPosition(this.playerContainer.x - 36, this.playerContainer.y - 32);
      this.interactPrompt.setVisible(true);
    } else {
      this.interactPrompt.setVisible(false);
    }

    // SPACE key interactions
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (nearNpc) {
        EventBus.emit('npcDialogue', { npcId: nearNpc.id, npcName: nearNpc.name });
      }
    }

    // Movement
    let dx = 0, dy = 0;
    if      (this.cursors.up!.isDown    || this.upKey.isDown)    dy = -1;
    else if (this.cursors.down!.isDown  || this.downKey.isDown)  dy =  1;
    else if (this.cursors.left!.isDown  || this.leftKey.isDown)  dx = -1;
    else if (this.cursors.right!.isDown || this.rightKey.isDown) dx =  1;

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
    const newX = this.playerGridX + dx;
    const newY = this.playerGridY + dy;
    if (newY < 0 || newY >= ROWS || newX < 0 || newX >= COLS) return;
    const tile = MAP[newY][newX];
    if (tile === 1 || tile === 2 || tile === 6 || tile === 8 || tile === 10) return;
    // NPC collision
    if (NPCS.some(npc => npc.gridX === newX && npc.gridY === newY)) return;

    this.playerGridX = newX; this.playerGridY = newY; this.isMoving = true;
    AudioManager.playFootstep();
    this.tweens.add({
      targets: this.playerContainer,
      x: newX * TILE + TILE / 2, y: newY * TILE + TILE / 2,
      duration: 140, ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        // Auto-enter dojo when stepping on door tile
        if (newY === DOOR_ROW && newX === DOOR_COL) this.enterDojo();
        if (newY === DOOR2_ROW && newX === DOOR2_COL) this.enterDojo2();
        if (newY === DOOR3_ROW && newX === DOOR3_COL) this.enterDojo3();
      },
    });
  }

  enterDojo() {
    this.enteringDojo = true;
    this.lastDojo = 1;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.switch('DojoScene');
    });
  }

  enterDojo2() {
    this.enteringDojo = true;
    this.lastDojo = 2;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.switch('CryptoDojo');
    });
  }

  enterDojo3() {
    this.enteringDojo = true;
    this.lastDojo = 3;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.switch('PracticalDojo');
    });
  }
}
