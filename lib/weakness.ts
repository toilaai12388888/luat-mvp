import { getStoredAttempts } from "./attempts";
import { getQuizItemById } from "./all-questions";

export interface WeakArticleRecord {
  key: string;
  article: string;
  lawName: string;
  wrongCount: number;
  questionIds: string[];
}

export function getWeakestArticles(): WeakArticleRecord[] {
  const attempts = getStoredAttempts();
  const wrongAttempts = attempts.filter((a) => !a.isCorrect);

  if (wrongAttempts.length === 0) return [];

  const articleMap: Record<
    string,
    { article: string; lawName: string; wrongCount: number; questionIds: Set<string> }
  > = {};

  for (const a of wrongAttempts) {
    const item = getQuizItemById(a.itemId);
    if (!item || !item.can_cu || item.can_cu.length === 0) continue;

    for (const ref of item.can_cu) {
      const key = `${ref.dieu} - ${ref.van_ban}`;
      if (!articleMap[key]) {
        articleMap[key] = {
          article: ref.dieu,
          lawName: ref.van_ban,
          wrongCount: 0,
          questionIds: new Set(),
        };
      }
      articleMap[key].wrongCount++;
      articleMap[key].questionIds.add(item.id);
    }
  }

  const list = Object.entries(articleMap).map(([key, val]) => ({
    key,
    article: val.article,
    lawName: val.lawName,
    wrongCount: val.wrongCount,
    questionIds: Array.from(val.questionIds),
  }));

  list.sort((a, b) => b.wrongCount - a.wrongCount);
  return list.slice(0, 5);
}
