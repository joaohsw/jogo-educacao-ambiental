import Phaser from "phaser";

import { MINI_GAME_IDS, STORAGE_KEYS } from "../constants";
import type { MiniGameId, ScoreEntry, ScoreMap } from "../types/gameTypes";

const defaultScores = (): ScoreMap => ({
  jogo_erros_lavoura: 0,
  jogo_erros_deposito: 0,
  jornada_embalagem: 0,
  vista_se: 0
});

class GameStore {
  private readonly scores: ScoreMap = defaultScores();
  private readonly scoredActions: Record<MiniGameId, Set<string>> = {
    jogo_erros_lavoura: new Set<string>(),
    jogo_erros_deposito: new Set<string>(),
    jornada_embalagem: new Set<string>(),
    vista_se: new Set<string>()
  };

  private leaderboard: ScoreEntry[] = [];
  private playerName = "Jogador";

  readonly events = new Phaser.Events.EventEmitter();

  constructor() {
    this.loadLeaderboard();
    this.loadPlayerName();
  }

  getScores(): ScoreMap {
    return { ...this.scores };
  }

  getTotalScore(): number {
    return MINI_GAME_IDS.reduce((sum, id) => sum + this.scores[id], 0);
  }

  getLeaderboard(): ScoreEntry[] {
    return [...this.leaderboard];
  }

  getPlayerName(): string {
    return this.playerName;
  }

  setPlayerName(name: string): void {
    const clean = name.trim();
    if (!clean) {
      return;
    }

    this.playerName = clean;
    localStorage.setItem(STORAGE_KEYS.playerName, clean);
    this.emitUpdate();
  }

  addScoreForAction(args: {
    miniGameId: MiniGameId;
    actionId: string;
    points: number;
  }): boolean {
    const { miniGameId, actionId, points } = args;
    const actions = this.scoredActions[miniGameId];

    if (actions.has(actionId)) {
      return false;
    }

    actions.add(actionId);
    this.scores[miniGameId] += points;
    this.emitUpdate();
    return true;
  }

  wasActionScored(miniGameId: MiniGameId, actionId: string): boolean {
    return this.scoredActions[miniGameId].has(actionId);
  }

  resetCurrentSession(): void {
    MINI_GAME_IDS.forEach((id) => {
      this.scores[id] = 0;
      this.scoredActions[id].clear();
    });

    this.emitUpdate();
  }

  saveSession(customName?: string): void {
    const maybeName = customName?.trim();
    if (maybeName) {
      this.playerName = maybeName;
      localStorage.setItem(STORAGE_KEYS.playerName, maybeName);
    }

    const total = this.getTotalScore();
    if (total <= 0) {
      return;
    }

    const entry: ScoreEntry = {
      playerName: this.playerName,
      totalScore: total,
      miniGameScores: this.getScores(),
      timestampIso: new Date().toISOString()
    };

    this.leaderboard.push(entry);
    this.leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return b.timestampIso.localeCompare(a.timestampIso);
    });

    this.persistLeaderboard();
    this.resetCurrentSession();
    this.events.emit("leaderboard-changed");
  }

  private emitUpdate(): void {
    this.events.emit("updated");
  }

  private persistLeaderboard(): void {
    localStorage.setItem(
      STORAGE_KEYS.leaderboard,
      JSON.stringify(this.leaderboard)
    );
  }

  private loadPlayerName(): void {
    const value = localStorage.getItem(STORAGE_KEYS.playerName);
    if (value && value.trim()) {
      this.playerName = value.trim();
    }
  }

  private loadLeaderboard(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.leaderboard);
    if (!raw) {
      this.leaderboard = [];
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.leaderboard = [];
        return;
      }

      this.leaderboard = parsed
        .map((item) => this.toSafeEntry(item))
        .filter((item): item is ScoreEntry => item !== null);
    } catch {
      this.leaderboard = [];
    }
  }

  private toSafeEntry(input: unknown): ScoreEntry | null {
    if (typeof input !== "object" || input === null) {
      return null;
    }

    const candidate = input as Partial<ScoreEntry>;
    if (
      typeof candidate.playerName !== "string" ||
      typeof candidate.totalScore !== "number" ||
      typeof candidate.timestampIso !== "string" ||
      typeof candidate.miniGameScores !== "object" ||
      candidate.miniGameScores === null
    ) {
      return null;
    }

    const scores = candidate.miniGameScores as Partial<ScoreMap>;
    const safeScores = defaultScores();
    MINI_GAME_IDS.forEach((id) => {
      const value = scores[id];
      if (typeof value === "number" && Number.isFinite(value)) {
        safeScores[id] = value;
      }
    });

    return {
      playerName: candidate.playerName,
      totalScore: candidate.totalScore,
      timestampIso: candidate.timestampIso,
      miniGameScores: safeScores
    };
  }
}

export const gameStore = new GameStore();
