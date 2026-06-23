import { DRESS_UP_ASSETS } from "../constants";

export interface EpiItem {
  id: string;
  label: string;
  isCorrect: boolean;
  zone: string;
  assetKey: string;
}

export const epiItems: EpiItem[] = [
  {
    id: "respirador",
    label: "Respirador",
    isCorrect: true,
    zone: "face",
    assetKey: DRESS_UP_ASSETS.respirador.key
  },
  {
    id: "oculos",
    label: "Oculos de Protecao",
    isCorrect: true,
    zone: "eyes",
    assetKey: DRESS_UP_ASSETS.oculos.key
  },
  {
    id: "luvas",
    label: "Luvas de Protecao",
    isCorrect: true,
    zone: "hands",
    assetKey: DRESS_UP_ASSETS.luvasVerdes.key
  },
  {
    id: "avental",
    label: "Avental Impermeavel",
    isCorrect: true,
    zone: "torso",
    assetKey: DRESS_UP_ASSETS.avental.key
  },
  {
    id: "botas",
    label: "Botas Impermeaveis",
    isCorrect: true,
    zone: "feet",
    assetKey: DRESS_UP_ASSETS.botas.key
  },
  {
    id: "bone_arabe",
    label: "Bone Arabe",
    isCorrect: true,
    zone: "head",
    assetKey: DRESS_UP_ASSETS.boneArabe.key
  },
  {
    id: "mascara_cirurgica",
    label: "Mascara Cirurgica",
    isCorrect: false,
    zone: "face",
    assetKey: DRESS_UP_ASSETS.mascaraCirurgica.key
  },
  {
    id: "chinelo",
    label: "Chinelo",
    isCorrect: false,
    zone: "feet",
    assetKey: DRESS_UP_ASSETS.chinelo.key
  },
  {
    id: "camiseta",
    label: "Camiseta Comum",
    isCorrect: false,
    zone: "torso",
    assetKey: DRESS_UP_ASSETS.camiseta.key
  },
  {
    id: "luvas_latex",
    label: "Luvas de Latex",
    isCorrect: false,
    zone: "hands",
    assetKey: DRESS_UP_ASSETS.luvasLatex.key
  }
];
