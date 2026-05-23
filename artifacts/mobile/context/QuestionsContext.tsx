import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Platform = "LeetCode" | "GFG" | "Codeforces" | "Other";

export const ALL_TAGS = [
  "DP",
  "Graph",
  "Trees",
  "Sliding Window",
  "Two Pointers",
  "Binary Search",
  "Backtracking",
  "Sorting",
  "Hashing",
  "Greedy",
  "Recursion",
  "Stack",
  "Queue",
  "Linked List",
  "Heap",
  "Trie",
  "Math",
  "Bit Manipulation",
  "String",
  "Array",
];

export const PLATFORMS: Platform[] = ["LeetCode", "GFG", "Codeforces", "Other"];

const revisionDaysMap: Record<number, number> = {
  1: 2,
  2: 3,
  3: 5,
  4: 7,
  5: 10,
};

export function calculateNextRevisionDate(lastRevised: string, confidence: number): string {
  const date = new Date(lastRevised);
  date.setDate(date.getDate() + (revisionDaysMap[confidence] ?? 5));
  return date.toISOString().split("T")[0];
}

export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function isDueForRevision(nextRevisionDate: string): boolean {
  return nextRevisionDate <= todayString();
}

export function confidenceColor(
  confidence: number,
  colors: { success: string; warning: string; danger: string }
): string {
  if (confidence <= 2) return colors.danger;
  if (confidence === 3) return colors.warning;
  return colors.success;
}

export function confidenceBg(
  confidence: number,
  colors: { successLight: string; warningLight: string; dangerLight: string }
): string {
  if (confidence <= 2) return colors.dangerLight;
  if (confidence === 3) return colors.warningLight;
  return colors.successLight;
}

export interface Question {
  id: string;
  name: string;
  platform: Platform;
  tags: string[];
  approach: string;
  timeComplexity: string;
  confidenceLevel: 1 | 2 | 3 | 4 | 5;
  lastRevisedDate: string;
  mistakeNotes: string;
  nextRevisionDate: string;
}

export type QuestionInput = Omit<Question, "id" | "nextRevisionDate">;

export interface RevisionEntry {
  date: string;
  confidence: number;
  questionId: string;
}

interface QuestionsContextType {
  questions: Question[];
  revisionHistory: RevisionEntry[];
  addQuestion: (q: QuestionInput) => Promise<void>;
  updateQuestion: (id: string, q: QuestionInput) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  markRevised: (id: string) => Promise<void>;
  loaded: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

const STORAGE_KEY = "@dsa_questions_v1";
const HISTORY_KEY = "@dsa_revision_history_v1";

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<RevisionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [stored, history] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      if (stored) setQuestions(JSON.parse(stored));
      if (history) setRevisionHistory(JSON.parse(history));
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }

  async function persist(qs: Question[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
    setQuestions(qs);
  }

  async function persistHistory(entries: RevisionEntry[]) {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    setRevisionHistory(entries);
  }

  async function addQuestion(q: QuestionInput) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newQ: Question = {
      ...q,
      id,
      nextRevisionDate: calculateNextRevisionDate(q.lastRevisedDate, q.confidenceLevel),
    };
    await persist([...questions, newQ]);
  }

  async function updateQuestion(id: string, q: QuestionInput) {
    const updated = questions.map((existing) =>
      existing.id === id
        ? {
            ...q,
            id,
            nextRevisionDate: calculateNextRevisionDate(q.lastRevisedDate, q.confidenceLevel),
          }
        : existing
    );
    await persist(updated);
  }

  async function deleteQuestion(id: string) {
    await persist(questions.filter((q) => q.id !== id));
    await persistHistory(revisionHistory.filter((e) => e.questionId !== id));
  }

  async function markRevised(id: string) {
    const today = todayString();
    const question = questions.find((q) => q.id === id);
    const updated = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            lastRevisedDate: today,
            nextRevisionDate: calculateNextRevisionDate(today, q.confidenceLevel),
          }
        : q
    );
    await persist(updated);

    if (question) {
      const entry: RevisionEntry = {
        date: today,
        confidence: question.confidenceLevel,
        questionId: id,
      };
      await persistHistory([...revisionHistory, entry]);
    }
  }

  return (
    <QuestionsContext.Provider
      value={{ questions, revisionHistory, addQuestion, updateQuestion, deleteQuestion, markRevised, loaded }}
    >
      {children}
    </QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const ctx = useContext(QuestionsContext);
  if (!ctx) throw new Error("useQuestions must be used within QuestionsProvider");
  return ctx;
}
