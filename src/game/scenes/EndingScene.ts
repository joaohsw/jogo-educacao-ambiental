import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { ENDING_BACKGROUND, SCENE_KEYS } from "../constants";
import { createButton, type GameButton } from "../ui/Button";

const ENDING_TITLE = "Missão cumprida!";
const ENDING_TEXT =
  "Depois de investigar a lavoura, o depósito, a jornada das embalagens e os EPIs, você ajudou a propriedade a ficar mais segura e sustentável. Cada escolha correta evita contaminações, protege quem trabalha no campo e cuida do solo, da água e dos alimentos.";
const ENDING_NOTE =
  "Agora a fazenda tem um plano melhor para prevenir problemas e continuar produzindo com responsabilidade.";

export class EndingScene extends Phaser.Scene {
  private audio!: GameAudio;
  private buttons: GameButton[] = [];
  private focusIndex = 0;
  private isClosing = false;

  constructor() {
    super(SCENE_KEYS.ending);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.isClosing = false;
    this.renderEnding();
    this.setupKeyboard();

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(): void {
    this.renderEnding();
  }

  private renderEnding(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.62, 1.18);

    this.children.removeAll(true);
    this.buttons = [];
    this.focusIndex = 0;
    this.cameras.main.setViewport(0, 0, width, height);
    this.cameras.main.setBackgroundColor(0x7dd3fc);

    const background = this.add.image(width * 0.5, height * 0.5, ENDING_BACKGROUND.key).setOrigin(0.5);
    const coverScale = Math.max(width / background.width, height / background.height);
    background.setScale(coverScale);

    const imageRect = new Phaser.Geom.Rectangle(
      background.x - background.displayWidth * 0.5,
      background.y - background.displayHeight * 0.5,
      background.displayWidth,
      background.displayHeight
    );

    const board = this.mapImageRect(imageRect, 0.29, 0.21, 0.855, 0.785);
    const insetX = Phaser.Math.Clamp(board.width * 0.07, 18, 44);
    const insetY = Phaser.Math.Clamp(board.height * 0.075, 16, 36);
    const textX = board.x + insetX;
    const textWidth = board.width - insetX * 2;
    const textY = board.y + insetY;
    const sideBySide = board.width >= 680;
    const buttonHeight = Phaser.Math.Clamp(58 * uiScale, 44, 64);
    const buttonGap = Math.max(14, 18 * uiScale);
    const buttonCenterY = Math.min(board.bottom - Math.max(56, 64 * uiScale), height - buttonHeight * 0.5 - 12);
    const buttonTop = sideBySide
      ? buttonCenterY - buttonHeight * 0.5
      : buttonCenterY - (buttonHeight + buttonGap) * 0.5 - buttonHeight * 0.5;
    const textBottomLimit = buttonTop - Math.max(12, 18 * uiScale);

    this.drawFittedEndingText(textX, textY, textWidth, Math.max(90, textBottomLimit - textY), uiScale);

    this.drawButtons(board, uiScale);
    this.buttons[this.focusIndex]?.setFocused(true);
  }

  private drawFittedEndingText(
    x: number,
    y: number,
    width: number,
    maxHeight: number,
    uiScale: number
  ): void {
    let titleFontSize = Math.floor(38 * uiScale);
    let bodyFontSize = Math.floor(23 * uiScale);
    let noteFontSize = Math.floor(21 * uiScale);
    let lineSpacing = Math.floor(8 * uiScale);
    let noteLineSpacing = Math.floor(7 * uiScale);
    let titleGap = Math.max(14, Math.floor(22 * uiScale));
    let noteGap = Math.max(10, Math.floor(18 * uiScale));
    let title!: Phaser.GameObjects.Text;
    let story!: Phaser.GameObjects.Text;
    let note!: Phaser.GameObjects.Text;

    for (let attempt = 0; attempt < 34; attempt += 1) {
      title?.destroy();
      story?.destroy();
      note?.destroy();

      title = this.add
        .text(x, y, ENDING_TITLE, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${titleFontSize}px`,
          color: "#5f330b",
          fontStyle: "700",
          wordWrap: { width }
        })
        .setOrigin(0);

      story = this.add
        .text(x, y + title.height + titleGap, ENDING_TEXT, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${bodyFontSize}px`,
          color: "#3f2a12",
          lineSpacing,
          wordWrap: { width }
        })
        .setOrigin(0);

      note = this.add
        .text(x, story.y + story.height + noteGap, ENDING_NOTE, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${noteFontSize}px`,
          color: "#6b3f14",
          fontStyle: "700",
          lineSpacing: noteLineSpacing,
          wordWrap: { width }
        })
        .setOrigin(0);

      const totalHeight = note.y + note.height - y;
      if (totalHeight <= maxHeight || bodyFontSize <= 13) {
        return;
      }

      titleFontSize = Math.max(21, titleFontSize - 2);
      bodyFontSize = Math.max(13, bodyFontSize - 1);
      noteFontSize = Math.max(13, noteFontSize - 1);
      lineSpacing = Math.max(1, lineSpacing - 1);
      noteLineSpacing = Math.max(1, noteLineSpacing - 1);
      titleGap = Math.max(6, titleGap - 1);
      noteGap = Math.max(5, noteGap - 1);
    }
  }

  private drawButtons(board: Phaser.Geom.Rectangle, uiScale: number): void {
    const sideBySide = board.width >= 680;
    const buttonWidth = sideBySide
      ? Math.min(260, board.width * 0.34)
      : Math.min(320, board.width * 0.72);
    const buttonHeight = Phaser.Math.Clamp(58 * uiScale, 44, 64);
    const gap = Math.max(14, 18 * uiScale);
    const centerY = Math.min(board.bottom - Math.max(56, 64 * uiScale), this.scale.height - buttonHeight * 0.5 - 12);

    if (sideBySide) {
      const leftX = board.centerX - buttonWidth * 0.5 - gap * 0.5;
      const rightX = board.centerX + buttonWidth * 0.5 + gap * 0.5;
      this.addEndingButton(leftX, centerY, buttonWidth, buttonHeight, "Voltar ao mapa", () => this.returnToMap(), uiScale, true);
      this.addEndingButton(rightX, centerY, buttonWidth, buttonHeight, "Menu principal", () => this.exitToMenu(), uiScale, false);
      return;
    }

    this.addEndingButton(board.centerX, centerY - (buttonHeight + gap) * 0.5, buttonWidth, buttonHeight, "Voltar ao mapa", () => this.returnToMap(), uiScale, true);
    this.addEndingButton(board.centerX, centerY + (buttonHeight + gap) * 0.5, buttonWidth, buttonHeight, "Menu principal", () => this.exitToMenu(), uiScale, false);
  }

  private addEndingButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    action: () => void,
    uiScale: number,
    primary: boolean
  ): void {
    const button = createButton(this, x, y, label, action, {
      width,
      height,
      backgroundColor: primary ? 0x166534 : 0xfacc15,
      hoverBackgroundColor: primary ? 0x15803d : 0xfbbf24,
      borderColor: primary ? 0x86efac : 0x7c2d12,
      hoverBorderColor: primary ? 0xbbf7d0 : 0x451a03,
      textColor: primary ? "#f0fdf4" : "#3b2203",
      fontSize: `${Math.floor(24 * uiScale)}px`,
      depth: 10
    });

    const index = this.buttons.length;
    this.buttons.push(button);
    button.container.on("pointerover", () => this.setFocus(index));
  }

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const cursors = kb.createCursorKeys();
    const keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyEnter = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    cursors.left!.on("down", () => this.moveFocus(-1));
    cursors.up!.on("down", () => this.moveFocus(-1));
    cursors.right!.on("down", () => this.moveFocus(1));
    cursors.down!.on("down", () => this.moveFocus(1));
    keyA.on("down", () => this.moveFocus(-1));
    keyW.on("down", () => this.moveFocus(-1));
    keyD.on("down", () => this.moveFocus(1));
    keyS.on("down", () => this.moveFocus(1));
    keyEnter.on("down", () => this.triggerFocused());
    keySpace.on("down", () => this.triggerFocused());
    keyEsc.on("down", () => this.returnToMap());
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

  private returnToMap(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    this.audio.play("click");
    this.scene.resume(SCENE_KEYS.map);
    this.scene.stop();
  }

  private exitToMenu(): void {
    if (this.isClosing) return;

    this.isClosing = true;
    this.audio.play("click");
    this.scene.stop(SCENE_KEYS.map);
    this.scene.start(SCENE_KEYS.home);
  }

  private mapImageRect(
    imageRect: Phaser.Geom.Rectangle,
    left: number,
    top: number,
    right: number,
    bottom: number
  ): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      imageRect.x + imageRect.width * left,
      imageRect.y + imageRect.height * top,
      imageRect.width * (right - left),
      imageRect.height * (bottom - top)
    );
  }
}
