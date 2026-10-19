import { getAllQuizItems } from "./all-questions";
import { QuizItem } from "@/components/quiz/useQuizSession";

export interface DailyResultRecord {
  date: string; // YYYY-MM-DD
  completed: boolean;
  answers: (number | "dung" | "sai")[];
  results: boolean[]; // true for correct, false for wrong
  score: number; // e.g. 4
  total: 5;
  completedAt: string;
}

const DAILY_STORAGE_KEY = "luat_daily_challenge";

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyRecord(dateStr = getTodayDateString()): DailyResultRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return null;
    const data: Record<string, DailyResultRecord> = JSON.parse(raw);
    return data[dateStr] ?? null;
  } catch {
    return null;
  }
}

export function saveDailyRecord(record: DailyResultRecord): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    const data: Record<string, DailyResultRecord> = raw ? JSON.parse(raw) : {};
    data[record.date] = record;
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("luat_daily_updated"));
  } catch (err) {
    console.error("Failed to save daily challenge record:", err);
  }
}

// Seeded PRNG to deterministically select 5 questions for any given date
function pseudoRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDailyQuestions(dateStr = getTodayDateString()): QuizItem[] {
  const all = getAllQuizItems();
  if (all.length === 0) return [];

  // Create numeric seed from YYYY-MM-DD string
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
  }

  const rng = pseudoRandom(seed);
  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 5);
}

export function formatWordleShareText(record: DailyResultRecord, streak = 1): string {
  const [, month, day] = record.date.split("-");
  const squares = record.results.map((r) => (r ? "🟩" : "🟥")).join(" ");

  return `⚖️ LUẬT LẸ — THỬ THÁCH NGÀY ${day}/${month}
Điểm: ${record.score}/${record.total} câu đúng (+${record.score * 10} XP)
${squares}
Chuỗi học tập: 🔥 ${streak} ngày
Ôn thi luật chủ động tại: https://luat-mvp.vercel.app/`;
}
