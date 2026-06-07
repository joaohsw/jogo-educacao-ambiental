import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { SCENE_KEYS } from "../constants";

export abstract class MiniGameScene extends Phaser.Scene {
  protected audio!: GameAudio;
  protected modalOpen = false;

  private returningToMap = false;
  private escapeKey?: Phaser.Input.Keyboard.Key;

  protected beginMiniGame(): void {
    this.audio = new GameAudio(this);
    this.modalOpen = false;
    this.returningToMap = false;
    this.input.enabled = true;
    this.registerEscapeReturn();
  }

  protected drawProjectionBackdrop(options: {
    panelColor?: number;
    panelAlpha?: number;
    borderColor?: number;
  } = {}): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);
    const marginX = Math.max(18, Math.floor(22 * uiScale));
    const marginY = Math.max(14, Math.floor(17 * uiScale));
    const shellW = width - marginX * 2;
    const shellH = height - marginY * 2;

    this.add
      .rectangle(0, 0, width, height, 0x020617, 0.5)
      .setOrigin(0)
      .setDepth(-30)
      .setInteractive();

    this.add
      .rectangle(width * 0.5 + 4, height * 0.5 + 6, shellW, shellH, 0x020617, 0.34)
      .setDepth(-20);

    this.add
      .rectangle(
        width * 0.5,
        height * 0.5,
        shellW,
        shellH,
        options.panelColor ?? 0xf8fafc,
        options.panelAlpha ?? 0.94
      )
      .setStrokeStyle(2, options.borderColor ?? 0xffffff, 0.78)
      .setDepth(-10);
  }

  protected returnToMap(): void {
    if (this.returningToMap) return;

    this.returningToMap = true;
    this.modalOpen = false;

    this.scene.resume(SCENE_KEYS.map);
    this.scene.stop(this.sys.settings.key);
  }

  private registerEscapeReturn(): void {
    this.escapeKey?.off("down", this.returnToMap, this);
    this.escapeKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escapeKey?.on("down", this.returnToMap, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.escapeKey?.off("down", this.returnToMap, this);
      this.escapeKey = undefined;
    });
  }
}
