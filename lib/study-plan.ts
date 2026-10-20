import { getAllQuizItems, getQuizItemById } from "./all-questions";
import { getStoredAttempts, getActiveWrongIds, saveAttempt } from "./attempts";
import { getSolvedScenarioIds } from "./badges";

export type SubjectSlug = "dan-su" | "hanh-chinh" | "doanh-nghiep";

export const SUBJECT_NAMES: Record<SubjectSlug, string> = {
  "dan-su": "Dân sự",
  "hanh-chinh": "Hành chính",
  "doanh-nghiep": "Doanh nghiệp",
};

export const SUBJECT_FULL_NAMES: Record<SubjectSlug, string> = {
  "dan-su": "Bộ luật Dân sự 2015",
  "hanh-chinh": "Luật Xử lý VPHC 2012",
  "doanh-nghiep": "Luật Doanh nghiệp 2020",
};

export type ExamDates = Partial<Record<SubjectSlug, string>>;

const EXAM_DATES_KEY = "luat_exam_dates";

export function getTodayVNString(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 7 * 3600000);
  const y = vnTime.getFullYear();
  const m = String(vnTime.getMonth() + 1).padStart(2, "0");
  const d = String(vnTime.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getExamDates(): ExamDates {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EXAM_DATES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setExamDate(subject: SubjectSlug, dateStr: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const current = getExamDates();
    if (!dateStr) {
      delete current[subject];
    } else {
      current[subject] = dateStr;
    }
    localStorage.setItem(EXAM_DATES_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("luat_exam_dates_updated"));
  } catch {}
}

export interface SubjectStudyPlan {
  subject: SubjectSlug;
  subjectName: string;
  examDate: string;
  daysLeft: number;
  unansweredCount: number;
  wrongCount: number;
  unsolvedScenarios: number;
  dailyTarget: number;
  doneToday: number;
  isCompletedToday: boolean;
  isRush: boolean;
  rewardClaimedToday: boolean;
}

export function calculateSubjectPlan(subject: SubjectSlug): SubjectStudyPlan | null {
  if (typeof window === "undefined") return null;

  const dates = getExamDates();
  const dateStr = dates[subject];
  if (!dateStr) return null;

  const todayStr = getTodayVNString();
  const targetDate = new Date(`${dateStr}T23:59:59+07:00`);
  const nowDate = new Date();

  const diffMs = targetDate.getTime() - nowDate.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const allItems = getAllQuizItems().filter((item) => item.subject === subject);
  const totalQuestions = allItems.length;

  const attempts = getStoredAttempts();
  const answeredIds = new Set(
    attempts.filter((a) => a.subject === subject).map((a) => a.itemId)
  );
  const unansweredCount = Math.max(0, totalQuestions - answeredIds.size);

  const activeWrongIds = getActiveWrongIds();
  const wrongCount = activeWrongIds.filter((id) => {
    const q = getQuizItemById(id);
    return q?.subject === subject;
  }).length;

  const solvedScenarios = getSolvedScenarioIds();
  const unsolvedScenarios = Math.max(
    0,
    4 - solvedScenarios.filter((id) => id.startsWith(subject)).length
  );

  // Formula: X = (unanswered + wrongActive + unsolvedScenarios) / daysLeft, min 5, max 40
  const effectiveDays = Math.max(1, daysLeft);
  const remainingWork = unansweredCount + wrongCount + unsolvedScenarios;
  const rawTarget = Math.ceil(remainingWork / effectiveDays);
  const dailyTarget = Math.min(40, Math.max(5, rawTarget));

  // Count attempts done today for this subject
  const doneToday = attempts.filter((a) => {
    if (a.subject !== subject) return false;
    const aDate = new Date(a.createdAt);
    const utc = aDate.getTime() + aDate.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 7 * 3600000);
    const y = vnTime.getFullYear();
    const m = String(vnTime.getMonth() + 1).padStart(2, "0");
    const d = String(vnTime.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}` === todayStr && !a.itemId.startsWith("bonus-daily-");
  }).length;

  const isCompletedToday = doneToday >= dailyTarget;
  const rewardKey = `luat_daily_target_reward_${todayStr}_${subject}`;
  const rewardClaimedToday = Boolean(localStorage.getItem(rewardKey));

  // Auto claim reward +20 XP if newly completed
  if (isCompletedToday && !rewardClaimedToday) {
    try {
      localStorage.setItem(rewardKey, "claimed");
      saveAttempt({
        itemId: `bonus-daily-${todayStr}-${subject}`,
        itemType: "mcq",
        subject,
        isCorrect: true,
        xp: 20,
      });
      window.dispatchEvent(
        new CustomEvent("luat_daily_goal_rewarded", {
          detail: { subject, xp: 20 },
        })
      );
    } catch {}
  }

  const isRush = daysLeft <= 3 && daysLeft > 0;

  return {
    subject,
    subjectName: SUBJECT_NAMES[subject],
    examDate: dateStr,
    daysLeft,
    unansweredCount,
    wrongCount,
    unsolvedScenarios,
    dailyTarget,
    doneToday,
    isCompletedToday,
    isRush,
    rewardClaimedToday: isCompletedToday,
  };
}

export function getClosestActivePlan(): SubjectStudyPlan | null {
  const subjects: SubjectSlug[] = ["dan-su", "hanh-chinh", "doanh-nghiep"];
  const plans = subjects
    .map((s) => calculateSubjectPlan(s))
    .filter((p): p is SubjectStudyPlan => p !== null && p.daysLeft > 0);

  if (plans.length === 0) return null;

  // Sort by closest exam date (smallest daysLeft)
  plans.sort((a, b) => a.daysLeft - b.daysLeft);
  return plans[0];
}
