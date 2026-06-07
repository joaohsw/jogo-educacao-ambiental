import Phaser from "phaser";

import { MAP_STATION_ASSETS, MENU_BACKGROUND, PLAYER_SPRITE_SHEET, SCENE_KEYS } from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    this.cameras.main.setBackgroundColor(0x030712);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b1328, 0x1e3a8a, 0x0f766e, 0x14532d, 1);
    bg.fillRect(0, 0, width, height);

    this.add.circle(width * 0.86, height * 0.22, 180 * uiScale, 0x67e8f9, 0.08);
    this.add.circle(width * 0.18, height * 0.74, 260 * uiScale, 0xfacc15, 0.07);

    const title = this.add
      .text(width * 0.5, height * 0.42, "Detetive na Propriedade", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(70 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    const subtitle = this.add
      .text(width * 0.5, height * 0.5, "Carregando recursos do jogo...", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        color: "#cbd5e1"
      })
      .setOrigin(0.5);

    const barWidth = Math.min(width * 0.56, 620);
    const barHeight = Math.max(20, Math.floor(24 * uiScale));

    const barShadow = this.add
      .rectangle(width * 0.5 + 4, height * 0.6 + 4, barWidth, barHeight, 0x020617, 0.45)
      .setStrokeStyle(1, 0x020617);

    const barBg = this.add
      .rectangle(width * 0.5, height * 0.6, barWidth, barHeight, 0x0f172a, 0.94)
      .setStrokeStyle(2, 0xe2e8f0);

    const barFill = this.add
      .rectangle(barBg.x - barWidth * 0.5 + 3, barBg.y, 0, barHeight - 6, 0x22c55e, 1)
      .setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      barFill.width = (barWidth - 6) * value;
    });

    this.load.on("complete", () => {
      bg.destroy();
      title.destroy();
      subtitle.destroy();
      barShadow.destroy();
      barBg.destroy();
      barFill.destroy();
    });

    this.load.image("bg-lavoura", "/images/cena1.png");
    this.load.image("bg-deposito", "/images/cena2.png");
    this.load.image(MENU_BACKGROUND.key, MENU_BACKGROUND.path);
    Object.values(MAP_STATION_ASSETS).forEach((asset) => {
      this.load.image(asset.key, asset.path);
    });
    this.load.spritesheet(PLAYER_SPRITE_SHEET.key, PLAYER_SPRITE_SHEET.path, {
      frameWidth: PLAYER_SPRITE_SHEET.frameWidth,
      frameHeight: PLAYER_SPRITE_SHEET.frameHeight
    });

    this.load.tilemapTiledJSON("map-lavoura", "/tiled/spot_lavoura.tmj");
    this.load.tilemapTiledJSON("map-deposito", "/tiled/spot_deposito.tmj");
    this.load.tilemapTiledJSON("map-packaging", "/tiled/packaging_journey.tmj");
    this.load.tilemapTiledJSON("map-dressup", "/tiled/dress_up.tmj");

    this.load.audio("sfx-click", "/audio/click.wav");
    this.load.audio("sfx-success", "/audio/success.wav");
    this.load.audio("sfx-error", "/audio/error.wav");
    this.load.audio("sfx-complete", "/audio/complete.wav");
  }

  create(): void {
    this.scene.start(SCENE_KEYS.home);
  }
}

