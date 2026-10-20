import { getStoredAttempts } from "./attempts";
import { getStoredStreak } from "./stats";
import { getMockTestHistory } from "./mock-test";
import { getDailyRecord } from "./daily-challenge";

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressText: string;
}

const BADGES_KEY = "luat_badges_unlocked";

export function getUnlockedBadgeIds(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUnlockedBadge(id: string) {
  if (typeof window === "undefined") return;
  try {
    const records = getUnlockedBadgeIds();
    if (!records[id]) {
      records[id] = new Date().toISOString();
      localStorage.setItem(BADGES_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent("luat_badge_unlocked", { detail: { badgeId: id } }));
    }
  } catch (err) {
    console.error("Failed to save unlocked badge:", err);
  }
}

export function getSolvedScenarioIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("luat_solved_tinh_huong");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSolvedScenario(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getSolvedScenarioIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem("luat_solved_tinh_huong", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("luat_scenario_solved", { detail: { id } }));
    }
  } catch {}
}

export function checkAllBadges(): Badge[] {
  const attempts = getStoredAttempts();
  const streak = getStoredStreak();
  const mockHistory = getMockTestHistory();
  const todayRecord = getDailyRecord();
  const unlockedMap = getUnlockedBadgeIds();
  const solvedScenarios = getSolvedScenarioIds();

  const totalAttempts = attempts.length;

  const danSuCount = attempts.filter((a) => a.subject === "dan-su" && a.isCorrect).length;
  const hanhChinhCount = attempts.filter((a) => a.subject === "hanh-chinh" && a.isCorrect).length;
  const doanhNghiepCount = attempts.filter((a) => a.subject === "doanh-nghiep" && a.isCorrect).length;

  // Max streak of consecutive correct in attempts
  let currentConsecutive = 0;
  let maxConsecutive = 0;
  for (const a of attempts) {
    if (a.isCorrect) {
      currentConsecutive++;
      if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
    } else {
      currentConsecutive = 0;
    }
  }

  const bestMockScore = mockHistory.length > 0 ? Math.max(...mockHistory.map((m) => m.score)) : 0;

  const badgesDefs = [
    {
      id: "first_question",
      title: "Khởi đầu vững chắc",
      description: "Hoàn thành câu hỏi đầu tiên",
      iconName: "Sparkles",
      isUnlocked: totalAttempts >= 1,
      progressText: `${Math.min(totalAttempts, 1)}/1 câu`,
    },
    {
      id: "combo_5",
      title: "Tay lái lụa",
      description: "Trả lời đúng 5 câu liên tiếp",
      iconName: "Flame",
      isUnlocked: maxConsecutive >= 5,
      progressText: `${Math.min(maxConsecutive, 5)}/5 câu`,
    },
    {
      id: "combo_10",
      title: "Bất khả chiến bại",
      description: "Trả lời đúng 10 câu liên tiếp",
      iconName: "Zap",
      isUnlocked: maxConsecutive >= 10,
      progressText: `${Math.min(maxConsecutive, 10)}/10 câu`,
    },
    {
      id: "streak_3",
      title: "Chăm chỉ 3 ngày",
      description: "Duy trì chuỗi học 3 ngày liên tục",
      iconName: "Calendar",
      isUnlocked: streak >= 3,
      progressText: `${Math.min(streak, 3)}/3 ngày`,
    },
    {
      id: "streak_7",
      title: "Bền bỉ 7 ngày",
      description: "Duy trì chuỗi học 7 ngày liên tục",
      iconName: "Crown",
      isUnlocked: streak >= 7,
      progressText: `${Math.min(streak, 7)}/7 ngày`,
    },
    {
      id: "mock_passed",
      title: "Chiến binh thi cử",
      description: "Đạt từ 5.0 điểm thi thử có giờ",
      iconName: "CheckCircle2",
      isUnlocked: bestMockScore >= 5.0,
      progressText: `${bestMockScore.toFixed(1)}/5.0 điểm`,
    },
    {
      id: "mock_master",
      title: "Thủ khoa tiềm năng",
      description: "Đạt từ 8.0 điểm thi thử có giờ",
      iconName: "Award",
      isUnlocked: bestMockScore >= 8.0,
      progressText: `${bestMockScore.toFixed(1)}/8.0 điểm`,
    },
    {
      id: "daily_perfect",
      title: "Ngày hoàn hảo",
      description: "Đạt 5/5 câu đúng trong Thử thách hằng ngày",
      iconName: "Star",
      isUnlocked: todayRecord !== null && todayRecord.score === 5,
      progressText: todayRecord ? `${todayRecord.score}/5 đúng` : "0/5 đúng",
    },
    {
      id: "tinh_huong_5",
      title: "Giải 5 tình huống",
      description: "Giải thành công 5 bài tập tình huống thực tiễn",
      iconName: "Scale",
      isUnlocked: solvedScenarios.length >= 5,
      progressText: `${Math.min(solvedScenarios.length, 5)}/5 tình huống`,
    },
    {
      id: "contributor",
      title: "Người đóng góp",
      description: "Đóng góp câu hỏi cho cộng đồng",
      iconName: "HeartHandshake",
      isUnlocked: Boolean(unlockedMap["contributor"]),
      progressText: unlockedMap["contributor"] ? "Đã đạt" : "0/1 câu",
    },
    {
      id: "dan_su_master",
      title: "Tinh thông Dân sự",
      description: "Làm đúng từ 20 câu môn Dân sự",
      iconName: "BookOpen",
      isUnlocked: danSuCount >= 20,
      progressText: `${Math.min(danSuCount, 20)}/20 câu`,
    },
    {
      id: "hanh_chinh_master",
      title: "Tinh thông Hành chính",
      description: "Làm đúng từ 20 câu môn Hành chính",
      iconName: "Shield",
      isUnlocked: hanhChinhCount >= 20,
      progressText: `${Math.min(hanhChinhCount, 20)}/20 câu`,
    },
    {
      id: "doanh_nghiep_master",
      title: "Tinh thông Doanh nghiệp",
      description: "Làm đúng từ 20 câu môn Doanh nghiệp",
      iconName: "Briefcase",
      isUnlocked: doanhNghiepCount >= 20,
      progressText: `${Math.min(doanhNghiepCount, 20)}/20 câu`,
    },
    {
      id: "century_club",
      title: "Câu lạc bộ 100 câu",
      description: "Tích lũy hoàn thành 100 câu hỏi",
      iconName: "Trophy",
      isUnlocked: totalAttempts >= 100,
      progressText: `${Math.min(totalAttempts, 100)}/100 câu`,
    },
  ];

  return badgesDefs.map((b) => {
    const isUnlocked = b.isUnlocked || Boolean(unlockedMap[b.id]);
    if (b.isUnlocked && !unlockedMap[b.id]) {
      saveUnlockedBadge(b.id);
    }
    return {
      id: b.id,
      title: b.title,
      description: b.description,
      iconName: b.iconName,
      unlocked: isUnlocked,
      unlockedAt: unlockedMap[b.id],
      progressText: isUnlocked ? "Đã đạt" : b.progressText,
    };
  });
}
