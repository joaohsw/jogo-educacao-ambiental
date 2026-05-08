import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import {
  INTERACTION_RADIUS,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  SCENE_KEYS
} from "../constants";
import { mapStations, type MapStation } from "../data/mapStations";
import { gameStore } from "../state/GameStore";

/* ================================================================== */
/*  MapScene – top-down navigable map that serves as the game hub      */
/* ================================================================== */

interface StationRuntime {
  data: MapStation;
  body: Phaser.GameObjects.Rectangle;
  promptText: Phaser.GameObjects.Text;
  checkMark?: Phaser.GameObjects.Text;
}

export class MapScene extends Phaser.Scene {
  /* ---- core objects ---- */
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Arc;
  private dirIndicator!: Phaser.GameObjects.Triangle;

  /* ---- input ---- */
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEnter!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  /* ---- stations ---- */
  private stations: StationRuntime[] = [];
  private activeStation: StationRuntime | null = null;

  /* ---- collision bodies (rectangles) ---- */
  private colliders: Phaser.Geom.Rectangle[] = [];

  /* ---- HUD ---- */
  private scoreHud!: Phaser.GameObjects.Text;

  /* ---- audio ---- */
  private audio!: GameAudio;

  /* ---- player facing direction for the indicator ---- */
  private facingAngle = Math.PI / 2; // default: facing down

  constructor() {
    super(SCENE_KEYS.map);
  }

  /* ================================================================ */
  /*  CREATE                                                          */
  /* ================================================================ */
  create(): void {
    this.audio = new GameAudio(this);
    this.stations = [];
    this.colliders = [];
    this.activeStation = null;

    this.drawTerrain();
    this.drawDecorations();
    this.buildStations();
    this.createPlayer();
    this.setupCamera();
    this.setupInput();
    this.createHud();

    // Listen for score changes to update completion marks
    gameStore.events.on("updated", this.refreshCompletionMarks, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameStore.events.off("updated", this.refreshCompletionMarks, this);
    });
  }

  /* ================================================================ */
  /*  UPDATE                                                          */
  /* ================================================================ */
  update(_time: number, delta: number): void {
    this.handleMovement(delta);
    this.checkProximity();
  }

  /* ================================================================ */
  /*  TERRAIN                                                         */
  /* ================================================================ */
  private drawTerrain(): void {
    const g = this.add.graphics();

    // Base grass
    g.fillStyle(0x4ade80, 1);
    g.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Grass variation patches
    g.fillStyle(0x22c55e, 0.5);
    for (let i = 0; i < 40; i++) {
      const px = Phaser.Math.Between(0, MAP_WIDTH);
      const py = Phaser.Math.Between(0, MAP_HEIGHT);
      g.fillCircle(px, py, Phaser.Math.Between(30, 90));
    }

    g.fillStyle(0x86efac, 0.35);
    for (let i = 0; i < 30; i++) {
      const px = Phaser.Math.Between(0, MAP_WIDTH);
      const py = Phaser.Math.Between(0, MAP_HEIGHT);
      g.fillCircle(px, py, Phaser.Math.Between(20, 60));
    }

    // Dirt paths connecting stations
    g.fillStyle(0xd4a574, 1);
    const pathW = 40;

    // Horizontal path middle
    g.fillRect(200, MAP_HEIGHT * 0.5 - pathW / 2, MAP_WIDTH - 400, pathW);
    // Vertical path middle
    g.fillRect(MAP_WIDTH * 0.5 - pathW / 2, 150, pathW, MAP_HEIGHT - 300);

    // Cross paths to stations
    g.fillRect(200, 280, MAP_WIDTH - 400, pathW * 0.7);      // top horizontal
    g.fillRect(200, 920, MAP_WIDTH - 400, pathW * 0.7);      // bottom horizontal
    g.fillRect(340, 150, pathW * 0.7, MAP_HEIGHT - 300);     // left vertical
    g.fillRect(1660, 150, pathW * 0.7, MAP_HEIGHT - 300);    // right vertical

    // Path texture (subtle darker spots)
    g.fillStyle(0xc19660, 0.4);
    for (let i = 0; i < 80; i++) {
      const px = Phaser.Math.Between(200, MAP_WIDTH - 200);
      const py = Phaser.Math.Between(150, MAP_HEIGHT - 150);
      g.fillCircle(px, py, Phaser.Math.Between(3, 8));
    }

    // Border fence
    const fenceColor = 0x78350f;
    const fenceW = 12;
    g.fillStyle(fenceColor, 0.9);
    g.fillRect(0, 0, MAP_WIDTH, fenceW);                    // top
    g.fillRect(0, MAP_HEIGHT - fenceW, MAP_WIDTH, fenceW);  // bottom
    g.fillRect(0, 0, fenceW, MAP_HEIGHT);                    // left
    g.fillRect(MAP_WIDTH - fenceW, 0, fenceW, MAP_HEIGHT);  // right

    // Fence posts
    g.fillStyle(0x451a03, 1);
    for (let x = 0; x < MAP_WIDTH; x += 80) {
      g.fillRect(x, 0, 6, fenceW + 4);
      g.fillRect(x, MAP_HEIGHT - fenceW - 4, 6, fenceW + 4);
    }
    for (let y = 0; y < MAP_HEIGHT; y += 80) {
      g.fillRect(0, y, fenceW + 4, 6);
      g.fillRect(MAP_WIDTH - fenceW - 4, y, fenceW + 4, 6);
    }

    // Add border colliders
    this.colliders.push(new Phaser.Geom.Rectangle(0, 0, MAP_WIDTH, fenceW + 4));         // top
    this.colliders.push(new Phaser.Geom.Rectangle(0, MAP_HEIGHT - fenceW - 4, MAP_WIDTH, fenceW + 4)); // bottom
    this.colliders.push(new Phaser.Geom.Rectangle(0, 0, fenceW + 4, MAP_HEIGHT));        // left
    this.colliders.push(new Phaser.Geom.Rectangle(MAP_WIDTH - fenceW - 4, 0, fenceW + 4, MAP_HEIGHT)); // right
  }

  /* ================================================================ */
  /*  DECORATIONS                                                     */
  /* ================================================================ */
  private drawDecorations(): void {
    // Trees scattered around
    const treePositions = [
      [120, 120], [550, 150], [850, 100], [1200, 180], [1850, 130],
      [130, 500], [750, 450], [1300, 500], [1870, 480],
      [100, 750], [600, 700], [1400, 750], [1880, 700],
      [150, 1050], [700, 1080], [1300, 1050], [1860, 1080],
      [500, 550], [900, 300], [1100, 700], [1500, 400]
    ];

    treePositions.forEach(([x, y]) => {
      // Shadow
      this.add.ellipse(x + 4, y + 20, 36, 16, 0x166534, 0.3);
      // Trunk
      this.add.rectangle(x, y, 10, 24, 0x78350f, 1).setOrigin(0.5);
      // Canopy
      this.add.circle(x, y - 16, 18, 0x15803d, 1);
      this.add.circle(x - 8, y - 10, 12, 0x16a34a, 0.9);
      this.add.circle(x + 8, y - 10, 12, 0x22c55e, 0.8);
    });

    // Flower patches
    const flowerColors = [0xfbbf24, 0xf472b6, 0xfb923c, 0xa78bfa];
    for (let i = 0; i < 50; i++) {
      const fx = Phaser.Math.Between(50, MAP_WIDTH - 50);
      const fy = Phaser.Math.Between(50, MAP_HEIGHT - 50);
      const color = flowerColors[i % flowerColors.length];
      this.add.circle(fx, fy, 3, color, 0.8);
    }
  }

  /* ================================================================ */
  /*  STATIONS (buildings)                                            */
  /* ================================================================ */
  private buildStations(): void {
    mapStations.forEach((station) => {
      const { x, y, width, height, color, borderColor, roofColor } = station;

      // Building shadow
      this.add.rectangle(x + 6, y + 8, width, height, 0x020617, 0.25).setOrigin(0.5);

      // Building body
      const body = this.add
        .rectangle(x, y, width, height, color, 0.95)
        .setOrigin(0.5)
        .setStrokeStyle(3, borderColor);

      // Roof (triangle-ish top bar)
      this.add.rectangle(x, y - height / 2 - 10, width + 20, 22, roofColor, 1).setOrigin(0.5);
      this.add.triangle(
        x, y - height / 2 - 26,
        -width / 2 - 14, 0,
        0, -18,
        width / 2 + 14, 0,
        roofColor, 1
      ).setOrigin(0.5);

      // Door
      this.add.rectangle(x, y + height / 2 - 16, 24, 32, 0x451a03, 1).setOrigin(0.5);
      this.add.circle(x + 8, y + height / 2 - 16, 3, 0xfbbf24, 1);

      // Window(s)
      if (width > 120) {
        this.add.rectangle(x - 30, y - 10, 22, 20, 0x7dd3fc, 0.8).setOrigin(0.5).setStrokeStyle(2, 0xffffff, 0.6);
        this.add.rectangle(x + 30, y - 10, 22, 20, 0x7dd3fc, 0.8).setOrigin(0.5).setStrokeStyle(2, 0xffffff, 0.6);
      } else {
        this.add.rectangle(x, y - 10, 22, 20, 0x7dd3fc, 0.8).setOrigin(0.5).setStrokeStyle(2, 0xffffff, 0.6);
      }

      // Icon (emoji)
      this.add.text(x, y - height / 2 - 48, station.icon, {
        fontSize: "32px"
      }).setOrigin(0.5);

      // Label
      this.add.text(x, y + height / 2 + 18, station.label, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "700",
        stroke: "#0f172a",
        strokeThickness: 4
      }).setOrigin(0.5);

      // Interaction prompt (hidden by default)
      const promptText = this.add
        .text(x, y - height / 2 - 72, "[ E ]  Entrar", {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: "20px",
          color: "#fef9c3",
          fontStyle: "700",
          backgroundColor: "#0f172acc",
          padding: { left: 12, right: 12, top: 6, bottom: 6 }
        })
        .setOrigin(0.5)
        .setDepth(50)
        .setVisible(false);

      // Collision rect for this building (slightly padded)
      const pad = 4;
      this.colliders.push(new Phaser.Geom.Rectangle(
        x - width / 2 - pad,
        y - height / 2 - pad,
        width + pad * 2,
        height + pad * 2
      ));

      const runtime: StationRuntime = { data: station, body, promptText };
      this.stations.push(runtime);
    });

    this.refreshCompletionMarks();
  }

  private refreshCompletionMarks(): void {
    this.stations.forEach((station) => {
      if (!station.data.miniGameId) return;

      const score = gameStore.getScores()[station.data.miniGameId];
      const isCompleted = score > 0;

      if (isCompleted && !station.checkMark) {
        station.checkMark = this.add
          .text(station.data.x + station.data.width / 2 + 8, station.data.y - station.data.height / 2 - 8, "✅", {
            fontSize: "24px"
          })
          .setOrigin(0.5)
          .setDepth(30);
      } else if (!isCompleted && station.checkMark) {
        station.checkMark.destroy();
        station.checkMark = undefined;
      }
    });

    // Update HUD score
    if (this.scoreHud) {
      this.scoreHud.setText(`⭐ ${gameStore.getTotalScore()} pts`);
    }
  }

  /* ================================================================ */
  /*  PLAYER                                                          */
  /* ================================================================ */
  private createPlayer(): void {
    // Restore position from registry if returning from a minigame
    const savedX = this.registry.get("playerX") as number | undefined;
    const savedY = this.registry.get("playerY") as number | undefined;
    const startX = savedX ?? MAP_WIDTH / 2;
    const startY = savedY ?? MAP_HEIGHT / 2;

    // Player body (circle)
    this.playerBody = this.add.circle(0, 0, PLAYER_RADIUS, 0xfbbf24, 1);
    this.playerBody.setStrokeStyle(2, 0x78350f);

    // Outline glow
    const glow = this.add.circle(0, 0, PLAYER_RADIUS + 3, 0xfde68a, 0.3);

    // Direction indicator (triangle pointing down by default)
    this.dirIndicator = this.add.triangle(
      0, PLAYER_RADIUS + 6,
      -6, 0,
      0, 8,
      6, 0,
      0xfbbf24, 1
    ).setOrigin(0.5);

    // Eyes
    const eyeL = this.add.circle(-5, -4, 2.5, 0x0f172a, 1);
    const eyeR = this.add.circle(5, -4, 2.5, 0x0f172a, 1);

    this.player = this.add.container(startX, startY, [glow, this.playerBody, this.dirIndicator, eyeL, eyeR]);
    this.player.setDepth(20);
  }

  /* ================================================================ */
  /*  CAMERA                                                          */
  /* ================================================================ */
  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(80, 60);
  }

  /* ================================================================ */
  /*  INPUT                                                           */
  /* ================================================================ */
  private setupInput(): void {
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyEnter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Interaction keys
    this.keyE.on("down", () => this.tryInteract());
    this.keyEnter.on("down", () => this.tryInteract());
    this.keySpace.on("down", () => this.tryInteract());
  }

  /* ================================================================ */
  /*  MOVEMENT + COLLISION                                            */
  /* ================================================================ */
  private handleMovement(delta: number): void {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left!.isDown || this.keyA.isDown) vx -= 1;
    if (this.cursors.right!.isDown || this.keyD.isDown) vx += 1;
    if (this.cursors.up!.isDown || this.keyW.isDown) vy -= 1;
    if (this.cursors.down!.isDown || this.keyS.isDown) vy += 1;

    if (vx === 0 && vy === 0) return;

    // Normalize diagonal
    const len = Math.sqrt(vx * vx + vy * vy);
    vx /= len;
    vy /= len;

    const speed = PLAYER_SPEED * (delta / 1000);
    let newX = this.player.x + vx * speed;
    let newY = this.player.y + vy * speed;

    // Resolve collisions
    const r = PLAYER_RADIUS + 2;
    for (const rect of this.colliders) {
      // Find nearest point on rect to new player pos
      const nearX = Phaser.Math.Clamp(newX, rect.x, rect.x + rect.width);
      const nearY = Phaser.Math.Clamp(newY, rect.y, rect.y + rect.height);

      const dx = newX - nearX;
      const dy = newY - nearY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < r && dist > 0) {
        // Push player out
        const overlap = r - dist;
        newX += (dx / dist) * overlap;
        newY += (dy / dist) * overlap;
      } else if (dist === 0) {
        // Player center is inside the rect — push out to nearest edge
        const toLeft = newX - rect.x;
        const toRight = rect.x + rect.width - newX;
        const toTop = newY - rect.y;
        const toBottom = rect.y + rect.height - newY;
        const minDist = Math.min(toLeft, toRight, toTop, toBottom);

        if (minDist === toLeft) newX = rect.x - r;
        else if (minDist === toRight) newX = rect.x + rect.width + r;
        else if (minDist === toTop) newY = rect.y - r;
        else newY = rect.y + rect.height + r;
      }
    }

    // Clamp to map bounds
    newX = Phaser.Math.Clamp(newX, r, MAP_WIDTH - r);
    newY = Phaser.Math.Clamp(newY, r, MAP_HEIGHT - r);

    this.player.setPosition(newX, newY);

    // Update direction indicator
    this.facingAngle = Math.atan2(vy, vx);
    this.dirIndicator.setPosition(
      Math.cos(this.facingAngle) * (PLAYER_RADIUS + 6),
      Math.sin(this.facingAngle) * (PLAYER_RADIUS + 6)
    );
    this.dirIndicator.setRotation(this.facingAngle - Math.PI / 2);
  }

  /* ================================================================ */
  /*  PROXIMITY CHECK                                                 */
  /* ================================================================ */
  private checkProximity(): void {
    let closest: StationRuntime | null = null;
    let closestDist = Infinity;

    for (const station of this.stations) {
      const dx = this.player.x - station.data.x;
      const dy = this.player.y - station.data.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < INTERACTION_RADIUS && dist < closestDist) {
        closest = station;
        closestDist = dist;
      }
    }

    if (this.activeStation && this.activeStation !== closest) {
      this.activeStation.promptText.setVisible(false);
      this.activeStation.body.setStrokeStyle(3, this.activeStation.data.borderColor);
    }

    this.activeStation = closest;

    if (closest) {
      closest.promptText.setVisible(true);
      closest.body.setStrokeStyle(3, 0xfbbf24);

      // Subtle bounce on the prompt
      const bounce = Math.sin(this.time.now / 300) * 3;
      closest.promptText.setY(closest.data.y - closest.data.height / 2 - 72 + bounce);
    }
  }

  /* ================================================================ */
  /*  INTERACTION                                                     */
  /* ================================================================ */
  private tryInteract(): void {
    if (!this.activeStation) return;

    const station = this.activeStation;
    this.audio.play("click");

    // Save player position so we can restore it later
    this.registry.set("playerX", this.player.x);
    this.registry.set("playerY", this.player.y);

    this.scene.start(station.data.sceneKey, station.data.sceneData);
  }

  /* ================================================================ */
  /*  HUD (fixed to camera)                                           */
  /* ================================================================ */
  private createHud(): void {
    // Score badge
    this.scoreHud = this.add
      .text(16, 16, `⭐ ${gameStore.getTotalScore()} pts`, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: "22px",
        color: "#fef9c3",
        fontStyle: "700",
        backgroundColor: "#0f172acc",
        padding: { left: 14, right: 14, top: 8, bottom: 8 }
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Controls hint
    this.add
      .text(16, 60, "WASD / Setas = mover  |  E / Enter = interagir", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: "14px",
        color: "#cbd5e1",
        backgroundColor: "#0f172a99",
        padding: { left: 10, right: 10, top: 4, bottom: 4 }
      })
      .setScrollFactor(0)
      .setDepth(100);
  }
}
