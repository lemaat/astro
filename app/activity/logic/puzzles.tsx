export type PuzzleType = "pattern" | "sequence" | "grid";

export interface LogicPuzzle {
  id: string;
  type: PuzzleType;
  question: {
    fr: string;
    ar: string;
  };
  visuals: string[]; // Emojis or numbers
  options: string[];
  answer: string;
}

export const LOGIC_PUZZLES: Record<string, LogicPuzzle[]> = {
  easy: [
    {
      id: "e1",
      type: "pattern",
      question: { fr: "Quel ami vient après ?", ar: "من الصديق التالي؟" },
      visuals: ["🐱", "🐶", "🐱", "🐶", "🐱"],
      options: ["🐱", "🐶", "🐰"],
      answer: "🐶",
    },
    {
      id: "e2",
      type: "pattern",
      question: { fr: "Complète la ronde !", ar: "أكمل النمط!" },
      visuals: ["🍎", "🍌", "🍎", "🍌", "🍎"],
      options: ["🍎", "🍌", "🍇"],
      answer: "🍌",
    },
    {
      id: "e3",
      type: "pattern",
      question: { fr: "Trouve la suite !", ar: "جد الشكل التالي!" },
      visuals: ["🔴", "🔵", "🔴", "🔵", "🔴"],
      options: ["🔴", "🔵", "🟡"],
      answer: "🔵",
    }
  ],
  medium: [
    {
      id: "m1",
      type: "sequence",
      question: { fr: "Quel nombre manque ?", ar: "ما الرقم الناقص؟" },
      visuals: ["2", "4", "6", "8"],
      options: ["9", "10", "12"],
      answer: "10",
    },
    {
      id: "m2",
      type: "sequence",
      question: { fr: "Saute de 5 en 5 !", ar: "اقفز بـ ٥!" },
      visuals: ["5", "10", "15", "20"],
      options: ["21", "25", "30"],
      answer: "25",
    },
    {
      id: "m3",
      type: "pattern",
      question: { fr: "Suis les formes !", ar: "اتبع الأشكال!" },
      visuals: ["📐", "📏", "📐", "📏"],
      options: ["📏", "📐", "🖍️"],
      answer: "📐",
    }
  ],
  hard: [
    {
      id: "h1",
      type: "grid",
      question: { fr: "Complète la grille magique !", ar: "أكمل الشبكة السحرية!" },
      visuals: ["1", "2", "3", "2", "3", "1", "3", "1", "?"],
      options: ["1", "2", "3"],
      answer: "2",
    },
    {
      id: "h2",
      type: "sequence",
      question: { fr: "Trouve la logique !", ar: "جد المنطق!" },
      visuals: ["1", "2", "4", "8"],
      options: ["10", "12", "16"],
      answer: "16",
    },
    {
      id: "h3",
      type: "grid",
      question: { fr: "L'intrus cosmique !", ar: "الدخيل الكوني!" },
      visuals: ["🚀", "🛸", "🚀", "🛸", "🚀", "🛸", "🚀", "🛸", "?"],
      options: ["🚀", "🛸", "🛰️"],
      answer: "🚀",
    }
  ]
};