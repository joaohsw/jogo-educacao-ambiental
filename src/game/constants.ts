import type { MiniGameId } from "./types/gameTypes";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const MENU_BACKGROUND = {
  key: "menu-principal",
  path: "/images/menu-principal.png"
} as const;

export const MAP_STATION_ASSETS = {
  lavoura: { key: "station-lavoura", path: "/images/lavoura.png" },
  deposito: { key: "station-deposito", path: "/images/deposito.png" },
  descarte: { key: "station-descarte", path: "/images/descarte.png" },
  galpaoEpis: { key: "station-galpao-epis", path: "/images/galpaoepis.png" }
} as const;

export const STORAGE_KEYS = {
  leaderboard: "detetive-na-propriedade.leaderboard.v1",
  playerName: "detetive-na-propriedade.player-name.v1"
} as const;

export const SCENE_KEYS = {
  boot: "boot-scene",
  home: "home-scene",
  map: "map-scene",
  spotError: "spot-error-scene",
  packaging: "packaging-scene",
  dressUp: "dress-up-scene",
  ranking: "ranking-scene"
} as const;

/* -------- Map constants -------- */
export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 1200;
export const PLAYER_SPEED = 220;
export const PLAYER_RADIUS = 14;
export const PLAYER_SPRITE_SHEET = {
  key: "player-walk",
  path: "/images/player-walk.png",
  frameWidth: 192,
  frameHeight: 256
} as const;
export const PLAYER_SPRITE_SCALE = 0.36;
export const INTERACTION_RADIUS = 90;

export const MINI_GAME_IDS: MiniGameId[] = [
  "jogo_erros_lavoura",
  "jogo_erros_deposito",
  "jornada_embalagem",
  "vista_se"
];

export const MINI_GAME_LABELS: Record<MiniGameId, string> = {
  jogo_erros_lavoura: "Jogo dos Erros - Lavoura",
  jogo_erros_deposito: "Jogo dos Erros - Deposito",
  jornada_embalagem: "Jornada da Embalagem",
  vista_se: "Vista-se Corretamente"
};

export const COLORS = {
  ink: 0x1f2933,
  paper: 0xf3f5e8,
  panel: 0xfefcf3,
  accent: 0x2e7d32,
  accentAlt: 0xef6c00,
  danger: 0xc62828,
  success: 0x2e7d32,
  slate: 0x455a64
} as const;
