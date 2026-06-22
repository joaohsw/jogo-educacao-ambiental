import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import {
  INTERACTION_RADIUS,
  MAP_BACKGROUND,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_RADIUS,
  PLAYER_SPRITE_SCALE,
  PLAYER_SPRITE_SHEET,
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
  collisionRect: Phaser.Geom.Rectangle;
  highlight: Phaser.GameObjects.Rectangle;
  promptText: Phaser.GameObjects.Text;
  promptBaseY: number;
  checkMark?: Phaser.GameObjects.Text;
}

type PlayerDirection = "down" | "left" | "right" | "up";

const PLAYER_ANIMATIONS: Record<PlayerDirection, string> = {
  down: "player-walk-down",
  left: "player-walk-left",
  right: "player-walk-right",
  up: "player-walk-up"
};

const PLAYER_IDLE_FRAMES: Record<PlayerDirection, number> = {
  down: 0,
  left: 3,
  right: 6,
  up: 9
};

const MAP_BACKGROUND_OVERSCAN = 12;

export class MapScene extends Phaser.Scene {
  /* ---- core objects ---- */
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerDirection: PlayerDirection = "down";

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
    this.buildStations();
    this.createPlayerAnimations();
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
    const background = this.add
      .image(MAP_WIDTH * 0.5, MAP_HEIGHT * 0.5, MAP_BACKGROUND.key)
      .setOrigin(0.5)
      .setDepth(0);
    background.setDisplaySize(
      MAP_WIDTH + MAP_BACKGROUND_OVERSCAN * 2,
      MAP_HEIGHT + MAP_BACKGROUND_OVERSCAN * 2
    );

    // Add border colliders
    const borderW = 28;
    this.colliders.push(new Phaser.Geom.Rectangle(0, 0, MAP_WIDTH, borderW));
    this.colliders.push(new Phaser.Geom.Rectangle(0, MAP_HEIGHT - borderW, MAP_WIDTH, borderW));
    this.colliders.push(new Phaser.Geom.Rectangle(0, 0, borderW, MAP_HEIGHT));
    this.colliders.push(new Phaser.Geom.Rectangle(MAP_WIDTH - borderW, 0, borderW, MAP_HEIGHT));
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
      const { x, y, width, height } = station;
      const visualBounds = this.drawStationVisual(station);

      // Label
      this.add.text(x, visualBounds.bottom + 16, station.label, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "700",
        stroke: "#0f172a",
        strokeThickness: 4
      }).setOrigin(0.5);

      // Interaction prompt (hidden by default)
      const promptBaseY = visualBounds.top - 28;
      const promptText = this.add
        .text(x, promptBaseY, "[ E ]  Entrar", {
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

      const highlight = this.add
        .rectangle(
          visualBounds.centerX,
          visualBounds.centerY,
          visualBounds.width + 18,
          visualBounds.height + 14,
          0xfef3c7,
          0.08
        )
        .setStrokeStyle(4, 0xfbbf24, 1)
        .setDepth(19)
        .setVisible(false);

      // Collision rect for this building (slightly padded)
      const pad = 4;
      const collisionRect = new Phaser.Geom.Rectangle(
        x - width / 2 - pad,
        y - height / 2 - pad,
        width + pad * 2,
        height + pad * 2
      );
      this.colliders.push(collisionRect);

      const runtime: StationRuntime = { data: station, collisionRect, highlight, promptText, promptBaseY };
      this.stations.push(runtime);
    });

    this.refreshCompletionMarks();
  }

  private drawStationVisual(station: MapStation): Phaser.Geom.Rectangle {
    if (station.assetKey) {
      return this.drawAssetStation(station);
    }

    return this.drawGenericStation(station);
  }

  private drawAssetStation(station: MapStation): Phaser.Geom.Rectangle {
    const { x, y, width, height } = station;
    this.add.ellipse(x, y + height * 0.38, width * 0.86, height * 0.22, 0x0f172a, 0.2).setDepth(8);

    const image = this.add.image(x, y, station.assetKey!).setOrigin(0.5).setDepth(18);
    const displayWidth = station.assetDisplayWidth ?? width;
    image.setScale(displayWidth / image.width);

    const visualWidth = station.assetVisibleWidth ?? image.displayWidth;
    const visualHeight = station.assetVisibleHeight ?? image.displayHeight;
    const visualCenterY = y + (station.assetVisibleOffsetY ?? 0);
    return new Phaser.Geom.Rectangle(
      x - visualWidth / 2,
      visualCenterY - visualHeight / 2,
      visualWidth,
      visualHeight
    );
  }

  private drawGenericStation(station: MapStation): Phaser.Geom.Rectangle {
    const { x, y, width, height, color, borderColor, roofColor } = station;

    // Building shadow
    this.add.rectangle(x + 6, y + 8, width, height, 0x020617, 0.25).setOrigin(0.5);

    // Building body
    this.add
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

    return new Phaser.Geom.Rectangle(x - width / 2, y - height / 2 - 26, width, height + 26);
  }

  private refreshCompletionMarks(): void {
    this.stations.forEach((station) => {
      if (!station.data.miniGameId) return;

      const score = gameStore.getScores()[station.data.miniGameId];
      const isCompleted = score > 0;

      if (isCompleted && !station.checkMark) {
        station.checkMark = this.add
          .text(station.data.x + station.data.width / 2 + 8, station.data.y - station.data.height / 2 - 8, "OK", {
            fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
            fontSize: "16px",
            color: "#dcfce7",
            fontStyle: "700",
            backgroundColor: "#166534cc",
            padding: { left: 6, right: 6, top: 3, bottom: 3 }
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
      this.scoreHud.setText(`Pontos: ${gameStore.getTotalScore()}`);
    }
  }

  /* ================================================================ */
  /*  PLAYER                                                          */
  /* ================================================================ */
  private createPlayerAnimations(): void {
    const directions: Array<{ direction: PlayerDirection; frames: number[] }> = [
      { direction: "down", frames: [0, 1, 2, 1] },
      { direction: "left", frames: [3, 4, 5, 4] },
      { direction: "right", frames: [6, 7, 8, 7] },
      { direction: "up", frames: [9, 10, 11, 10] }
    ];

    directions.forEach(({ direction, frames }) => {
      const key = PLAYER_ANIMATIONS[direction];
      if (this.anims.exists(key)) return;

      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(PLAYER_SPRITE_SHEET.key, { frames }),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  private createPlayer(): void {
    // Restore position from registry if returning from a minigame
    const savedX = this.registry.get("playerX") as number | undefined;
    const savedY = this.registry.get("playerY") as number | undefined;
    const startX = savedX ?? MAP_WIDTH / 2;
    const startY = savedY ?? MAP_HEIGHT * 0.68;

    const shadowOuter = this.add.ellipse(0, PLAYER_RADIUS + 10, 70, 22, 0x0f172a, 0.14);
    const shadowInner = this.add.ellipse(0, PLAYER_RADIUS + 9, 54, 14, 0x0f172a, 0.22);
    this.playerSprite = this.add
      .sprite(0, 0, PLAYER_SPRITE_SHEET.key, PLAYER_IDLE_FRAMES.down)
      .setOrigin(0.5, 0.82)
      .setScale(PLAYER_SPRITE_SCALE);

    this.player = this.add.container(startX, startY, [shadowOuter, shadowInner, this.playerSprite]);
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

    if (vx === 0 && vy === 0) {
      this.stopPlayerAnimation();
      return;
    }

    // Normalize diagonal
    const len = Math.sqrt(vx * vx + vy * vy);
    vx /= len;
    vy /= len;
    this.updatePlayerAnimation(this.getPlayerDirection(vx, vy));

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
  }

  private getPlayerDirection(vx: number, vy: number): PlayerDirection {
    if (Math.abs(vx) > Math.abs(vy)) {
      return vx < 0 ? "left" : "right";
    }

    return vy < 0 ? "up" : "down";
  }

  private updatePlayerAnimation(direction: PlayerDirection): void {
    this.playerDirection = direction;
    this.playerSprite.play(PLAYER_ANIMATIONS[direction], true);
  }

  private stopPlayerAnimation(): void {
    if (!this.playerSprite) return;

    this.playerSprite.stop();
    this.playerSprite.setFrame(PLAYER_IDLE_FRAMES[this.playerDirection]);
  }

  /* ================================================================ */
  /*  PROXIMITY CHECK                                                 */
  /* ================================================================ */
  private checkProximity(): void {
    let closest: StationRuntime | null = null;
    let closestDist = Infinity;

    for (const station of this.stations) {
      const dist = this.distanceToRect(this.player.x, this.player.y, station.collisionRect);

      if (dist < INTERACTION_RADIUS && dist < closestDist) {
        closest = station;
        closestDist = dist;
      }
    }

    if (this.activeStation && this.activeStation !== closest) {
      this.activeStation.promptText.setVisible(false);
      this.activeStation.highlight.setVisible(false);
    }

    this.activeStation = closest;

    if (closest) {
      closest.promptText.setVisible(true);
      closest.highlight.setVisible(true);

      // Subtle bounce on the prompt
      const bounce = Math.sin(this.time.now / 300) * 3;
      closest.promptText.setY(closest.promptBaseY + bounce);
    }
  }

  private distanceToRect(x: number, y: number, rect: Phaser.Geom.Rectangle): number {
    const nearX = Phaser.Math.Clamp(x, rect.x, rect.right);
    const nearY = Phaser.Math.Clamp(y, rect.y, rect.bottom);
    return Phaser.Math.Distance.Between(x, y, nearX, nearY);
  }

  /* ================================================================ */
  /*  INTERACTION                                                     */
  /* ================================================================ */
  private tryInteract(): void {
    if (!this.activeStation) return;

    const station = this.activeStation;
    this.audio.play("click");

    if (station.data.miniGameId) {
      this.scene.launch(station.data.sceneKey, station.data.sceneData);
      this.scene.bringToTop(station.data.sceneKey);
      this.scene.pause();
      return;
    }

    // Save player position for non-overlay scenes such as the ranking.
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
      .text(16, 16, `Pontos: ${gameStore.getTotalScore()}`, {
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
