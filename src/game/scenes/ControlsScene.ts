import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { INTRO_BACKGROUND, SCENE_KEYS } from "../constants";
import { createButton, type GameButton } from "../ui/Button";

const CONTROL_LINES = [
  "Mover: WASD ou setas.",
  "Entrar: E, Enter ou Espaço quando o aviso aparecer.",
  "Mouse: clicar e arrastar nos minigames.",
  "Esc: pausar no mapa. Esc ou Voltar sai dos minigames."
];

export class ControlsScene extends Phaser.Scene {
  private audio!: GameAudio;
  private startButton?: GameButton;
  private isStarting = false;

  constructor() {
    super(SCENE_KEYS.controls);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.isStarting = false;

    this.renderControls();
    this.setupKeyboard();

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(): void {
    this.renderControls();
  }

  private renderControls(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.62, 1.2);

    this.children.removeAll(true);
    this.startButton = undefined;
    this.cameras.main.setViewport(0, 0, width, height);
    this.cameras.main.setBackgroundColor(0x7dd3fc);

    const background = this.add.image(width * 0.5, height * 0.5, INTRO_BACKGROUND.key).setOrigin(0.5);
    const coverScale = Math.max(width / background.width, height / background.height);
    background.setScale(coverScale);

    const imageRect = new Phaser.Geom.Rectangle(
      background.x - background.displayWidth * 0.5,
      background.y - background.displayHeight * 0.5,
      background.displayWidth,
      background.displayHeight
    );

    const board = this.mapImageRect(imageRect, 0.235, 0.205, 0.815, 0.735);
    const insetX = Math.max(24, board.width * 0.07);
    const insetY = Math.max(20, board.height * 0.08);
    const textX = board.x + insetX;
    let textY = board.y + insetY;
    const textWidth = board.width - insetX * 2;
    const titleFontSize = Math.floor(38 * uiScale);
    const bodyFontSize = Math.floor(23 * uiScale);
    const highlightFontSize = Math.floor(21 * uiScale);
    const paragraphGap = Math.max(14, Math.floor(18 * uiScale));
    const titleGap = Math.max(22, Math.floor(28 * uiScale));

    const title = this.add
      .text(textX, textY, "Comandos", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${titleFontSize}px`,
        color: "#5f330b",
        fontStyle: "700"
      })
      .setOrigin(0);

    textY += title.height + titleGap;

    CONTROL_LINES.forEach((line) => {
      const lineText = this.add
        .text(textX, textY, line, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${bodyFontSize}px`,
          color: "#3f2a12",
          lineSpacing: Math.floor(7 * uiScale),
          wordWrap: { width: textWidth }
        })
        .setOrigin(0);

      textY += lineText.height + paragraphGap;
    });

    const highlight = this.add
      .text(textX, textY + Math.floor(6 * uiScale), "Explore com calma. Cada estação guarda uma parte da missão.", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${highlightFontSize}px`,
        color: "#6b3f14",
        fontStyle: "700",
        wordWrap: { width: textWidth }
      })
      .setOrigin(0);
    textY = highlight.y + highlight.height;

    this.startButton = createButton(
      this,
      board.centerX,
      Math.max(textY + 42 * uiScale, Math.min(board.bottom - 54 * uiScale, height - 52 * uiScale)),
      "Começar",
      () => this.startMap(),
      {
        width: Math.floor(250 * uiScale),
        height: Math.floor(58 * uiScale),
        backgroundColor: 0xfacc15,
        hoverBackgroundColor: 0xfbbf24,
        borderColor: 0x7c2d12,
        hoverBorderColor: 0x451a03,
        textColor: "#3b2203",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        depth: 10
      }
    );
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

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    const confirm = () => this.startMap();
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on("down", confirm);
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", confirm);
  }

  private startMap(): void {
    if (this.isStarting) return;

    this.isStarting = true;
    this.audio.play("click");
    this.scene.start(SCENE_KEYS.map);
  }
}
