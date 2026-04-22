export interface PackagingCard {
  id: string;
  label: string;
  icon: string;
  isCorrect: boolean;
  correctOrder: number;
}

export const packagingCards: PackagingCard[] = [
  {
    id: "uso",
    label: "Uso do Produto",
    icon: "🧪",
    isCorrect: true,
    correctOrder: 0
  },
  {
    id: "triplice",
    label: "Triplice Lavagem",
    icon: "💧",
    isCorrect: true,
    correctOrder: 1
  },
  {
    id: "armazenamento",
    label: "Armazenamento",
    icon: "📦",
    isCorrect: true,
    correctOrder: 2
  },
  {
    id: "devolucao",
    label: "Devolucao",
    icon: "🚚",
    isCorrect: true,
    correctOrder: 3
  },
  {
    id: "recibo",
    label: "Recibo de Devolucao",
    icon: "🧾",
    isCorrect: true,
    correctOrder: 4
  },
  {
    id: "queimar",
    label: "Queimar Embalagem",
    icon: "🔥",
    isCorrect: false,
    correctOrder: -1
  },
  {
    id: "descarte_irregular",
    label: "Descarte Irregular",
    icon: "🗑️",
    isCorrect: false,
    correctOrder: -1
  }
];
