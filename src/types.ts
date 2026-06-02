export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  examCategory?: string;
  progress?: {
    Math: number;
    English: number;
    Reasoning: number;
    GK: number;
  };
  xp?: number;
  streak?: number;
  lastActive?: string;
}

export interface ProgressLog {
  userId: string;
  date: string;
  score: number;
}

export interface StudyStrategy {
  id: string;
  userId: string;
  title: string;
  summary: string;
  schedule: Array<{
    phase: string;
    focus: string;
    activities: string[];
  }>;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  date: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  section: string;
}

export interface MockTest {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  questions?: Question[];
  questionCount?: number;
}

export interface TestResult {
  id: string;
  userId: string;
  testId: string;
  score: number;
  accuracy: number;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  date: string;
}
