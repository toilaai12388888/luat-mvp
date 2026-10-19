import { getStoredAttempts, StoredAttempt } from "./attempts";

export interface SubjectStat {
  slug: string;
  answered: number;
  pctCorrect: number;
}

export interface LastChapterStat {
  mon: string;
  chuong: string;
  done: number;
  total: number;
}

export interface UserStats {
  loggedIn: boolean;
  xp: number;
  streak: number;
  doneToday: number;
  answered: number;
  pctCorrect: number;
  week: boolean[];
  bySubject: SubjectStat[];
  lastChapter: LastChapterStat | null;
}

function getVNDateString(d: Date): string {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 7 * 3600000);
  const y = vnTime.getFullYear();
  const m = String(vnTime.getMonth() + 1).padStart(2, "0");
  const day = String(vnTime.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeStatsFromAttempts(attempts: StoredAttempt[]): UserStats {
  const now = new Date();
  const todayVN = getVNDateString(now);

  const yesterday = new Date(now.getTime() - 24 * 3600000);
  const yesterdayVN = getVNDateString(yesterday);

  let xp = 0;
  let doneToday = 0;
  let correctCount = 0;

  const dateSet = new Set<string>();
  const subjectMap = new Map<string, { total: number; correct: number }>();

  let lastMon = "dan-su";
  let lastChuong = "c01";

  for (const a of attempts) {
    xp += a.xp || 0;
    if (a.isCorrect) correctCount++;

    const aDateVN = getVNDateString(new Date(a.createdAt));
    dateSet.add(aDateVN);

    if (aDateVN === todayVN) {
      doneToday++;
    }

    const currentSub = subjectMap.get(a.subject) || { total: 0, correct: 0 };
    currentSub.total++;
    if (a.isCorrect) currentSub.correct++;
    subjectMap.set(a.subject, currentSub);

    lastMon = a.subject;
    const parts = a.itemId.split("-");
    if (parts.length >= 2) {
      lastChuong = parts[parts.length - 2];
    }
  }

  let streak = 0;
  let checkDate = now;
  if (!dateSet.has(todayVN)) {
    if (dateSet.has(yesterdayVN)) {
      checkDate = yesterday;
    } else {
      checkDate = new Date(0);
    }
  }

  if (checkDate.getTime() > 0) {
    let curr = new Date(checkDate);
    while (dateSet.has(getVNDateString(curr))) {
      streak++;
      curr = new Date(curr.getTime() - 24 * 3600000);
    }
  }

  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now.getTime() - dayOfWeek * 24 * 3600000);

  const week: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday.getTime() + i * 24 * 3600000);
    week.push(dateSet.has(getVNDateString(dayDate)));
  }

  const subjects = ["dan-su", "hanh-chinh", "doanh-nghiep"];
  const bySubject: SubjectStat[] = subjects.map((slug) => {
    const stat = subjectMap.get(slug);
    if (!stat || stat.total === 0) {
      return { slug, answered: 0, pctCorrect: 0 };
    }
    return {
      slug,
      answered: stat.total,
      pctCorrect: Math.round((stat.correct / stat.total) * 100),
    };
  });

  const totalAnswered = attempts.length;
  const pctCorrect = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  let lastChapterDone = 0;
  for (const a of attempts) {
    if (a.subject === lastMon && a.itemId.includes(`-${lastChuong}-`)) {
      lastChapterDone++;
    }
  }

  const lastChapter: LastChapterStat = {
    mon: lastMon,
    chuong: lastChuong,
    done: lastChapterDone,
    total: 25,
  };

  return {
    loggedIn: false,
    xp,
    streak,
    doneToday,
    answered: totalAnswered,
    pctCorrect,
    week,
    bySubject,
    lastChapter,
  };
}

export async function getMyStats(): Promise<UserStats> {
  const attempts = getStoredAttempts();
  return computeStatsFromAttempts(attempts);
}
export function getStoredStreak(): number {
  const attempts = getStoredAttempts();
  return computeStatsFromAttempts(attempts).streak;
}
