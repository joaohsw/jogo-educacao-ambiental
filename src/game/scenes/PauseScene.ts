import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { SCENE_KEYS } from "../constants";
import { createButton, type GameButton } from "../ui/Button";

export class PauseScene extends Phaser.Scene {
  private audio!: GameAudio;
  private buttons: GameButton[] = [];
  private focusIndex = 0;
  private isClosing = false;

  constructor() {
    super(SCENE_KEYS.pause);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.isClosing = false;
    this.renderPauseMenu();
    this.setupKeyboard();

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(): void {
    this.renderPauseMenu();
  }

  private renderPauseMenu(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.68, 1.22);
    const panelWidth = Phaser.Math.Clamp(width * 0.36, 360, 520);
    const panelHeight = Phaser.Math.Clamp(height * 0.54, 360, 450);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const buttonWidth = Math.min(panelWidth - 72, 360);
    const buttonHeight = Phaser.Math.Clamp(56 * uiScale, 46, 60);
    const gap = Phaser.Math.Clamp(18 * uiScale, 12, 20);
    const titleFontSize = Math.floor(Phaser.Math.Clamp(40 * uiScale, 30, 42));
    const buttonFontSize = Math.floor(Phaser.Math.Clamp(27 * uiScale, 20, 28));
    const topPadding = Phaser.Math.Clamp(46 * uiScale, 34, 54);
    const titleToButtonsGap = Phaser.Math.Clamp(34 * uiScale, 24, 40);
    const titleY = centerY - panelHeight * 0.5 + topPadding + titleFontSize * 0.5;
    const firstY = titleY + titleFontSize * 0.5 + titleToButtonsGap + buttonHeight * 0.5;

    this.children.removeAll(true);
    this.buttons = [];
    this.focusIndex = 0;
    this.cameras.main.setViewport(0, 0, width, height);

    this.add.rectangle(0, 0, width, height, 0x020617, 0.62).setOrigin(0).setInteractive();
    this.add.rectangle(centerX + 5, centerY + 7, panelWidth, panelHeight, 0x020617, 0.32);
    this.add
      .rectangle(centerX, centerY, panelWidth, panelHeight, 0xfffbeb, 0.98)
      .setStrokeStyle(4, 0x7c2d12);

    this.add
      .text(centerX, titleY, "Jogo Pausado", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${titleFontSize}px`,
        color: "#5f330b",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    this.addPauseButton(createButton(this, centerX, firstY, "Continuar", () => this.resumeGame(), {
      width: buttonWidth,
      height: buttonHeight,
      backgroundColor: 0x166534,
      hoverBackgroundColor: 0x15803d,
      borderColor: 0x86efac,
      hoverBorderColor: 0xbbf7d0,
      textColor: "#f0fdf4",
      fontSize: `${buttonFontSize}px`,
      depth: 10
    }));

    this.addPauseButton(createButton(this, centerX, firstY + buttonHeight + gap, "Configuracoes", () => this.openSettings(), {
      width: buttonWidth,
      height: buttonHeight,
      backgroundColor: 0x4338ca,
      hoverBackgroundColor: 0x4f46e5,
      borderColor: 0xc7d2fe,
      hoverBorderColor: 0xe0e7ff,
      textColor: "#eef2ff",
      fontSize: `${buttonFontSize}px`,
      depth: 10
    }));

    this.addPauseButton(createButton(this, centerX, firstY + (buttonHeight + gap) * 2, "Menu Principal", () => this.exitToMenu(), {
      width: buttonWidth,
      height: buttonHeight,
      backgroundColor: 0xfacc15,
      hoverBackgroundColor: 0xfbbf24,
      borderColor: 0x7c2d12,
      hoverBorderColor: 0x451a03,
      textColor: "#3b2203",
      fontSize: `${buttonFontSize}px`,
      depth: 10
    }));

    this.buttons[this.focusIndex]?.setFocused(true);
  }

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const cursors = kb.createCursorKeys();
    const keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyEnter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    cursors.up!.on("down", () => this.moveFocus(-1));
    cursors.down!.on("down", () => this.moveFocus(1));
    keyW.on("down", () => this.moveFocus(-1));
    keyS.on("down", () => this.moveFocus(1));
    keyEnter.on("down", () => this.triggerFocused());
    keySpace.on("down", () => this.triggerFocused());
    keyEsc.on("down", () => this.resumeGame());
  }

  private addPauseButton(button: GameButton): void {
    const index = this.buttons.length;
    this.buttons.push(button);

    button.container.on("pointerover", () => this.setFocus(index));
  }

  private moveFocus(direction: number): void {
    const count = this.buttons.length;
    if (count === 0) return;

    this.buttons[this.focusIndex]?.setFocused(false);
    this.focusIndex = (this.focusIndex + direction + count) % count;
    this.buttons[this.focusIndex].setFocused(true);
    this.audio.play("click");
  }

  private setFocus(index: number): void {
    if (index === this.focusIndex || !this.buttons[index]) return;

    this.buttons[this.focusIndex]?.setFocused(false);
    this.focusIndex = index;
    this.buttons[this.focusIndex].setFocused(true);
  }

  private triggerFocused(): void {
    this.buttons[this.focusIndex]?.trigger();
  }

  private resumeGame(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    this.audio.play("click");
    this.scene.resume(SCENE_KEYS.map);
    this.scene.stop();
  }

  private openSettings(): void {
    if (this.isClosing) return;

    this.audio.play("click");
    this.scene.launch(SCENE_KEYS.settings, { returnTo: SCENE_KEYS.pause });
    this.scene.bringToTop(SCENE_KEYS.settings);
    this.scene.pause();
  }

  private exitToMenu(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    this.audio.play("click");
    this.scene.stop(SCENE_KEYS.map);
    this.scene.start(SCENE_KEYS.home);
  }
}
