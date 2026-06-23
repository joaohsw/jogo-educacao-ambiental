import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { ENDING_BACKGROUND, SCENE_KEYS } from "../constants";
import { createButton, type GameButton } from "../ui/Button";

const ENDING_TITLE = "Missao cumprida!";
const ENDING_TEXT =
  "Depois de investigar a lavoura, o deposito, a jornada das embalagens e os EPIs, voce ajudou a propriedade a ficar mais segura e sustentavel. Cada escolha correta evita contaminacoes, protege quem trabalha no campo e cuida do solo, da agua e dos alimentos.";
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
    const insetX = Math.max(26, board.width * 0.07);
    const insetY = Math.max(22, board.height * 0.08);
    const textX = board.x + insetX;
    const textWidth = board.width - insetX * 2;
    let textY = board.y + insetY;

    const title = this.add
      .text(textX, textY, ENDING_TITLE, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(38 * uiScale)}px`,
        color: "#5f330b",
        fontStyle: "700"
      })
      .setOrigin(0);

    textY += title.height + Math.max(20, 24 * uiScale);

    const story = this.add
      .text(textX, textY, ENDING_TEXT, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(23 * uiScale)}px`,
        color: "#3f2a12",
        lineSpacing: Math.floor(8 * uiScale),
        wordWrap: { width: textWidth }
      })
      .setOrigin(0);

    textY += story.height + Math.max(16, 20 * uiScale);

    this.add
      .text(textX, textY, ENDING_NOTE, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(21 * uiScale)}px`,
        color: "#6b3f14",
        fontStyle: "700",
        lineSpacing: Math.floor(7 * uiScale),
        wordWrap: { width: textWidth }
      })
      .setOrigin(0);

    this.drawButtons(board, uiScale);
    this.buttons[this.focusIndex]?.setFocused(true);
  }

  private drawButtons(board: Phaser.Geom.Rectangle, uiScale: number): void {
    const sideBySide = board.width >= 680;
    const buttonWidth = sideBySide
      ? Math.min(260, board.width * 0.34)
      : Math.min(320, board.width * 0.72);
    const buttonHeight = Phaser.Math.Clamp(58 * uiScale, 44, 64);
    const gap = Math.max(14, 18 * uiScale);
    const centerY = board.bottom - Math.max(56, 64 * uiScale);

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
