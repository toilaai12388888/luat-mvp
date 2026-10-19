import "server-only";
import fs from "fs";
import path from "path";
import { Chapter, ChapterSchema, SubjectSlug } from "./content-schema";

export interface SubjectMeta {
  slug: SubjectSlug;
  name: string;
  lawName: string;
  coverPhoto: string;
  objectPosition: string;
}

export const SUBJECTS: SubjectMeta[] = [
  {
    slug: "dan-su",
    name: "Luật Dân sự",
    lawName: "Bộ luật Dân sự 2015",
    coverPhoto: "/photos/dan-su.jpg",
    objectPosition: "50% 30%",
  },
  {
    slug: "hanh-chinh",
    name: "Luật Hành chính",
    lawName: "Luật XLVPHC 2012 & Luật TTHC 2015",
    coverPhoto: "/photos/hanh-chinh.jpg",
    objectPosition: "50% 40%",
  },
  {
    slug: "doanh-nghiep",
    name: "Luật Doanh nghiệp",
    lawName: "Luật Doanh nghiệp 2020",
    coverPhoto: "/photos/doanh-nghiep.jpg",
    objectPosition: "60% 50%",
  },
];

export function getSubject(slug: string): SubjectMeta | null {
  return SUBJECTS.find((s) => s.slug === slug) ?? null;
}

export function getChapter(mon: string, chuong: string): Chapter | null {
  try {
    const filePath = path.join(process.cwd(), "content", mon, `${chuong}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return ChapterSchema.parse(data);
  } catch (err) {
    console.error(`Error reading chapter ${mon}/${chuong}:`, err);
    return null;
  }
}

export function getChapters(mon: string): Chapter[] {
  try {
    const dirPath = path.join(process.cwd(), "content", mon);
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    const files = fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith(".json"))
      .sort();

    const chapters: Chapter[] = [];
    for (const file of files) {
      const chuong = file.replace(".json", "");
      const chapter = getChapter(mon, chuong);
      if (chapter) {
        chapters.push(chapter);
      }
    }
    return chapters;
  } catch (err) {
    console.error(`Error reading chapters for ${mon}:`, err);
    return [];
  }
}