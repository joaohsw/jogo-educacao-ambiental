import { SCENE_KEYS } from "../constants";
import type { MiniGameId } from "../types/gameTypes";

export interface MapStation {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  borderColor: number;
  roofColor: number;
  sceneKey: string;
  sceneData?: Record<string, unknown>;
  miniGameId?: MiniGameId;
}

export const mapStations: MapStation[] = [
  {
    id: "lavoura",
    label: "Lavoura",
    icon: "🌾",
    x: 320,
    y: 240,
    width: 160,
    height: 120,
    color: 0x166534,
    borderColor: 0x14532d,
    roofColor: 0x15803d,
    sceneKey: SCENE_KEYS.spotError,
    sceneData: {
      sceneTitle: "Cena 1 - Lavoura",
      miniGameId: "jogo_erros_lavoura",
      mapKey: "map-lavoura",
      backgroundKey: "bg-lavoura"
    },
    miniGameId: "jogo_erros_lavoura"
  },
  {
    id: "deposito",
    label: "Depósito",
    icon: "📦",
    x: 1650,
    y: 260,
    width: 160,
    height: 120,
    color: 0x78350f,
    borderColor: 0x451a03,
    roofColor: 0x92400e,
    sceneKey: SCENE_KEYS.spotError,
    sceneData: {
      sceneTitle: "Cena 2 - Deposito",
      miniGameId: "jogo_erros_deposito",
      mapKey: "map-deposito",
      backgroundKey: "bg-deposito"
    },
    miniGameId: "jogo_erros_deposito"
  },
  {
    id: "embalagem",
    label: "Descarte",
    icon: "🗑️",
    x: 340,
    y: 900,
    width: 150,
    height: 110,
    color: 0x1e3a8a,
    borderColor: 0x1e40af,
    roofColor: 0x2563eb,
    sceneKey: SCENE_KEYS.packaging,
    miniGameId: "jornada_embalagem"
  },
  {
    id: "epi",
    label: "Galpão EPIs",
    icon: "🥽",
    x: 1620,
    y: 880,
    width: 160,
    height: 120,
    color: 0x581c87,
    borderColor: 0x6b21a8,
    roofColor: 0x7e22ce,
    sceneKey: SCENE_KEYS.dressUp,
    miniGameId: "vista_se"
  },
  {
    id: "ranking",
    label: "Ranking",
    icon: "🏆",
    x: 1000,
    y: 1020,
    width: 130,
    height: 100,
    color: 0x92400e,
    borderColor: 0x7c2d12,
    roofColor: 0xea580c,
    sceneKey: SCENE_KEYS.ranking
  }
];
