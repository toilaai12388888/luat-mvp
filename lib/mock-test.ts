import { getAllQuizItems } from "./all-questions";
import { QuizQuestion } from "./all-questions";

export interface MockTestConfig {
  subject: "all" | "dan-su" | "hanh-chinh" | "doanh-nghiep";
  chapter: "all" | "c01" | "c02";
  questionCount: 10 | 20 | 40;
}

export interface MockTestResultRecord {
  id: string;
  createdAt: string;
  subject: string;
  chapter: string;
  score: number; // Scale of 10
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
}

const MOCK_HISTORY_KEY = "luat_mock_history";

export function getMockTestHistory(): MockTestResultRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMockTestResult(record: Omit<MockTestResultRecord, "id" | "createdAt">): MockTestResultRecord {
  const newEntry: MockTestResultRecord = {
    ...record,
    id: `mock-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const history = getMockTestHistory();
      history.unshift(newEntry);
      localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
      window.dispatchEvent(new Event("luat_mock_history_updated"));
    } catch (err) {
      console.error("Failed to save mock test history:", err);
    }
  }

  return newEntry;
}

export function generateMockQuestions(config: MockTestConfig): QuizQuestion[] {
  const all = getAllQuizItems();

  const filtered = all.filter((item) => {
    if (config.subject !== "all" && item.subject !== config.subject) return false;
    if (config.chapter !== "all" && item.chapter !== config.chapter) return false;
    return true;
  });

  // Fisher-Yates shuffle
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
}
