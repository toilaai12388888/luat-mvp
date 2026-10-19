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

// Seed mock players when offline/unconfigured
const MOCK_LEADERS: Omit<LeaderboardEntry, "rank">[] = [
  { playerId: "p1", nickname: "MinhTrang_HLU", school: "ĐH Luật Hà Nội", xp: 580 },
  { playerId: "p2", nickname: "TuanAnh_ULaw", school: "ĐH Luật TP.HCM", xp: 520 },
  { playerId: "p3", nickname: "BaoNgoc_VNU", school: "Khoa Luật ĐHQGHN", xp: 470 },
  { playerId: "p4", nickname: "HoangLong_UEL", school: "ĐH Kinh tế - Luật", xp: 440 },
  { playerId: "p5", nickname: "ThanhThao_DAV", school: "Học viện Ngoại giao", xp: 410 },
  { playerId: "p6", nickname: "QuocHuy_FTU", school: "ĐH Ngoại thương", xp: 390 },
  { playerId: "p7", nickname: "KimNgan_HLU", school: "ĐH Luật Hà Nội", xp: 360 },
  { playerId: "p8", nickname: "DucThang_HVTP", school: "Học viện Tư pháp", xp: 340 },
  { playerId: "p9", nickname: "HaMy_ULaw", school: "ĐH Luật TP.HCM", xp: 310 },
  { playerId: "p10", nickname: "DuyKhang_VNU", school: "Khoa Luật ĐHQGHN", xp: 290 },
  { playerId: "p11", nickname: "PhuongAnh_HLU", school: "ĐH Luật Hà Nội", xp: 270 },
  { playerId: "p12", nickname: "MinhTri_UEL", school: "ĐH Kinh tế - Luật", xp: 250 },
  { playerId: "p13", nickname: "ThuHuong_FTU", school: "ĐH Ngoại thương", xp: 230 },
  { playerId: "p14", nickname: "VanNam_HLU", school: "ĐH Luật Hà Nội", xp: 210 },
  { playerId: "p15", nickname: "KhanhLinh_ULaw", school: "ĐH Luật TP.HCM", xp: 190 },
];

export async function fetchLeaderboard(scope: "all" | "school"): Promise<{
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
}> {
  const player = getLocalPlayer();
  const weekStart = getWeekStartString();

  // 1. Calculate my current week XP from attempts
  const attempts = getStoredAttempts();
  const weekStartDate = new Date(weekStart);
  const myWeekXp = attempts
    .filter((a) => new Date(a.createdAt) >= weekStartDate && a.isCorrect)
    .reduce((sum, a) => sum + (a.xp || 10), 0);

  // Try Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const query = supabase
        .from("weekly_xp")
        .select("player_id, xp, players(nickname, school)")
        .eq("week_start", weekStart)
        .order("xp", { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let list: LeaderboardEntry[] = data.map((row: Record<string, unknown>, idx: number) => ({
          rank: idx + 1,
          playerId: row.player_id as string,
          nickname: (row.players as { nickname?: string } | undefined)?.nickname || "Ẩn danh",
          school: (row.players as { school?: string } | undefined)?.school || "Khác",
          xp: row.xp as number,
          isMe: player?.id === row.player_id,
        }));

        if (scope === "school" && player?.school) {
          list = list.filter((e) => e.school === player.school);
          list.forEach((e, idx) => (e.rank = idx + 1));
        }

        const myEntry = list.find((e) => e.isMe) || (player ? {
          rank: list.length + 1,
          playerId: player.id,
          nickname: player.nickname,
          school: player.school,
          xp: myWeekXp,
          isMe: true,
        } : null);

        return { entries: list, myEntry };
      }
    } catch (err) {
      console.warn("Supabase leaderboard query failed, falling back to mock:", err);
    }
  }

  // Fallback: Local + Mock seed
  let combined: Omit<LeaderboardEntry, "rank">[] = [...MOCK_LEADERS];

  if (player) {
    const existingIdx = combined.findIndex((p) => p.playerId === player.id);
    if (existingIdx >= 0) {
      combined[existingIdx].xp = Math.max(combined[existingIdx].xp, myWeekXp);
    } else {
      combined.push({
        playerId: player.id,
        nickname: player.nickname,
        school: player.school,
        xp: myWeekXp,
      });
    }
  }

  // Filter if school scope
  if (scope === "school" && player?.school) {
    combined = combined.filter((p) => p.school === player.school);
  }

  // Sort by XP descending
  combined.sort((a, b) => b.xp - a.xp);

  const ranked: LeaderboardEntry[] = combined.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isMe: player?.id === item.playerId,
  }));

  const myEntry = ranked.find((e) => e.isMe) || null;

  return { entries: ranked.slice(0, 50), myEntry };
}
