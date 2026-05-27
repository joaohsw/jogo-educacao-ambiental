export interface PackagingCard {
  id: string;
  label: string;
  isCorrect: boolean;
  correctOrder: number;
}

export const packagingCards: PackagingCard[] = [
  {
    id: "uso",
    label: "Uso do Produto",
    isCorrect: true,
    correctOrder: 0
  },
  {
    id: "triplice",
    label: "Triplice Lavagem",
    isCorrect: true,
    correctOrder: 1
  },
  {
    id: "armazenamento",
    label: "Armazenamento",
    isCorrect: true,
    correctOrder: 2
  },
  {
    id: "devolucao",
    label: "Devolucao",
    isCorrect: true,
    correctOrder: 3
  },
  {
    id: "recibo",
    label: "Recibo de Devolucao",
    isCorrect: true,
    correctOrder: 4
  },
  {
    id: "queimar",
    label: "Queimar Embalagem",
    isCorrect: false,
    correctOrder: -1
  },
  {
    id: "descarte_irregular",
    label: "Descarte Irregular",
    isCorrect: false,
    correctOrder: -1
  }
];
