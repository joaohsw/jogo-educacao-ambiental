export interface EpiItem {
  id: string;
  label: string;
  isCorrect: boolean;
  zone: string;
}

export const epiItems: EpiItem[] = [
  {
    id: "respirador",
    label: "Respirador",
    isCorrect: true,
    zone: "face"
  },
  {
    id: "oculos",
    label: "Oculos de Protecao",
    isCorrect: true,
    zone: "eyes"
  },
  {
    id: "luvas",
    label: "Luvas de Protecao",
    isCorrect: true,
    zone: "hands"
  },
  {
    id: "avental",
    label: "Avental Impermeavel",
    isCorrect: true,
    zone: "torso"
  },
  {
    id: "botas",
    label: "Botas Impermeaveis",
    isCorrect: true,
    zone: "feet"
  },
  {
    id: "bone_arabe",
    label: "Bone Arabe",
    isCorrect: true,
    zone: "head"
  },
  {
    id: "mascara_cirurgica",
    label: "Mascara Cirurgica",
    isCorrect: false,
    zone: "face"
  },
  {
    id: "chinelo",
    label: "Chinelo",
    isCorrect: false,
    zone: "feet"
  },
  {
    id: "camiseta",
    label: "Camiseta Comum",
    isCorrect: false,
    zone: "torso"
  },
  {
    id: "luvas_latex",
    label: "Luvas de Latex",
    isCorrect: false,
    zone: "hands"
  }
];
