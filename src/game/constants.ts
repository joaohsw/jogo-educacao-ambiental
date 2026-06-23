import type { MiniGameId } from "./types/gameTypes";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const MENU_BACKGROUND = {
  key: "menu-principal",
  path: "/images/menu-principal.png"
} as const;

export const INTRO_BACKGROUND = {
  key: "intro-historia",
  path: "/images/intro-historia.png"
} as const;

export const ENDING_BACKGROUND = {
  key: "final-historia",
  path: "/images/final-historia.png"
} as const;

export const MAP_STATION_ASSETS = {
  lavoura: { key: "station-lavoura", path: "/images/lavoura.png" },
  deposito: { key: "station-deposito", path: "/images/deposito.png" },
  descarte: { key: "station-descarte", path: "/images/descarte.png" },
  galpaoEpis: { key: "station-galpao-epis", path: "/images/galpaoepis.png" }
} as const;

export const DRESS_UP_ASSETS = {
  personagemBase: { key: "dressup-personagem-base", path: "/images/dressup/personagem-base.png" },
  boneArabe: { key: "dressup-bone-arabe", path: "/images/dressup/bone-arabe.png" },
  oculos: { key: "dressup-oculos", path: "/images/dressup/oculos.png" },
  respirador: { key: "dressup-respirador", path: "/images/dressup/respirador.png" },
  luvasVerdes: { key: "dressup-luvas-verdes", path: "/images/dressup/luvas-verdes.png" },
  luvaVerdeEsquerda: { key: "dressup-luva-verde-esquerda", path: "/images/dressup/luva-verde-esquerda.png" },
  luvaVerdeDireita: { key: "dressup-luva-verde-direita", path: "/images/dressup/luva-verde-direita.png" },
  avental: { key: "dressup-avental", path: "/images/dressup/avental.png" },
  botas: { key: "dressup-botas", path: "/images/dressup/botas.png" },
  camiseta: { key: "dressup-camiseta", path: "/images/dressup/camiseta.png" },
  chinelo: { key: "dressup-chinelo", path: "/images/dressup/chinelo.png" },
  mascaraCirurgica: { key: "dressup-mascara-cirurgica", path: "/images/dressup/mascara-cirurgica.png" },
  luvasLatex: { key: "dressup-luvas-latex", path: "/images/dressup/luvas-latex.png" }
} as const;

export const MAP_BACKGROUND = {
  key: "mapa-principal",
  path: "/images/mapa-principal.png"
} as const;

export const STORAGE_KEYS = {
  leaderboard: "detetive-na-propriedade.leaderboard.v1",
  playerName: "detetive-na-propriedade.player-name.v1"
} as const;

export const SCENE_KEYS = {
  boot: "boot-scene",
  home: "home-scene",
  intro: "intro-scene",
  controls: "controls-scene",
  map: "map-scene",
  pause: "pause-scene",
  ending: "ending-scene",
  spotError: "spot-error-scene",
  packaging: "packaging-scene",
  dressUp: "dress-up-scene",
  ranking: "ranking-scene"
} as const;

/* -------- Map constants -------- */
export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 2000;
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
