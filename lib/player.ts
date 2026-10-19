import { supabase, isSupabaseConfigured } from "./supabase";

export const LAW_SCHOOLS = [
  "ĐH Luật Hà Nội",
  "ĐH Luật TP.HCM",
  "Khoa Luật ĐHQGHN",
  "Học viện Tư pháp",
  "ĐH Kinh tế - Luật",
  "Học viện Ngoại giao",
  "ĐH Ngoại thương",
  "Khác",
] as const;

export type LawSchool = (typeof LAW_SCHOOLS)[number] | string;

export interface PlayerProfile {
  id: string; // auth.uid
  nickname: string;
  school: LawSchool;
  createdAt: string;
}

const PLAYER_STORAGE_KEY = "luat_player";

// Simple profanity list
const BANNED_WORDS = [
  "dm",
  "dcm",
  "vcl",
  "cl",
  "vl",
  "lon",
  "cac",
  "buoi",
  "dit",
  "du",
  "deo",
  "cho chet",
  "oc cho",
];

export function hasProfanity(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ");

  const words = normalized.split(/\s+/).filter(Boolean);
  return words.some((w) => BANNED_WORDS.includes(w));
}

export function getLocalPlayer(): PlayerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalPlayer(player: PlayerProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
  } catch (err) {
    console.error("Failed to save local player:", err);
  }
}

export function getWeekStartString(date = new Date()): string {
  // Monday of the current week (ISO week)
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function ensureAnonymousPlayer(
  nickname: string,
  school: string
): Promise<{ success: boolean; player?: PlayerProfile; error?: string }> {
  const trimmedNick = nickname.trim();
  if (!trimmedNick) {
    return { success: false, error: "Vui lòng nhập biệt danh." };
  }
  if (trimmedNick.length < 2 || trimmedNick.length > 24) {
    return { success: false, error: "Biệt danh từ 2 đến 24 ký tự." };
  }
  if (hasProfanity(trimmedNick)) {
    return { success: false, error: "Biệt danh chứa từ ngữ không phù hợp." };
  }

  // If Supabase is not configured or fails, save locally
  if (!isSupabaseConfigured || !supabase) {
    const localOnly: PlayerProfile = {
      id: "anon-" + Math.random().toString(36).substring(2, 9),
      nickname: trimmedNick,
      school,
      createdAt: new Date().toISOString(),
    };
    saveLocalPlayer(localOnly);
    return { success: true, player: localOnly };
  }

  try {
    // 1. Sign in anonymously
    const { data: authData } = await supabase.auth.getSession();
    let user = authData?.session?.user;

    if (!user) {
      const signInRes = await supabase.auth.signInAnonymously();
      if (signInRes.error) {
        console.warn("Anonymous sign in failed, fallback to local:", signInRes.error);
        const fallback: PlayerProfile = {
          id: "anon-" + Math.random().toString(36).substring(2, 9),
          nickname: trimmedNick,
          school,
          createdAt: new Date().toISOString(),
        };
        saveLocalPlayer(fallback);
        return { success: true, player: fallback };
      }
      user = signInRes.data.user!;
    }

    // 2. Insert or update in public.players
    const player: PlayerProfile = {
      id: user.id,
      nickname: trimmedNick,
      school,
      createdAt: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from("players").upsert({
      id: player.id,
      nickname: player.nickname,
      school: player.school,
    });

    if (upsertError) {
      console.error("Error upserting player:", upsertError);
    }

    saveLocalPlayer(player);
    return { success: true, player };
  } catch (err: unknown) {
    console.error("ensureAnonymousPlayer exception:", err);
    const fallback: PlayerProfile = {
      id: "anon-" + Math.random().toString(36).substring(2, 9),
      nickname: trimmedNick,
      school,
      createdAt: new Date().toISOString(),
    };
    saveLocalPlayer(fallback);
    return { success: true, player: fallback };
  }
}

export async function syncWeeklyXpToSupabase(deltaXp: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase || deltaXp <= 0) return;

  const player = getLocalPlayer();
  if (!player || player.id.startsWith("anon-")) return;

  try {
    const weekStart = getWeekStartString();

    // Fetch existing weekly record
    const { data, error } = await supabase
      .from("weekly_xp")
      .select("xp")
      .eq("player_id", player.id)
      .eq("week_start", weekStart)
      .maybeSingle();

    if (error) {
      console.warn("Failed to fetch weekly_xp:", error);
      return;
    }

    const currentXp = data?.xp ?? 0;
    const newXp = currentXp + deltaXp;

    await supabase.from("weekly_xp").upsert({
      player_id: player.id,
      week_start: weekStart,
      xp: newXp,
    });
  } catch (err) {
    console.error("syncWeeklyXpToSupabase error:", err);
  }
}
