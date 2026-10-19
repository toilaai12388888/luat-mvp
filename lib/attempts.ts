import { syncWeeklyXpToSupabase } from "./player";

export interface SaveAttemptInput {
  itemId: string;
  itemType: "mcq" | "nhan_dinh";
  subject: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  isCorrect: boolean;
  xp: number;
}

export interface StoredAttempt extends SaveAttemptInput {
  id: string;
  createdAt: string;
}

const STORAGE_KEY = "luat_attempts";
const BOOKMARKS_KEY = "luat_bookmarks";
const WRONG_TRACKER_KEY = "luat_wrong_tracker";

export interface WrongItemState {
  wrongCount: number;
  consecutiveCorrect: number;
  lastUpdated: string;
}

export type WrongTracker = Record<string, WrongItemState>;

export async function saveAttempt(input: SaveAttemptInput): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // 1. Save attempt log
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: StoredAttempt[] = raw ? JSON.parse(raw) : [];
    const newEntry: StoredAttempt = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    // 2. Update wrong tracker (consecutive 2 correct to clear)
    const trackerRaw = localStorage.getItem(WRONG_TRACKER_KEY);
    const tracker: WrongTracker = trackerRaw ? JSON.parse(trackerRaw) : {};
    const current = tracker[input.itemId] || {
      wrongCount: 0,
      consecutiveCorrect: 0,
      lastUpdated: new Date().toISOString(),
    };

    if (input.isCorrect) {
      current.consecutiveCorrect += 1;
      current.lastUpdated = new Date().toISOString();
      tracker[input.itemId] = current;
    } else {
      current.wrongCount += 1;
      current.consecutiveCorrect = 0; // reset
      current.lastUpdated = new Date().toISOString();
      tracker[input.itemId] = current;
    }
    localStorage.setItem(WRONG_TRACKER_KEY, JSON.stringify(tracker));

    // 3. Dispatch update event
    window.dispatchEvent(new Event("luat_attempts_updated"));

    // 4. Sync weekly XP to Supabase if earned
    if (input.xp > 0) {
      syncWeeklyXpToSupabase(input.xp).catch(() => {});
    }
  } catch {
    // Khong bao gio nem loi ra UI
  }
}

export function getStoredAttempts(): StoredAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ==========================================
// BOOKMARK SYSTEM (Đánh dấu câu)
// ==========================================
export function getBookmarkedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(itemId: string): boolean {
  return getBookmarkedIds().includes(itemId);
}

export function toggleBookmark(itemId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getBookmarkedIds();
    let nextList: string[];
    let nowBookmarked: boolean;

    if (list.includes(itemId)) {
      nextList = list.filter((id) => id !== itemId);
      nowBookmarked = false;
    } else {
      nextList = [...list, itemId];
      nowBookmarked = true;
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new Event("luat_bookmarks_updated"));
    return nowBookmarked;
  } catch {
    return false;
  }
}

// ==========================================
// ACTIVE WRONG QUESTIONS (Câu sai cần phục thù)
// ==========================================
export function getActiveWrongIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const trackerRaw = localStorage.getItem(WRONG_TRACKER_KEY);
    if (!trackerRaw) return [];
    const tracker: WrongTracker = JSON.parse(trackerRaw);

    // Question stays active in wrong list if wrongCount > 0 and consecutiveCorrect < 2
    return Object.keys(tracker).filter((id) => {
      const state = tracker[id];
      return state.wrongCount > 0 && state.consecutiveCorrect < 2;
    });
  } catch {
    return [];
  }
}

export function getWrongItemState(itemId: string): WrongItemState | null {
  if (typeof window === "undefined") return null;
  try {
    const trackerRaw = localStorage.getItem(WRONG_TRACKER_KEY);
    if (!trackerRaw) return null;
    const tracker: WrongTracker = JSON.parse(trackerRaw);
    return tracker[itemId] ?? null;
  } catch {
    return null;
  }
}
