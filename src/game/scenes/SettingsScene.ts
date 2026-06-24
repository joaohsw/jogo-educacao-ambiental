import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { MENU_BACKGROUND, SCENE_KEYS } from "../constants";
import { createButton, type GameButton } from "../ui/Button";

interface SettingsSceneData {
  returnTo?: string;
}

export class SettingsScene extends Phaser.Scene {
  private audio!: GameAudio;
  private backButton?: GameButton;
  private volumeText!: Phaser.GameObjects.Text;
  private sliderFill!: Phaser.GameObjects.Rectangle;
  private sliderKnob!: Phaser.GameObjects.Arc;
  private sliderLeft = 0;
  private sliderWidth = 0;
  private returnSceneKey: string = SCENE_KEYS.home;

  constructor() {
    super(SCENE_KEYS.settings);
  }

  create(data: SettingsSceneData = {}): void {
    this.returnSceneKey = data.returnTo === SCENE_KEYS.pause ? SCENE_KEYS.pause : SCENE_KEYS.home;
    this.audio = new GameAudio(this);
    this.renderSettings();
    this.setupKeyboard();

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(): void {
    this.renderSettings();
  }

  private renderSettings(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const uiScale = this.getUiScale(width, height);

    this.children.removeAll(true);
    this.backButton = undefined;
    this.cameras.main.setViewport(0, 0, width, height);
    this.cameras.main.setBackgroundColor(0x050505);

    this.drawBackground(width, height);

    const panelWidth = Math.min(width - 36, 680);
    const panelHeight = Math.min(height - 42, Math.max(360, 430 * uiScale));
    const panelX = width * 0.5;
    const panelY = height * 0.5;

    this.add.rectangle(panelX + 5, panelY + 7, panelWidth, panelHeight, 0x020617, 0.36);
    this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0xf8fafc, 0.97).setStrokeStyle(3, 0x14532d, 1);

    this.add
      .text(panelX, panelY - panelHeight * 0.32, "Configurações", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(44 * uiScale)}px`,
        color: "#0f172a",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    this.add
      .text(panelX, panelY - panelHeight * 0.12, "Música de fundo", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        color: "#14532d",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    this.volumeText = this.add
      .text(panelX, panelY - panelHeight * 0.015, "", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(24 * uiScale)}px`,
        color: "#334155",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    this.drawVolumeSlider(panelX, panelY + panelHeight * 0.12, panelWidth * 0.68, uiScale);

    this.backButton = createButton(this, panelX, panelY + panelHeight * 0.34, "Voltar", () => this.closeSettings(), {
      width: Math.floor(220 * uiScale),
      height: Math.floor(56 * uiScale),
      backgroundColor: 0x166534,
      hoverBackgroundColor: 0x15803d,
      borderColor: 0x86efac,
      hoverBorderColor: 0xbbf7d0,
      textColor: "#f0fdf4",
      fontSize: `${Math.floor(25 * uiScale)}px`
    });

    this.backButton.setFocused(true);
    this.updateVolumeDisplay(GameAudio.getMusicVolume());
  }

  private drawBackground(width: number, height: number): void {
    const background = this.add
      .image(width * 0.5, height * 0.5, MENU_BACKGROUND.key)
      .setOrigin(0.5)
      .setDepth(0);
    const coverScale = Math.max(width / background.width, height / background.height);
    background.setScale(coverScale);

    const scaledHeight = background.height * coverScale;
    const verticalOverflow = Math.max(0, scaledHeight - height);
    if (verticalOverflow > 0) {
      background.setY(height * 0.5 + Math.min(verticalOverflow * 0.22, height * 0.08));
    }

    this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x020617, 0.24).setDepth(1);
  }

  private drawVolumeSlider(x: number, y: number, width: number, uiScale: number): void {
    this.sliderWidth = Math.max(220, width);
    this.sliderLeft = x - this.sliderWidth * 0.5;
    const trackHeight = Math.max(12, Math.floor(14 * uiScale));

    const hitArea = this.add
      .rectangle(x, y, this.sliderWidth, Math.max(42, 48 * uiScale), 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });

    this.add
      .rectangle(x, y, this.sliderWidth, trackHeight, 0xd1d5db, 1)
      .setStrokeStyle(2, 0x64748b, 1);

    this.sliderFill = this.add
      .rectangle(this.sliderLeft, y, 1, trackHeight, 0x22c55e, 1)
      .setOrigin(0, 0.5);

    this.sliderKnob = this.add
      .circle(this.sliderLeft, y, Math.max(13, 16 * uiScale), 0xfacc15, 1)
      .setStrokeStyle(3, 0x7c2d12, 1)
      .setInteractive({ useHandCursor: true });

    this.input.setDraggable(this.sliderKnob);

    hitArea.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.audio.play("click");
      this.setVolumeFromX(pointer.x);
    });

    this.sliderKnob.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) => {
      this.setVolumeFromX(dragX);
    });
  }

  private setVolumeFromX(x: number): void {
    const volume = Phaser.Math.Clamp((x - this.sliderLeft) / this.sliderWidth, 0, 1);
    GameAudio.setMusicVolume(volume);
    GameAudio.ensureBackgroundMusic(this);
    this.updateVolumeDisplay(volume);
  }

  private updateVolumeDisplay(volume: number): void {
    const cleanVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.volumeText.setText(`${Math.round(cleanVolume * 100)}%`);
    this.sliderFill.setDisplaySize(Math.max(1, this.sliderWidth * cleanVolume), this.sliderFill.height);
    this.sliderKnob.setX(this.sliderLeft + this.sliderWidth * cleanVolume);
  }

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const cursors = kb.createCursorKeys();
    const keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const keyEnter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const adjust = (delta: number) => {
      const nextVolume = Phaser.Math.Clamp(GameAudio.getMusicVolume() + delta, 0, 1);
      GameAudio.setMusicVolume(nextVolume);
      GameAudio.ensureBackgroundMusic(this);
      this.updateVolumeDisplay(nextVolume);
    };

    cursors.left!.on("down", () => adjust(-0.05));
    keyA.on("down", () => adjust(-0.05));
    cursors.right!.on("down", () => adjust(0.05));
    keyD.on("down", () => adjust(0.05));
    keyEnter.on("down", () => this.backButton?.trigger());
    keySpace.on("down", () => this.backButton?.trigger());
    keyEsc.on("down", () => this.backButton?.trigger());
  }

  private closeSettings(): void {
    this.audio.play("click");

    if (this.returnSceneKey === SCENE_KEYS.pause) {
      this.scene.resume(SCENE_KEYS.pause);
      this.scene.stop();
      return;
    }

    this.scene.start(SCENE_KEYS.home);
  }

  private getUiScale(width: number, height: number): number {
    return Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.62, 1.16);
  }
}
