import { MAP_STATION_ASSETS, SCENE_KEYS } from "../constants";
import type { MiniGameId } from "../types/gameTypes";

export interface MapStation {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  borderColor: number;
  roofColor: number;
  assetKey?: string;
  assetDisplayWidth?: number;
  assetVisibleWidth?: number;
  assetVisibleHeight?: number;
  assetVisibleOffsetY?: number;
  sceneKey: string;
  sceneData?: Record<string, unknown>;
  miniGameId?: MiniGameId;
}

export const mapStations: MapStation[] = [
  {
    id: "lavoura",
    label: "Lavoura",
    x: 345,
    y: 260,
    width: 180,
    height: 160,
    color: 0x166534,
    borderColor: 0x14532d,
    roofColor: 0x15803d,
    assetKey: MAP_STATION_ASSETS.lavoura.key,
    assetDisplayWidth: 315,
    assetVisibleWidth: 200,
    assetVisibleHeight: 194,
    assetVisibleOffsetY: -5,
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
    x: 1655,
    y: 260,
    width: 150,
    height: 140,
    color: 0x78350f,
    borderColor: 0x451a03,
    roofColor: 0x92400e,
    assetKey: MAP_STATION_ASSETS.deposito.key,
    assetDisplayWidth: 380,
    assetVisibleWidth: 190,
    assetVisibleHeight: 214,
    assetVisibleOffsetY: -9,
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
    x: 990,
    y: 965,
    width: 215,
    height: 120,
    color: 0x1e3a8a,
    borderColor: 0x1e40af,
    roofColor: 0x2563eb,
    assetKey: MAP_STATION_ASSETS.descarte.key,
    assetDisplayWidth: 315,
    assetVisibleWidth: 263,
    assetVisibleHeight: 172,
    assetVisibleOffsetY: 3,
    sceneKey: SCENE_KEYS.packaging,
    miniGameId: "jornada_embalagem"
  },
  {
    id: "epi",
    label: "Galpao EPIs",
    x: 300,
    y: 1605,
    width: 185,
    height: 135,
    color: 0x581c87,
    borderColor: 0x6b21a8,
    roofColor: 0x7e22ce,
    assetKey: MAP_STATION_ASSETS.galpaoEpis.key,
    assetDisplayWidth: 330,
    assetVisibleWidth: 236,
    assetVisibleHeight: 189,
    assetVisibleOffsetY: -9,
    sceneKey: SCENE_KEYS.dressUp,
    miniGameId: "vista_se"
  }
];
