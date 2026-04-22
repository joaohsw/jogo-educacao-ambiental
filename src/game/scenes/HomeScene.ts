import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { MINI_GAME_LABELS, SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import { createButton } from "../ui/Button";

interface MenuEntry {
  title: string;
  subtitle: string;
  color: number;
  hoverColor: number;
  border: number;
  onClick: () => void;
}

export class HomeScene extends Phaser.Scene {
  private audio!: GameAudio;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.home);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.buildLayout();

    gameStore.events.on("updated", this.updateScore, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameStore.events.off("updated", this.updateScore, this);
    });
  }

  private buildLayout(): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.4);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b132b, 0x1d4ed8, 0x0f766e, 0x14532d, 1);
    bg.fillRect(0, 0, width, height);
    this.add.circle(width * 0.92, height * 0.15, 180 * uiScale, 0x67e8f9, 0.1);
    this.add.circle(width * 0.17, height * 0.84, 220 * uiScale, 0xfacc15, 0.08);

    const shellWidth = width - 48;
    const shellHeight = height - 34;
    this.add.rectangle(width * 0.5 + 4, height * 0.5 + 6, shellWidth, shellHeight, 0x020617, 0.35);
    this.add
      .rectangle(width * 0.5, height * 0.5, shellWidth, shellHeight, 0xf8fafc, 0.93)
      .setStrokeStyle(2, 0xffffff, 0.75);

    const heroHeight = Math.max(188, height * 0.26);
    const heroY = 26 + heroHeight * 0.5;
    this.add
      .rectangle(width * 0.5, heroY, shellWidth - 46, heroHeight, 0x0f172a, 0.96)
      .setStrokeStyle(2, 0x334155);
    this.add.rectangle(width * 0.5, heroY + heroHeight * 0.32, shellWidth - 46, heroHeight * 0.36, 0x14532d, 0.9);

    this.add
      .text(width * 0.5, heroY - heroHeight * 0.2, "Detetive na Propriedade", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(62 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    this.add
      .text(width * 0.5, heroY + heroHeight * 0.02, "Aprendizado pratico sobre seguranca ambiental no campo", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(24 * uiScale)}px`,
        color: "#cbd5e1"
      })
      .setOrigin(0.5);

    this.add
      .rectangle(width * 0.5, heroY + heroHeight * 0.32, 360 * uiScale, 46 * uiScale, 0xfacc15, 1)
      .setStrokeStyle(2, 0x0f172a);
    this.scoreText = this.add
      .text(width * 0.5, heroY + heroHeight * 0.32, "", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(28 * uiScale)}px`,
        color: "#111827",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    const entries: MenuEntry[] = [
      {
        title: MINI_GAME_LABELS.jogo_erros_lavoura,
        subtitle: "Investigacao em campo aberto",
        color: 0xecfdf5,
        hoverColor: 0xd1fae5,
        border: 0x15803d,
        onClick: () => {
          this.audio.play("click");
          this.scene.start(SCENE_KEYS.spotError, {
            sceneTitle: "Cena 1 - Lavoura",
            miniGameId: "jogo_erros_lavoura",
            mapKey: "map-lavoura",
            backgroundKey: "bg-lavoura"
          });
        }
      },
      {
        title: MINI_GAME_LABELS.jogo_erros_deposito,
        subtitle: "Inspecao de armazenamento",
        color: 0xf0fdf4,
        hoverColor: 0xdcfce7,
        border: 0x16a34a,
        onClick: () => {
          this.audio.play("click");
          this.scene.start(SCENE_KEYS.spotError, {
            sceneTitle: "Cena 2 - Deposito",
            miniGameId: "jogo_erros_deposito",
            mapKey: "map-deposito",
            backgroundKey: "bg-deposito"
          });
        }
      },
      {
        title: MINI_GAME_LABELS.jornada_embalagem,
        subtitle: "Sequencia correta de descarte",
        color: 0xeff6ff,
        hoverColor: 0xdbeafe,
        border: 0x1d4ed8,
        onClick: () => {
          this.audio.play("click");
          this.scene.start(SCENE_KEYS.packaging);
        }
      },
      {
        title: MINI_GAME_LABELS.vista_se,
        subtitle: "Equipar EPI no trabalhador",
        color: 0xfdf4ff,
        hoverColor: 0xfae8ff,
        border: 0x7e22ce,
        onClick: () => {
          this.audio.play("click");
          this.scene.start(SCENE_KEYS.dressUp);
        }
      }
    ];

    const menuTop = heroY + heroHeight * 0.6;
    const buttonHeight = Math.max(74, Math.floor(82 * uiScale));
    const buttonWidth = Math.min(shellWidth - 120, 980);
    const gap = Math.max(12, Math.floor(14 * uiScale));

    entries.forEach((entry, index) => {
      const y = menuTop + index * (buttonHeight + gap);
      createButton(this, width * 0.5, y, entry.title, entry.onClick, {
        width: buttonWidth,
        height: buttonHeight,
        backgroundColor: entry.color,
        hoverBackgroundColor: entry.hoverColor,
        borderColor: entry.border,
        hoverBorderColor: Phaser.Display.Color.ValueToColor(entry.border).darken(14).color,
        textColor: "#0f172a",
        fontSize: `${Math.floor(34 * uiScale)}px`
      });

      this.add
        .text(width * 0.5, y + buttonHeight * 0.34, entry.subtitle, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${Math.floor(18 * uiScale)}px`,
          color: "#475569"
        })
        .setOrigin(0.5);
    });

    createButton(this, width * 0.5, height - 54, "Abrir Ranking", () => {
      this.audio.play("click");
      this.scene.start(SCENE_KEYS.ranking);
    }, {
      width: Math.min(shellWidth * 0.38, 380),
      height: Math.max(58, Math.floor(62 * uiScale)),
      backgroundColor: 0xffedd5,
      hoverBackgroundColor: 0xffd7b0,
      borderColor: 0xea580c,
      hoverBorderColor: 0xc2410c,
      textColor: "#7c2d12",
      fontSize: `${Math.floor(30 * uiScale)}px`
    });

    this.updateScore();
  }

  private updateScore(): void {
    this.scoreText.setText(`Pontuacao total: ${gameStore.getTotalScore()} pts`);
  }
}

