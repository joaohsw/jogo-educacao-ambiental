export type MiniGameId =
  | "jogo_erros_lavoura"
  | "jogo_erros_deposito"
  | "jornada_embalagem"
  | "vista_se";

export type ScoreMap = Record<MiniGameId, number>;

export interface ScoreEntry {
  playerName: string;
  totalScore: number;
  miniGameScores: ScoreMap;
  timestampIso: string;
}
