import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalPlayer, getWeekStartString } from "./player";
import { getStoredAttempts } from "./attempts";

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  school: string;
  xp: number;
  isMe?: boolean;
}

export type LeaderboardStatus = "loading" | "ok" | "empty" | "error";

export async function fetchLeaderboard(scope: "all" | "school"): Promise<{
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  status: LeaderboardStatus;
  errorMessage?: string;
}> {
  const player = getLocalPlayer();
  const weekStart = getWeekStartString();

  // 1. Tính XP tuần hiện tại của chính người dùng từ attempts local
  const attempts = getStoredAttempts();
  const weekStartDate = new Date(weekStart);
  const myWeekXp = attempts
    .filter((a) => new Date(a.createdAt) >= weekStartDate && a.isCorrect)
    .reduce((sum, a) => sum + (a.xp || 10), 0);

  // Nếu chưa cấu hình Supabase
  if (!isSupabaseConfigured || !supabase) {
    return {
      entries: [],
      myEntry: player ? {
        rank: 1,
        playerId: player.id,
        nickname: player.nickname,
        school: player.school,
        xp: myWeekXp,
        isMe: true,
      } : null,
      status: "error",
      errorMessage: "Chưa kết nối máy chủ xếp hạng.",
    };
  }

  try {
    const query = supabase
      .from("weekly_xp")
      .select("player_id, xp, players!inner(nickname, school, is_internal)")
      .eq("week_start", weekStart)
      .eq("players.is_internal", false)
      .order("xp", { ascending: false })
      .limit(50);

    const { data, error } = await query;
    if (error) {
      console.error("Supabase leaderboard query error:", error);
      return {
        entries: [],
        myEntry: null,
        status: "error",
        errorMessage: "Không thể tải dữ liệu xếp hạng lúc này. Vui lòng thử lại sau.",
      };
    }

    // Nếu bảng weekly_xp rỗng hoặc tuần này chưa có ai
    if (!data || data.length === 0) {
      const myEntry: LeaderboardEntry | null = (player && myWeekXp > 0)
        ? {
            rank: 1,
            playerId: player.id,
            nickname: player.nickname,
            school: player.school,
            xp: myWeekXp,
            isMe: true,
          }
        : null;

      return {
        entries: [],
        myEntry,
        status: "empty",
      };
    }

    let list: LeaderboardEntry[] = data.map((row: Record<string, unknown>, idx: number) => ({
      rank: idx + 1,
      playerId: row.player_id as string,
      nickname: (row.players as { nickname?: string } | undefined)?.nickname || "Ẩn danh",
      school: (row.players as { school?: string } | undefined)?.school || "Khác",
      xp: Number(row.xp) || 0,
      isMe: player?.id === row.player_id,
    }));

    if (scope === "school" && player?.school) {
      list = list.filter((e) => e.school === player.school);
      list.forEach((e, idx) => (e.rank = idx + 1));
    }

    const myEntry = list.find((e) => e.isMe) || (player && myWeekXp > 0 ? {
      rank: list.length + 1,
      playerId: player.id,
      nickname: player.nickname,
      school: player.school,
      xp: myWeekXp,
      isMe: true,
    } : null);

    return {
      entries: list,
      myEntry,
      status: list.length > 0 ? "ok" : "empty",
    };
  } catch (err: unknown) {
    console.error("Supabase leaderboard query exception:", err);
    return {
      entries: [],
      myEntry: null,
      status: "error",
      errorMessage: err instanceof Error ? err.message : "Lỗi kết nối mạng",
    };
  }
}
