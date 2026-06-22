import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { INTRO_BACKGROUND, SCENE_KEYS } from "../constants";
import { createButton, type GameButton } from "../ui/Button";

const STORY_TITLE = "Uma missão na propriedade";
const STORY_TEXT =
  "A Fazenda Verde precisa da sua ajuda. Alguns cuidados importantes foram esquecidos: embalagens fora do lugar, riscos na lavoura, problemas no depósito e EPIs que precisam ser conferidos.\n\nVocê será o detetive da propriedade. Visite cada ponto do mapa, investigue as situações e escolha as ações corretas para proteger as pessoas, os animais e o meio ambiente.";

export class IntroScene extends Phaser.Scene {
  private audio!: GameAudio;
  private continueButton?: GameButton;
  private isContinuing = false;

  constructor() {
    super(SCENE_KEYS.intro);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.isContinuing = false;

    this.renderIntro();
    this.setupKeyboard();

    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.handleResize, this);
    });
  }

  private handleResize(): void {
    this.renderIntro();
  }

  private renderIntro(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.62, 1.2);

    this.children.removeAll(true);
    this.continueButton = undefined;
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
    const textY = board.y + insetY;
    const textWidth = board.width - insetX * 2;

    this.add
      .text(textX, textY, STORY_TITLE, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(42 * uiScale)}px`,
        color: "#5f330b",
        fontStyle: "700"
      })
      .setOrigin(0);

    this.add
      .text(textX, textY + 64 * uiScale, STORY_TEXT, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(27 * uiScale)}px`,
        color: "#3f2a12",
        lineSpacing: Math.floor(9 * uiScale),
        wordWrap: { width: textWidth }
      })
      .setOrigin(0);

    this.continueButton = createButton(
      this,
      board.centerX,
      Math.min(board.bottom - 54 * uiScale, height - 52 * uiScale),
      "Continuar",
      () => this.continueToMap(),
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

    const confirm = () => this.continueToMap();
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on("down", confirm);
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", confirm);
  }

  private continueToMap(): void {
    if (this.isContinuing) return;

    this.isContinuing = true;
    this.audio.play("click");
    this.scene.start(SCENE_KEYS.controls);
  }
}
