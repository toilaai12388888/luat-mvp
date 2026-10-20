import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalPlayer } from "./player";

export interface Challenge {
  id: string;
  creatorId: string;
  creatorNickname: string;
  creatorSchool: string;
  creatorScore: number;
  itemIds: string[];
  createdAt: string;
}

export interface ChallengeResult {
  id: string;
  challengeId: string;
  playerId: string;
  nickname: string;
  school: string;
  score: number;
  createdAt: string;
}

const LOCAL_CHALLENGES_KEY = "luat_challenges_local";
const LOCAL_RESULTS_KEY = "luat_challenge_results_local";

function toBase64Url(str: string): string {
  try {
    if (typeof window !== "undefined" && window.btoa) {
      return window.btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
    return Buffer.from(str, "utf-8").toString("base64url");
  } catch {
    return "";
  }
}

function fromBase64Url(b64: string): string {
  try {
    if (typeof window !== "undefined" && window.atob) {
      const base64 = b64.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
      return decodeURIComponent(escape(window.atob(padded)));
    }
    return Buffer.from(b64, "base64url").toString("utf-8");
  } catch {
    return "";
  }
}

export async function createChallenge(
  itemIds: string[],
  creatorScore: number
): Promise<string> {
  const player = getLocalPlayer();
  const nickname = player?.nickname || "Bạn học";
  const school = player?.school || "Sinh viên Luật";

  // Self-contained compact payload so challenges work via link in incognito / other devices
  const payload = {
    q: itemIds,
    s: creatorScore,
    n: nickname,
    sc: school,
    t: Date.now(),
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const id = encoded ? `c-v1-${encoded}` : `c-${Math.random().toString(36).substring(2, 9)}`;

  const challenge: Challenge = {
    id,
    creatorId: player?.id || "anon",
    creatorNickname: nickname,
    creatorSchool: school,
    creatorScore,
    itemIds,
    createdAt: new Date().toISOString(),
  };

  // Try saving to Supabase if configured
  if (isSupabaseConfigured && supabase && player && !player.id.startsWith("anon-")) {
    try {
      await supabase.from("challenges").insert({
        id: challenge.id,
        creator_id: player.id,
        item_ids: challenge.itemIds,
        creator_score: challenge.creatorScore,
      });
    } catch (err) {
      console.warn("Error inserting challenge to Supabase:", err);
    }
  }

  // Always save locally as fallback
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_CHALLENGES_KEY);
      const list: Challenge[] = raw ? JSON.parse(raw) : [];
      list.push(challenge);
      localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify(list));
    } catch {}
  }

  return id;
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  // 1. Try decoding self-contained link payload (works seamlessly in incognito & across devices)
  if (id.startsWith("c-v1-")) {
    const rawB64 = id.slice(5);
    const jsonStr = fromBase64Url(rawB64);
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && Array.isArray(parsed.q) && parsed.q.length > 0) {
          return {
            id,
            creatorId: "shared",
            creatorNickname: parsed.n || "Bạn học",
            creatorSchool: parsed.sc || "Sinh viên Luật",
            creatorScore: Number(parsed.s) || 0,
            itemIds: parsed.q,
            createdAt: parsed.t ? new Date(parsed.t).toISOString() : new Date().toISOString(),
          };
        }
      } catch {}
    }
  }

  // 2. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, creator_id, item_ids, creator_score, created_at, players(nickname, school)")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          creatorId: data.creator_id,
          creatorNickname: (data.players as unknown as { nickname?: string })?.nickname || "Bạn học",
          creatorSchool: (data.players as unknown as { school?: string })?.school || "Sinh viên Luật",
          creatorScore: data.creator_score,
          itemIds: data.item_ids,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Failed to fetch challenge from Supabase:", err);
    }
  }

  // 3. Fallback to local
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_CHALLENGES_KEY);
      if (raw) {
        const list: Challenge[] = JSON.parse(raw);
        return list.find((c) => c.id === id) || null;
      }
    } catch {}
  }

  return null;
}

export async function submitChallengeResult(
  challengeId: string,
  score: number
): Promise<void> {
  const player = getLocalPlayer();

  const result: ChallengeResult = {
    id: `res-${Date.now()}`,
    challengeId,
    playerId: player?.id || "anon",
    nickname: player?.nickname || "Bạn học",
    school: player?.school || "Sinh viên Luật",
    score,
    createdAt: new Date().toISOString(),
  };

  // Supabase save
  if (isSupabaseConfigured && supabase && player && !player.id.startsWith("anon-")) {
    try {
      await supabase.from("challenge_results").insert({
        challenge_id: challengeId,
        player_id: player.id,
        score,
      });
    } catch (err) {
      console.warn("Failed to insert challenge result:", err);
    }
  }

  // Local save
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
      const list: ChallengeResult[] = raw ? JSON.parse(raw) : [];
      list.push(result);
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(list));
    } catch {}
  }
}

export async function getChallengeResults(challengeId: string): Promise<ChallengeResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("challenge_results")
        .select("id, challenge_id, player_id, score, created_at, players(nickname, school)")
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((d: Record<string, unknown>) => ({
          id: String(d.id),
          challengeId: String(d.challenge_id),
          playerId: String(d.player_id),
          nickname: (d.players as { nickname?: string } | undefined)?.nickname || "Bạn học",
          school: (d.players as { school?: string } | undefined)?.school || "Sinh viên Luật",
          score: Number(d.score),
          createdAt: String(d.created_at),
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch challenge results:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
      if (raw) {
        const list: ChallengeResult[] = JSON.parse(raw);
        return list.filter((r) => r.challengeId === challengeId);
      }
    } catch {}
  }

  return [];
}
