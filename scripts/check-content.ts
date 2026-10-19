import fs from "fs";
import path from "path";
import { ChapterSchema } from "../lib/content-schema";

const contentDir = path.join(process.cwd(), "content");

if (!fs.existsSync(contentDir)) {
  console.log("No content directory found.");
  process.exit(0);
}

const subjects = fs.readdirSync(contentDir).filter((f) => {
  return fs.statSync(path.join(contentDir, f)).isDirectory();
});

let hasError = false;
const seenIds = new Set<string>();

for (const mon of subjects) {
  const monDir = path.join(contentDir, mon);
  const files = fs.readdirSync(monDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const chuong = file.replace(".json", "");
    const filePath = path.join(monDir, file);
    let raw = fs.readFileSync(filePath, "utf-8");
    raw = raw.replace(/^\uFEFF/, "");

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error(`[ERROR] JSON khong hop le trong file: ${filePath}`, e);
      hasError = true;
      continue;
    }

    const parseResult = ChapterSchema.safeParse(data);
    if (!parseResult.success) {
      console.error(`[ERROR] Schema khong hop le trong file: ${filePath}`);
      for (const issue of parseResult.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
      hasError = true;
      continue;
    }

    const chapter = parseResult.data;

    // Kiem tra mon/chuong khop ten file va thu muc
    if (chapter.mon !== mon) {
      console.error(`[ERROR] 'mon' trong file (${chapter.mon}) khong khop thu muc (${mon}): ${filePath}`);
      hasError = true;
    }
    if (chapter.chuong !== chuong) {
      console.error(`[ERROR] 'chuong' trong file (${chapter.chuong}) khong khop ten file (${chuong}): ${filePath}`);
      hasError = true;
    }

    // Kiem tra trung ID
    for (const q of chapter.trac_nghiem) {
      if (seenIds.has(q.id)) {
        console.error(`[ERROR] Trung ID trac nghiem: ${q.id} trong file ${filePath}`);
        hasError = true;
      }
      seenIds.add(q.id);
    }

    for (const nd of chapter.nhan_dinh) {
      if (seenIds.has(nd.id)) {
        console.error(`[ERROR] Trung ID nhan dinh: ${nd.id} trong file ${filePath}`);
        hasError = true;
      }
      seenIds.add(nd.id);
    }
  }
}

if (hasError) {
  console.error("Content check failed!");
  process.exit(1);
} else {
  console.log(`Content check passed! Verified ${seenIds.size} questions.`);
}