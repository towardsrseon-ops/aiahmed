export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'en' | 'ar';

export interface VocabularyWord {
  english: string;
  arabic: string;
  simpleExplanation?: string;
  example?: string;
  difficulty?: Difficulty;
}

export interface Chunk {
  part: string;
  meaning: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: {
    english: string;
    arabic: string;
  };
  arabicExplanation: string;
  keywords: VocabularyWord[];
  difficulty: Difficulty;
  chunks: Chunk[];
  howToThink: string[];
  contextLiteral: string;
  contextReal: string;
}

export interface ReverseChallenge {
  arabic: string;
  english: string;
  hints: string[];
}

export interface UserStats {
  points: number;
  level: number;
  mistakesLineage: Record<string, number>; // Track specific words/patterns
  completedQuests: number;
}

export interface QuizSession {
  questions: Question[];
  currentIndex: number;
  score: number;
  answers: (number | null)[];
  isComplete: boolean;
  difficulty: Difficulty;
  mode: 'practice' | 'exam' | 'trainer';
  currentStep: 'question' | 'thinking' | 'guessing' | 'feedback';
}

export interface TranslationResult {
  simpleArabic: string;
  vocabulary: VocabularyWord[];
  breakdown: {
    part: string;
    explanation: string;
  }[];
  thinkStrategy: string;
}
