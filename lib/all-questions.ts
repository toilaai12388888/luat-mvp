import danSuC01 from "@/content/dan-su/c01.json";
import danSuC02 from "@/content/dan-su/c02.json";
import hanhChinhC01 from "@/content/hanh-chinh/c01.json";
import hanhChinhC02 from "@/content/hanh-chinh/c02.json";
import doanhNghiepC01 from "@/content/doanh-nghiep/c01.json";
import doanhNghiepC02 from "@/content/doanh-nghiep/c02.json";
import { Chapter, CanCu } from "./content-schema";
import { AnswerValue } from "@/components/quiz/useQuizSession";

export interface QuizQuestion {
  id: string;
  type: "mcq" | "nhan_dinh";
  subject: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  chapter: string;
  chapterTitle: string;
  cau_hoi?: string;
  nhan_dinh?: string;
  lua_chon?: string[];
  dap_an: AnswerValue;
  giai_thich: string;
  can_cu: CanCu[];
  [key: string]: unknown;
}

export const ALL_CHAPTERS: Chapter[] = [
  danSuC01 as Chapter,
  danSuC02 as Chapter,
  hanhChinhC01 as Chapter,
  hanhChinhC02 as Chapter,
  doanhNghiepC01 as Chapter,
  doanhNghiepC02 as Chapter,
];

let cachedAllItems: QuizQuestion[] | null = null;

export function getAllQuizItems(): QuizQuestion[] {
  if (cachedAllItems) return cachedAllItems;

  const items: QuizQuestion[] = [];
  for (const ch of ALL_CHAPTERS) {
    // Trắc nghiệm
    for (const tn of ch.trac_nghiem) {
      items.push({
        id: tn.id,
        type: "mcq",
        subject: ch.mon,
        chapter: ch.chuong,
        chapterTitle: ch.ten_chuong,
        cau_hoi: tn.cau_hoi,
        lua_chon: tn.lua_chon,
        dap_an: tn.dap_an,
        giai_thich: tn.giai_thich,
        can_cu: tn.can_cu,
      });
    }
    // Nhận định
    for (const nd of ch.nhan_dinh) {
      items.push({
        id: nd.id,
        type: "nhan_dinh",
        subject: ch.mon,
        chapter: ch.chuong,
        chapterTitle: ch.ten_chuong,
        nhan_dinh: nd.nhan_dinh,
        dap_an: nd.dap_an,
        giai_thich: nd.giai_thich,
        can_cu: nd.can_cu,
      });
    }
  }

  cachedAllItems = items;
  return items;
}

export function getQuizItemById(id: string): QuizQuestion | null {
  const all = getAllQuizItems();
  return all.find((item) => item.id === id) ?? null;
}

export function removeVietnameseDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

export interface SearchResult {
  item: QuizQuestion;
  matchField: "question" | "explanation" | "article";
}

export function searchQuestions(keyword: string): SearchResult[] {
  const query = removeVietnameseDiacritics(keyword.trim());
  if (!query) return [];

  const all = getAllQuizItems();
  const results: SearchResult[] = [];

  for (const item of all) {
    const textQuestion = removeVietnameseDiacritics(item.cau_hoi || item.nhan_dinh || "");
    const textExpl = removeVietnameseDiacritics(item.giai_thich);
    const textArticles = removeVietnameseDiacritics(
      item.can_cu.map((r) => `${r.dieu} ${r.van_ban}`).join(" ")
    );

    if (textArticles.includes(query)) {
      results.push({ item, matchField: "article" });
    } else if (textQuestion.includes(query)) {
      results.push({ item, matchField: "question" });
    } else if (textExpl.includes(query)) {
      results.push({ item, matchField: "explanation" });
    }
  }

  return results;
}
