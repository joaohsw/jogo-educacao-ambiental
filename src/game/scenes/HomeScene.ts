import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { MENU_BACKGROUND, SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import { createButton, type GameButton } from "../ui/Button";

export class HomeScene extends Phaser.Scene {
  private audio!: GameAudio;
  private menuButtons: GameButton[] = [];
  private focusIndex = -1;

  constructor() {
    super(SCENE_KEYS.home);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.renderMenu();
    this.setupKeyboard();

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(): void {
    this.renderMenu();
  }

  private renderMenu(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.children.removeAll(true);
    this.menuButtons = [];
    this.focusIndex = -1;

    this.cameras.main.setViewport(0, 0, width, height);
    this.cameras.main.setBackgroundColor(0x050505);

    this.drawMenuBackground(width, height);
    this.drawButtons(width, height);
  }

  private drawMenuBackground(width: number, height: number): void {
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

    const bottomShade = this.add.graphics().setDepth(1);
    bottomShade.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.46, 0.46);
    bottomShade.fillRect(0, height * 0.45, width, height * 0.55);
  }

  private drawButtons(width: number, height: number): void {
    const uiScale = this.getUiScale(width, height);
    const maxButtonWidth = Math.max(160, Math.min(380, width - 32));
    const minButtonWidth = Math.min(220, maxButtonWidth);
    const buttonWidth = Phaser.Math.Clamp(width < 560 ? width * 0.78 : width * 0.31, minButtonWidth, maxButtonWidth);
    const buttonHeight = Phaser.Math.Clamp(58 * uiScale, 42, 66);
    const smallButtonHeight = Math.max(40, buttonHeight * 0.82);
    const gap = Phaser.Math.Clamp(14 * uiScale, 8, 18);
    const totalHeight = buttonHeight * 2 + smallButtonHeight + gap * 2;
    const bottomPad = Phaser.Math.Clamp(28 * uiScale, 14, 34);
    const minStartY = buttonHeight * 0.5 + 12;
    const maxStartY = height - bottomPad - totalHeight + buttonHeight * 0.5;
    const preferredStartY = height * (height < 520 ? 0.54 : 0.64);
    const startY = Phaser.Math.Clamp(preferredStartY, minStartY, Math.max(minStartY, maxStartY));
    const x = width * 0.5;
    const primaryFontSize = Math.floor(Phaser.Math.Clamp(30 * uiScale, 18, 32));
    const secondaryFontSize = Math.floor(Phaser.Math.Clamp(24 * uiScale, 16, 26));

    this.addMenuButton(createButton(this, x, startY, "Novo Jogo", () => {
      this.audio.play("click");
      gameStore.resetCurrentSession();
      this.registry.remove("playerX");
      this.registry.remove("playerY");
      this.registry.remove("endingSeen");
      this.scene.start(SCENE_KEYS.intro);
    }, {
      width: buttonWidth,
      height: buttonHeight,
      backgroundColor: 0xfacc15,
      hoverBackgroundColor: 0xfbbf24,
      borderColor: 0x7c2d12,
      hoverBorderColor: 0x451a03,
      textColor: "#3b2203",
      fontSize: `${primaryFontSize}px`,
      depth: 10
    }));

    const hasSavedProgress = gameStore.getTotalScore() > 0;
    const continueButton = createButton(this, x, startY + buttonHeight + gap, "Continuar", () => {
      this.audio.play("click");
      this.scene.start(SCENE_KEYS.map);
    }, {
      width: buttonWidth,
      height: buttonHeight,
      backgroundColor: hasSavedProgress ? 0x166534 : 0x1f2937,
      hoverBackgroundColor: hasSavedProgress ? 0x15803d : 0x374151,
      borderColor: hasSavedProgress ? 0x86efac : 0x6b7280,
      hoverBorderColor: hasSavedProgress ? 0xbbf7d0 : 0x9ca3af,
      textColor: hasSavedProgress ? "#f0fdf4" : "#d1d5db",
      fontSize: `${primaryFontSize}px`,
      depth: 10
    });

    if (!hasSavedProgress) {
      continueButton.container.setAlpha(0.55);
      continueButton.container.disableInteractive();
    }
    this.addMenuButton(continueButton);

    const settingsY = startY + buttonHeight + gap + (buttonHeight + smallButtonHeight) * 0.5 + gap;
    const secondaryWidth = Math.min(buttonWidth * 0.74, 280);

    this.addMenuButton(createButton(this, x, settingsY, "Configuracoes", () => {
      this.audio.play("click");
      this.scene.start(SCENE_KEYS.settings);
    }, {
      width: secondaryWidth,
      height: smallButtonHeight,
      backgroundColor: 0x4338ca,
      hoverBackgroundColor: 0x4f46e5,
      borderColor: 0xc7d2fe,
      hoverBorderColor: 0xe0e7ff,
      textColor: "#eef2ff",
      fontSize: `${secondaryFontSize}px`,
      depth: 10
    }));
  }

  private addMenuButton(button: GameButton): void {
    const index = this.menuButtons.length;
    this.menuButtons.push(button);

    button.container.on("pointerover", () => this.setFocus(index));
    button.container.on("pointerout", () => {
      if (this.focusIndex === index) {
        this.clearFocus();
      }
    });
  }

  private getUiScale(width: number, height: number): number {
    return Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.5, 1.15);
  }

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const cursors = kb.createCursorKeys();
    const keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyEnter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const moveUp = () => this.moveFocus(-1);
    const moveDown = () => this.moveFocus(1);
    const confirm = () => {
      if (this.focusIndex >= 0 && this.focusIndex < this.menuButtons.length) {
        this.menuButtons[this.focusIndex].trigger();
      }
    };

    cursors.up!.on("down", moveUp);
    cursors.down!.on("down", moveDown);
    keyW.on("down", moveUp);
    keyS.on("down", moveDown);
    keyEnter.on("down", confirm);
    keySpace.on("down", confirm);
  }

  private moveFocus(dir: number): void {
    const count = this.menuButtons.length;
    if (count === 0) return;

    if (this.focusIndex >= 0) {
      this.menuButtons[this.focusIndex].setFocused(false);
    }

    if (this.focusIndex < 0) {
      this.focusIndex = dir > 0 ? 0 : count - 1;
    } else {
      this.focusIndex = (this.focusIndex + dir + count) % count;
    }

    const button = this.menuButtons[this.focusIndex];
    if (button.container.alpha < 0.6) {
      this.moveFocus(dir);
      return;
    }

    button.setFocused(true);
    this.audio.play("click");
  }

  private setFocus(index: number): void {
    const button = this.menuButtons[index];
    if (!button || button.container.alpha < 0.6 || this.focusIndex === index) {
      return;
    }

    if (this.focusIndex >= 0) {
      this.menuButtons[this.focusIndex].setFocused(false);
    }

    this.focusIndex = index;
    button.setFocused(true);
  }

  private clearFocus(): void {
    if (this.focusIndex >= 0) {
      this.menuButtons[this.focusIndex].setFocused(false);
    }
    this.focusIndex = -1;
  }
}
