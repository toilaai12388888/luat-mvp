import "server-only";
import fs from "fs";
import path from "path";
import { CaseStudy, CaseStudySchema } from "./case-study-schema";
import { SubjectSlug } from "./content-schema";

const caseStudyDir = path.join(process.cwd(), "content", "luyen-an");

export function getAllCaseStudies(includeUnpublished = false): CaseStudy[] {
  try {
    if (!fs.existsSync(caseStudyDir)) {
      return [];
    }
    const files = fs
      .readdirSync(caseStudyDir)
      .filter((file) => file.endsWith(".json"))
      .sort();

    const cases: CaseStudy[] = [];
    for (const file of files) {
      const filePath = path.join(caseStudyDir, file);
      let raw = fs.readFileSync(filePath, "utf-8");
      raw = raw.replace(/^\uFEFF/, "");
      const data = JSON.parse(raw);
      const parsed = CaseStudySchema.parse(data);
      if (includeUnpublished || parsed.xuat_ban !== false) {
        cases.push(parsed);
      }
    }
    return cases;
  } catch (err) {
    console.error("Error reading all case studies:", err);
    return [];
  }
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  try {
    const all = getAllCaseStudies();
    return all.find((c) => c.slug === slug || c.id === slug) ?? null;
  } catch (err) {
    console.error(`Error finding case study with slug ${slug}:`, err);
    return null;
  }
}

export function getCaseStudiesBySubject(mon: SubjectSlug | string): CaseStudy[] {
  try {
    const all = getAllCaseStudies();
    return all.filter((c) => c.mon === mon);
  } catch (err) {
    console.error(`Error finding case studies for subject ${mon}:`, err);
    return [];
  }
}

export function getCaseStudiesByChapter(mon: SubjectSlug | string, chuong: string): CaseStudy[] {
  try {
    const all = getAllCaseStudies();
    return all.filter((c) => c.mon === mon && c.chuong === chuong);
  } catch (err) {
    console.error(`Error finding case studies for ${mon}/${chuong}:`, err);
    return [];
  }
}
