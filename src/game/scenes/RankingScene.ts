import Phaser from "phaser";

import { GameAudio } from "../audio/GameAudio";
import { MINI_GAME_IDS, MINI_GAME_LABELS, SCENE_KEYS } from "../constants";
import { gameStore } from "../state/GameStore";
import { createButton } from "../ui/Button";
import { showModal } from "../ui/Modal";

const DYNAMIC_KEY = "stats-dynamic";

interface RankingSceneData {
  returnTo?: string;
}

export class RankingScene extends Phaser.Scene {
  private audio!: GameAudio;
  private modalOpen = false;
  private returnSceneKey: string = SCENE_KEYS.map;

  constructor() {
    super(SCENE_KEYS.ranking);
  }

  create(data: RankingSceneData = {}): void {
    this.audio = new GameAudio(this);
    this.returnSceneKey = data.returnTo === SCENE_KEYS.home ? SCENE_KEYS.home : SCENE_KEYS.map;
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
    const uiScale = this.getUiScale();

    const bg = this.add.graphics();
    bg.fillStyle(0xeef7f1, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0xcff2da, 1);
    bg.fillRect(0, height * 0.58, width, height * 0.42);
    bg.fillStyle(0xdbeafe, 0.72);
    bg.fillRect(0, 0, width, height * 0.18);

    const shellW = width - 44;
    const shellH = height - 34;
    this.add.rectangle(width * 0.5 + 4, height * 0.5 + 6, shellW, shellH, 0x0f172a, 0.16);
    this.add.rectangle(width * 0.5, height * 0.5, shellW, shellH, 0xf8fafc, 0.95).setStrokeStyle(2, 0xb7d8c0, 1);

    const headerHeight = Math.max(82, Math.floor(90 * uiScale));
    const headerY = 22 + headerHeight * 0.5;
    const headerWidth = width - 64;
    this.add.rectangle(width * 0.5, headerY, headerWidth, headerHeight, 0x0f172a, 0.96).setStrokeStyle(2, 0x334155);

    this.add
      .text(width * 0.5, headerY, "Estatísticas", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(50 * uiScale)}px`,
        color: "#f8fafc",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    createButton(this, 108 * uiScale, headerY, this.returnSceneKey === SCENE_KEYS.home ? "Menu" : "Mapa", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("click");
      this.scene.start(this.returnSceneKey);
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
      .filter((child) => child.getData(DYNAMIC_KEY))
      .forEach((child) => child.destroy());

    const { width, height } = this.cameras.main;
    const uiScale = this.getUiScale();
    const isStacked = width < 1060;
    const contentRect = new Phaser.Geom.Rectangle(36, 126, width - 72, height - 146);
    const summaryHeight = isStacked ? Math.min(160, contentRect.height * 0.28) : 132;
    const summaryRect = new Phaser.Geom.Rectangle(contentRect.x, contentRect.y, contentRect.width, summaryHeight);
    const panelsTop = summaryRect.bottom + 16;
    const panelsHeight = contentRect.bottom - panelsTop;

    this.drawSummary(summaryRect, uiScale, isStacked);

    if (isStacked) {
      const sessionHeight = panelsHeight * 0.56;
      const sessionRect = new Phaser.Geom.Rectangle(contentRect.x, panelsTop, contentRect.width, sessionHeight);
      const historyRect = new Phaser.Geom.Rectangle(contentRect.x, sessionRect.bottom + 14, contentRect.width, panelsHeight - sessionHeight - 14);
      this.drawSessionPanel(sessionRect, uiScale, true);
      this.drawHistoryPanel(historyRect, uiScale, true);
      return;
    }

    const sessionRect = new Phaser.Geom.Rectangle(contentRect.x, panelsTop, contentRect.width * 0.58, panelsHeight);
    const historyRect = new Phaser.Geom.Rectangle(sessionRect.right + 14, panelsTop, contentRect.right - sessionRect.right - 14, panelsHeight);
    this.drawSessionPanel(sessionRect, uiScale, false);
    this.drawHistoryPanel(historyRect, uiScale, false);
  }

  private drawSummary(rect: Phaser.Geom.Rectangle, uiScale: number, isStacked: boolean): void {
    const total = gameStore.getTotalScore();
    const completedCount = this.getCompletedCount();
    const completionPercent = Math.round((completedCount / MINI_GAME_IDS.length) * 100);
    const entries = gameStore.getLeaderboard();
    const bestScore = entries.reduce((best, entry) => Math.max(best, entry.totalScore), 0);

    const gap = 12;
    const cardCount = 4;
    const cardWidth = isStacked ? (rect.width - gap) / 2 : (rect.width - gap * (cardCount - 1)) / cardCount;
    const cardHeight = isStacked ? (rect.height - gap) / 2 : rect.height;
    const metrics = [
      { label: "Pontos atuais", value: `${total}`, detail: "sessão em andamento", color: 0x166534 },
      { label: "Progresso", value: `${completionPercent}%`, detail: `${completedCount}/${MINI_GAME_IDS.length} minijogos`, color: 0x2563eb },
      { label: "Sessões", value: `${entries.length}`, detail: "arquivadas", color: 0x7c3aed },
      { label: "Melhor marca", value: `${bestScore}`, detail: "pontos salvos", color: 0xc2410c }
    ];

    metrics.forEach((metric, index) => {
      const col = isStacked ? index % 2 : index;
      const row = isStacked ? Math.floor(index / 2) : 0;
      const x = rect.x + col * (cardWidth + gap);
      const y = rect.y + row * (cardHeight + gap);
      this.drawMetricCard(new Phaser.Geom.Rectangle(x, y, cardWidth, cardHeight), metric, uiScale);
    });
  }

  private drawMetricCard(
    rect: Phaser.Geom.Rectangle,
    metric: { label: string; value: string; detail: string; color: number },
    uiScale: number
  ): void {
    this.mark(this.add.rectangle(rect.centerX + 3, rect.centerY + 4, rect.width, rect.height, 0x0f172a, 0.12));
    this.mark(this.add.rectangle(rect.centerX, rect.centerY, rect.width, rect.height, 0xffffff, 0.98).setStrokeStyle(2, metric.color, 0.55));
    this.mark(this.add.rectangle(rect.x + 4, rect.centerY, 8, rect.height - 12, metric.color, 1).setOrigin(0, 0.5));

    this.mark(this.add.text(rect.x + 22, rect.y + 16 * uiScale, metric.label, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(18 * uiScale)}px`,
      color: "#475569",
      fontStyle: "700"
    }));

    this.mark(this.add.text(rect.x + 22, rect.y + rect.height * 0.42, metric.value, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(42 * uiScale)}px`,
      color: "#0f172a",
      fontStyle: "700"
    }).setOrigin(0, 0.5));

    this.mark(this.add.text(rect.x + 22, rect.bottom - 22 * uiScale, metric.detail, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(16 * uiScale)}px`,
      color: "#64748b"
    }).setOrigin(0, 0.5));
  }

  private drawSessionPanel(rect: Phaser.Geom.Rectangle, uiScale: number, compact: boolean): void {
    this.drawPanel(rect, 0x16a34a);

    this.mark(this.add.text(rect.x + 24, rect.y + 22, "Sessão atual", {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(32 * uiScale)}px`,
      color: "#14532d",
      fontStyle: "700"
    }));

    const completedCount = this.getCompletedCount();
    this.drawBadge(
      rect.right - 24,
      rect.y + 38,
      `${completedCount}/${MINI_GAME_IDS.length} concluídos`,
      0xdcfce7,
      "#14532d",
      uiScale
    );

    const rowsTop = rect.y + 82;
    const bottomReserved = compact ? 58 : 74;
    const rowGap = 8;
    const rowHeight = Math.max(42, (rect.bottom - rowsTop - bottomReserved - rowGap * (MINI_GAME_IDS.length - 1)) / MINI_GAME_IDS.length);
    const scores = gameStore.getScores();

    MINI_GAME_IDS.forEach((id, index) => {
      const rowRect = new Phaser.Geom.Rectangle(
        rect.x + 20,
        rowsTop + index * (rowHeight + rowGap),
        rect.width - 40,
        rowHeight
      );
      const completed = gameStore.isMiniGameCompleted(id);
      this.drawMiniGameRow(rowRect, MINI_GAME_LABELS[id], scores[id], completed, uiScale);
    });

    const buttonY = rect.bottom - 34;
    const total = gameStore.getTotalScore();
    const archiveButton = createButton(this, rect.centerX - 112 * uiScale, buttonY, "Arquivar", () => {
      this.handleArchiveSession();
    }, {
      width: Math.floor(204 * uiScale),
      height: Math.floor(52 * uiScale),
      backgroundColor: 0xdcfce7,
      hoverBackgroundColor: 0xbbf7d0,
      borderColor: 0x16a34a,
      hoverBorderColor: 0x15803d,
      textColor: "#14532d",
      fontSize: `${Math.floor(23 * uiScale)}px`
    });
    archiveButton.container
      .setData(DYNAMIC_KEY, true)
      .setDepth(20);

    if (total <= 0) {
      archiveButton.container.setAlpha(0.45);
      archiveButton.container.disableInteractive();
    }

    createButton(this, rect.centerX + 112 * uiScale, buttonY, "Resetar", () => {
      if (this.modalOpen) {
        return;
      }
      this.audio.play("click");
      gameStore.resetCurrentSession();
    }, {
      width: Math.floor(176 * uiScale),
      height: Math.floor(52 * uiScale),
      backgroundColor: 0xfee2e2,
      hoverBackgroundColor: 0xfecaca,
      borderColor: 0xdc2626,
      hoverBorderColor: 0xb91c1c,
      textColor: "#7f1d1d",
      fontSize: `${Math.floor(23 * uiScale)}px`
    }).container
      .setData(DYNAMIC_KEY, true)
      .setDepth(20);
  }

  private drawMiniGameRow(
    rect: Phaser.Geom.Rectangle,
    label: string,
    score: number,
    completed: boolean,
    uiScale: number
  ): void {
    const rowColor = completed ? 0xf0fdf4 : 0xf8fafc;
    const accentColor = completed ? 0x16a34a : 0x94a3b8;
    const statusText = completed ? "Concluído" : "Pendente";
    const statusBg = completed ? 0xbbf7d0 : 0xe2e8f0;
    const statusColor = completed ? "#14532d" : "#475569";

    this.mark(this.add.rectangle(rect.centerX, rect.centerY, rect.width, rect.height, rowColor, 1).setStrokeStyle(1, accentColor, 0.5));
    this.mark(this.add.rectangle(rect.x + 4, rect.centerY, 7, rect.height - 10, accentColor, 1).setOrigin(0, 0.5));

    this.mark(this.add.text(rect.x + 20, rect.centerY, label, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(19 * uiScale)}px`,
      color: "#0f172a",
      fontStyle: "700",
      wordWrap: {
        width: Math.max(110, rect.width - 250 * uiScale)
      }
    }).setOrigin(0, 0.5));

    this.drawBadge(rect.right - 116 * uiScale, rect.centerY, statusText, statusBg, statusColor, uiScale * 0.82);

    this.mark(this.add.text(rect.right - 18, rect.centerY, `${score} pts`, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(20 * uiScale)}px`,
      color: "#0f172a",
      fontStyle: "700"
    }).setOrigin(1, 0.5));
  }

  private drawHistoryPanel(rect: Phaser.Geom.Rectangle, uiScale: number, compact: boolean): void {
    this.drawPanel(rect, 0x2563eb);

    this.mark(this.add.text(rect.x + 24, rect.y + 22, "Histórico", {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(32 * uiScale)}px`,
      color: "#1e3a8a",
      fontStyle: "700"
    }));

    const entries = gameStore.getLeaderboard();
    if (entries.length === 0) {
      this.mark(this.add.text(rect.centerX, rect.centerY, "Nenhuma sessão arquivada ainda.", {
        fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
        fontSize: `${Math.floor(26 * uiScale)}px`,
        color: "#64748b",
        align: "center",
        wordWrap: {
          width: rect.width - 60
        }
      }).setOrigin(0.5));
      return;
    }

    const bestScore = entries.reduce((best, entry) => Math.max(best, entry.totalScore), 0);
    const averageScore = Math.round(entries.reduce((sum, entry) => sum + entry.totalScore, 0) / entries.length);
    const latest = entries.reduce((latestEntry, entry) => {
      return entry.timestampIso > latestEntry.timestampIso ? entry : latestEntry;
    }, entries[0]);

    const statTop = rect.y + 78;
    const statGap = 10;
    const statHeight = compact ? 42 : 48;
    const statWidth = (rect.width - 48 - statGap) / 2;
    const statRows = [
      { label: "Sessões", value: `${entries.length}` },
      { label: "Melhor", value: `${bestScore} pts` },
      { label: "Média", value: `${averageScore} pts` },
      { label: "Última", value: this.formatDate(latest.timestampIso) }
    ];

    statRows.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const statRect = new Phaser.Geom.Rectangle(
        rect.x + 24 + col * (statWidth + statGap),
        statTop + row * (statHeight + statGap),
        statWidth,
        statHeight
      );
      this.drawSmallStat(statRect, stat.label, stat.value, uiScale);
    });

    const averagesTop = statTop + (statHeight + statGap) * 2 + 26;
    this.mark(this.add.text(rect.x + 24, averagesTop, "Média por minijogo", {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(22 * uiScale)}px`,
      color: "#1e3a8a",
      fontStyle: "700"
    }));

    const averages = this.getAverageScores(entries);
    const maxAverage = Math.max(1, ...MINI_GAME_IDS.map((id) => averages[id]));
    const rowHeight = compact ? 36 : 42;
    MINI_GAME_IDS.forEach((id, index) => {
      const y = averagesTop + 44 + index * rowHeight;
      if (y > rect.bottom - 20) {
        return;
      }
      this.drawAverageRow(rect.x + 24, y, rect.width - 48, MINI_GAME_LABELS[id], averages[id], maxAverage, uiScale);
    });
  }

  private drawSmallStat(rect: Phaser.Geom.Rectangle, label: string, value: string, uiScale: number): void {
    this.mark(this.add.rectangle(rect.centerX, rect.centerY, rect.width, rect.height, 0xeff6ff, 1).setStrokeStyle(1, 0x93c5fd, 1));

    this.mark(this.add.text(rect.x + 12, rect.centerY, label, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(15 * uiScale)}px`,
      color: "#475569",
      fontStyle: "700"
    }).setOrigin(0, 0.5));

    this.mark(this.add.text(rect.right - 12, rect.centerY, value, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(17 * uiScale)}px`,
      color: "#0f172a",
      fontStyle: "700"
    }).setOrigin(1, 0.5));
  }

  private drawAverageRow(
    x: number,
    y: number,
    width: number,
    label: string,
    score: number,
    maxAverage: number,
    uiScale: number
  ): void {
    const labelWidth = width * 0.48;
    const barWidth = width * 0.32;
    const barX = x + labelWidth + 12;
    const scoreTextX = x + width;
    const fillWidth = barWidth * Phaser.Math.Clamp(score / maxAverage, 0, 1);

    this.mark(this.add.text(x, y, label, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(16 * uiScale)}px`,
      color: "#334155",
      wordWrap: {
        width: labelWidth
      }
    }).setOrigin(0, 0.5));

    this.mark(this.add.rectangle(barX, y, barWidth, 10 * uiScale, 0xdbeafe, 1).setOrigin(0, 0.5));
    this.mark(this.add.rectangle(barX, y, fillWidth, 10 * uiScale, 0x2563eb, 1).setOrigin(0, 0.5));

    this.mark(this.add.text(scoreTextX, y, `${Math.round(score)} pts`, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(16 * uiScale)}px`,
      color: "#0f172a",
      fontStyle: "700"
    }).setOrigin(1, 0.5));
  }

  private drawPanel(rect: Phaser.Geom.Rectangle, color: number): void {
    this.mark(this.add.rectangle(rect.centerX + 4, rect.centerY + 6, rect.width, rect.height, 0x0f172a, 0.12));
    this.mark(this.add.rectangle(rect.centerX, rect.centerY, rect.width, rect.height, 0xffffff, 0.97).setStrokeStyle(2, color, 0.75));
  }

  private drawBadge(
    x: number,
    y: number,
    text: string,
    backgroundColor: number,
    textColor: string,
    uiScale: number
  ): void {
    const label = this.add.text(x, y, text, {
      fontFamily: "'Segoe UI', 'Trebuchet MS', sans-serif",
      fontSize: `${Math.floor(17 * uiScale)}px`,
      color: textColor,
      fontStyle: "700"
    }).setOrigin(0.5);
    const width = label.width + 22 * uiScale;
    const height = label.height + 10 * uiScale;

    const background = this.mark(this.add.rectangle(x, y, width, height, backgroundColor, 1).setStrokeStyle(1, 0xffffff, 0.9));
    this.mark(label.setDepth(background.depth + 1));
  }

  private getCompletedCount(): number {
    return MINI_GAME_IDS.filter((id) => gameStore.isMiniGameCompleted(id)).length;
  }

  private getAverageScores(entries: ReturnType<typeof gameStore.getLeaderboard>): Record<string, number> {
    const averages: Record<string, number> = {};

    MINI_GAME_IDS.forEach((id) => {
      averages[id] = entries.reduce((sum, entry) => sum + entry.miniGameScores[id], 0) / entries.length;
    });

    return averages;
  }

  private formatDate(timestampIso: string): string {
    const date = new Date(timestampIso);
    return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })}`;
  }

  private handleArchiveSession(): void {
    if (this.modalOpen || gameStore.getTotalScore() <= 0) {
      return;
    }

    this.audio.play("click");
    const suggestedName = gameStore.getPlayerName();
    const raw = window.prompt("Nome para arquivar as estatísticas:", suggestedName);
    if (raw === null) {
      return;
    }

    const name = raw.trim() || suggestedName;
    gameStore.saveSession(name);
    this.audio.play("success");
    this.openModal({
      title: "Sessão arquivada",
      message: "As estatísticas foram registradas no histórico.",
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

  private mark<T extends Phaser.GameObjects.GameObject>(child: T): T {
    child.setData(DYNAMIC_KEY, true);
    return child;
  }

  private getUiScale(): number {
    const { width, height } = this.cameras.main;
    return Phaser.Math.Clamp(Math.min(width / 1280, height / 720), 0.72, 1.35);
  }
}
