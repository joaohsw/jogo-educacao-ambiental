export interface EpiItem {
  id: string;
  label: string;
  icon: string;
  isCorrect: boolean;
  zone: string;
}

export const epiItems: EpiItem[] = [
  {
    id: "respirador",
    label: "Respirador",
    icon: "😷",
    isCorrect: true,
    zone: "face"
  },
  {
    id: "oculos",
    label: "Oculos de Protecao",
    icon: "🥽",
    isCorrect: true,
    zone: "eyes"
  },
  {
    id: "luvas",
    label: "Luvas de Protecao",
    icon: "🧤",
    isCorrect: true,
    zone: "hands"
  },
  {
    id: "avental",
    label: "Avental Impermeavel",
    icon: "🦺",
    isCorrect: true,
    zone: "torso"
  },
  {
    id: "botas",
    label: "Botas Impermeaveis",
    icon: "🥾",
    isCorrect: true,
    zone: "feet"
  },
  {
    id: "bone_arabe",
    label: "Bone Arabe",
    icon: "🧢",
    isCorrect: true,
    zone: "head"
  },
  {
    id: "mascara_cirurgica",
    label: "Mascara Cirurgica",
    icon: "😶",
    isCorrect: false,
    zone: "face"
  },
  {
    id: "chinelo",
    label: "Chinelo",
    icon: "🩴",
    isCorrect: false,
    zone: "feet"
  },
  {
    id: "camiseta",
    label: "Camiseta Comum",
    icon: "👕",
    isCorrect: false,
    zone: "torso"
  },
  {
    id: "luvas_latex",
    label: "Luvas de Latex",
    icon: "🫴",
    isCorrect: false,
    zone: "hands"
  }
];
