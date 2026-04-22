import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { MINI_GAME_IDS, MINI_GAME_LABELS, SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import type { ScoreEntry } from "../types/gameTypes";
import { createButton } from "../ui/Button";
import { showModal } from "../ui/Modal";

export class RankingScene extends Phaser.Scene {
  private audio!: GameAudio;
  private modalOpen = false;

  constructor() {
    super(SCENE_KEYS.ranking);
  }

  create(): void {
    this.audio = new GameAudio(this);
    this.buildStaticLayout();
    this.renderDynamicLayout();

    gameStore.events.on("updated", this.renderDynamicLayout, this);
    gameStore.events.on("leaderboard-changed", this.renderDynamicLayout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameStore.events.off("updated", this.renderDynamicLayout, this);
      gameStore.events.off("leaderboard-changed", this.renderDynamicLayout, this);
    });
  }

  private buildStaticLayout(): void {
    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x111827, 0x7c2d12, 0x92400e, 0x1e3a8a, 1);
    bg.fillRect(0, 0, width, height);
    this.add.circle(width * 0.86, height * 0.14, Math.min(width, height) * 0.17, 0xfacc15, 0.09);

    const shellW = width - 44;
    const shellH = height - 34;
    this.add.rectangle(width * 0.5 + 4, height * 0.5 + 6, shellW, shellH, 0x020617, 0.3);
    this.add.rectangle(width * 0.5, height * 0.5, shellW, shellH, 0xfffbeb, 0.94).setStrokeStyle(2, 0xffffff, 0.75);

    const headerHeight = Math.max(82, Math.floor(90 * uiScale));
    const headerY = 22 + headerHeight * 0.5;
    const headerWidth = width - 64;
    this.add.rectangle(width * 0.5, headerY, headerWidth, headerHeight, 0x0f172a, 0.96).setStrokeStyle(2, 0x334155);

    this.add
      .text(width * 0.5, headerY, "Ranking e Sessao Atual", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(50 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    createButton(this, 108 * uiScale, headerY, "Menu", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("click");
      this.scene.start(SCENE_KEYS.home);
    }, {
      width: 162 * uiScale,
      height: 52 * uiScale,
      backgroundColor: 0xffffff,
      hoverBackgroundColor: 0xe2e8f0,
      borderColor: 0x334155,
      hoverBorderColor: 0x1e293b,
      textColor: "#0f172a",
      fontSize: `${Math.floor(26 * uiScale)}px`
    });
  }

  private renderDynamicLayout(): void {
    this.children.list
      .filter((child) => child.getData("ranking-dynamic"))
      .forEach((child) => child.destroy());

    const { width, height } = this.cameras.main;
    const uiScale = Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);
    const isStacked = width < 1120;

    const contentTop = 126;
    const contentHeight = height - contentTop - 20;
    const leftPanelRect = isStacked
      ? new Phaser.Geom.Rectangle(36, contentTop, width - 72, contentHeight * 0.45)
      : new Phaser.Geom.Rectangle(36, contentTop, width * 0.43, contentHeight);
    const rightPanelRect = isStacked
      ? new Phaser.Geom.Rectangle(36, leftPanelRect.bottom + 14, width - 72, contentHeight - leftPanelRect.height - 14)
      : new Phaser.Geom.Rectangle(leftPanelRect.right + 12, contentTop, width - (leftPanelRect.right + 48), contentHeight);

    const currentPanel = this.add
      .rectangle(
        leftPanelRect.centerX,
        leftPanelRect.centerY,
        leftPanelRect.width,
        leftPanelRect.height,
        0xffffff,
        0.97
      )
      .setStrokeStyle(2, 0x16a34a)
      .setData("ranking-dynamic", true);

    this.add
      .text(currentPanel.x, leftPanelRect.y + 30, "Sessao atual", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(34 * uiScale)}px`,
        color: "#14532d",
        fontStyle: "700"
      })
      .setOrigin(0.5, 0)
      .setData("ranking-dynamic", true);

    const total = gameStore.getTotalScore();
    this.add
      .text(currentPanel.x, leftPanelRect.y + 76, `${total} pts`, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(58 * uiScale)}px`,
        color: "#166534",
        fontStyle: "700"
      })
      .setOrigin(0.5, 0)
      .setData("ranking-dynamic", true);

    const scores = gameStore.getScores();
    MINI_GAME_IDS.forEach((id, index) => {
      const y = leftPanelRect.y + 160 + index * (38 * uiScale);
      this.add
        .text(leftPanelRect.x + 24, y, MINI_GAME_LABELS[id], {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${Math.floor(20 * uiScale)}px`,
          color: "#334155",
          wordWrap: {
            width: leftPanelRect.width - 170
          }
        })
        .setOrigin(0, 0.5)
        .setData("ranking-dynamic", true);

      this.add
        .text(leftPanelRect.right - 24, y, `${scores[id]} pts`, {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${Math.floor(22 * uiScale)}px`,
          color: "#0f172a",
          fontStyle: "700"
        })
        .setOrigin(1, 0.5)
        .setData("ranking-dynamic", true);
    });

    const buttonY = leftPanelRect.bottom - 34;
    const saveButton = createButton(this, leftPanelRect.centerX - (isStacked ? 100 : 110), buttonY, "Salvar sessao", () => {
      this.handleSaveSession();
    }, {
      width: Math.floor(210 * uiScale),
      height: Math.floor(52 * uiScale),
      backgroundColor: 0xdcfce7,
      hoverBackgroundColor: 0xbbf7d0,
      borderColor: 0x16a34a,
      hoverBorderColor: 0x15803d,
      textColor: "#14532d",
      fontSize: `${Math.floor(24 * uiScale)}px`
    })
      .setData("ranking-dynamic", true)
      .setDepth(20);

    if (total <= 0) {
      saveButton.setAlpha(0.45);
      saveButton.disableInteractive();
    }

    createButton(this, leftPanelRect.centerX + (isStacked ? 100 : 110), buttonY, "Resetar", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("click");
      gameStore.resetCurrentSession();
    }, {
      width: Math.floor(180 * uiScale),
      height: Math.floor(52 * uiScale),
      backgroundColor: 0xffedd5,
      hoverBackgroundColor: 0xffd7b0,
      borderColor: 0xea580c,
      hoverBorderColor: 0xc2410c,
      textColor: "#7c2d12",
      fontSize: `${Math.floor(24 * uiScale)}px`
    })
      .setData("ranking-dynamic", true)
      .setDepth(20);

    this.drawLeaderboard(rightPanelRect, uiScale);
  }

  private drawLeaderboard(panelRect: Phaser.Geom.Rectangle, uiScale: number): void {
    this.add
      .rectangle(panelRect.centerX, panelRect.centerY, panelRect.width, panelRect.height, 0xffffff, 0.97)
      .setStrokeStyle(2, 0xea580c)
      .setData("ranking-dynamic", true);

    this.add
      .text(panelRect.centerX, panelRect.y + 24, "Leaderboard", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(36 * uiScale)}px`,
        color: "#7c2d12",
        fontStyle: "700"
      })
      .setOrigin(0.5, 0)
      .setData("ranking-dynamic", true);

    const entries = gameStore.getLeaderboard();
    if (entries.length === 0) {
      this.add
        .text(panelRect.centerX, panelRect.centerY, "Nenhuma sessao salva ainda.", {
          fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
          fontSize: `${Math.floor(28 * uiScale)}px`,
          color: "#6b7280"
        })
        .setOrigin(0.5)
        .setData("ranking-dynamic", true);
      return;
    }

    const rowHeight = Math.max(42, Math.floor(46 * uiScale));
    const top = panelRect.y + 80;
    const visibleRows = Math.max(1, Math.floor((panelRect.height - 96) / rowHeight));
    entries.slice(0, visibleRows).forEach((entry, index) => {
      this.drawRow(entry, index, panelRect, top + index * rowHeight, rowHeight, uiScale);
    });
  }

  private drawRow(
    entry: ScoreEntry,
    index: number,
    panelRect: Phaser.Geom.Rectangle,
    y: number,
    rowHeight: number,
    uiScale: number
  ): void {
    const rowBg = index % 2 === 0 ? 0xfff7ed : 0xffedd5;
    this.add
      .rectangle(panelRect.centerX, y + rowHeight * 0.5, panelRect.width - 24, rowHeight - 4, rowBg, 0.85)
      .setStrokeStyle(1, 0xfdba74, 1)
      .setData("ranking-dynamic", true);

    const date = new Date(entry.timestampIso);
    const stamp = `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;

    this.add
      .text(panelRect.x + 14, y + rowHeight * 0.5, `${index + 1}o`, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(20 * uiScale)}px`,
        color: "#7c2d12",
        fontStyle: "700"
      })
      .setOrigin(0, 0.5)
      .setData("ranking-dynamic", true);

    this.add
      .text(panelRect.x + 64, y + rowHeight * 0.5, `${entry.playerName} - ${stamp}`, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(18 * uiScale)}px`,
        color: "#1f2937",
        wordWrap: {
          width: panelRect.width - 230
        }
      })
      .setOrigin(0, 0.5)
      .setData("ranking-dynamic", true);

    this.add
      .text(panelRect.right - 14, y + rowHeight * 0.5, `${entry.totalScore} pts`, {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(20 * uiScale)}px`,
        color: "#92400e",
        fontStyle: "700"
      })
      .setOrigin(1, 0.5)
      .setData("ranking-dynamic", true);
  }

  private handleSaveSession(): void {
    if (this.modalOpen) {
      return;
    }

    if (gameStore.getTotalScore() <= 0) {
      return;
    }

    this.audio.play("click");
    const suggestedName = gameStore.getPlayerName();
    const raw = window.prompt("Digite seu nome para o ranking:", suggestedName);
    if (raw === null) {
      return;
    }

    const name = raw.trim() || suggestedName;
    gameStore.saveSession(name);
    this.audio.play("success");
    this.openModal({
      title: "Sessao salva",
      message: "Pontuacao registrada no ranking e sessao reiniciada.",
      tone: "success"
    });
  }

  private openModal(args: {
    title: string;
    message: string;
    tone: "success" | "error" | "info" | "complete";
  }): void {
    this.modalOpen = true;
    showModal(this, {
      title: args.title,
      message: args.message,
      tone: args.tone,
      onConfirm: () => {
        this.modalOpen = false;
      }
    });
  }
}

