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

export async function saveAttempt(input: SaveAttemptInput): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: StoredAttempt[] = raw ? JSON.parse(raw) : [];
    const newEntry: StoredAttempt = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("luat_attempts_updated"));
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