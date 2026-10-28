import fs from "fs";
import path from "path";
import { ChapterSchema } from "../lib/content-schema";
import { CaseStudySchema } from "../lib/case-study-schema";

const contentDir = path.join(process.cwd(), "content");

if (!fs.existsSync(contentDir)) {
  console.log("No content directory found.");
  process.exit(0);
}

// Chi duyet cac thu muc mon hoc, bo qua van-ban va luyen-an
const subjects = fs.readdirSync(contentDir).filter((f) => {
  return (
    fs.statSync(path.join(contentDir, f)).isDirectory() &&
    f !== "van-ban" &&
    f !== "luyen-an"
  );
});

let hasError = false;
const seenIds = new Set<string>();
let totalTinhHuong = 0;

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
      console.error(
        `[ERROR] 'mon' trong file (${chapter.mon}) khong khop thu muc (${mon}): ${filePath}`
      );
      hasError = true;
    }
    if (chapter.chuong !== chuong) {
      console.error(
        `[ERROR] 'chuong' trong file (${chapter.chuong}) khong khop ten file (${chuong}): ${filePath}`
      );
      hasError = true;
    }

    // Kiem tra trung ID trac nghiem
    for (const q of chapter.trac_nghiem) {
      if (seenIds.has(q.id)) {
        console.error(`[ERROR] Trung ID trac nghiem: ${q.id} trong file ${filePath}`);
        hasError = true;
      }
      seenIds.add(q.id);
    }

    // Kiem tra trung ID nhan dinh
    for (const nd of chapter.nhan_dinh) {
      if (seenIds.has(nd.id)) {
        console.error(`[ERROR] Trung ID nhan dinh: ${nd.id} trong file ${filePath}`);
        hasError = true;
      }
      seenIds.add(nd.id);
    }

    // Kiem tra tinh huong neu co
    if (chapter.tinh_huong) {
      for (const th of chapter.tinh_huong) {
        if (seenIds.has(th.id)) {
          console.error(`[ERROR] Trung ID tinh huong: ${th.id} trong file ${filePath}`);
          hasError = true;
        }
        seenIds.add(th.id);
        totalTinhHuong++;

        // Kiem tra buoc
        if (th.buoc.length !== 3) {
          console.error(`[ERROR] Tinh huong ${th.id} phai co dung 3 buoc: ${filePath}`);
          hasError = true;
        }
        for (let i = 0; i < th.buoc.length; i++) {
          const b = th.buoc[i];
          if (b.dap_an < 0 || b.dap_an >= b.lua_chon.length) {
            console.error(
              `[ERROR] Tinh huong ${th.id} buoc ${i + 1} dap_an (${b.dap_an}) ngoai pham vi lua_chon: ${filePath}`
            );
            hasError = true;
          }
        }
      }
    }
  }
}

// KIỂM TRA TÍNH NĂNG LUYỆN ÁN THẬT (content/luyen-an)
const luyenAnDir = path.join(contentDir, "luyen-an");
let totalCaseStudies = 0;
let totalCaseQuestions = 0;
const seenCaseSlugs = new Set<string>();

if (fs.existsSync(luyenAnDir)) {
  const caseFiles = fs.readdirSync(luyenAnDir).filter((f) => f.endsWith(".json"));

  for (const file of caseFiles) {
    const filePath = path.join(luyenAnDir, file);
    let raw = fs.readFileSync(filePath, "utf-8");
    raw = raw.replace(/^\uFEFF/, "");

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error(`[ERROR] JSON khong hop le trong file an that: ${filePath}`, e);
      hasError = true;
      continue;
    }

    const parseResult = CaseStudySchema.safeParse(data);
    if (!parseResult.success) {
      console.error(`[ERROR] Schema an that khong hop le trong file: ${filePath}`);
      for (const issue of parseResult.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      }
      hasError = true;
      continue;
    }

    const caseStudy = parseResult.data;
    totalCaseStudies++;

    if (seenIds.has(caseStudy.id)) {
      console.error(`[ERROR] Trung ID vu an: ${caseStudy.id} trong file ${filePath}`);
      hasError = true;
    }
    seenIds.add(caseStudy.id);

    if (seenCaseSlugs.has(caseStudy.slug)) {
      console.error(`[ERROR] Trung slug vu an: ${caseStudy.slug} trong file ${filePath}`);
      hasError = true;
    }
    seenCaseSlugs.add(caseStudy.slug);

    // Kiem tra cau hoi trong vu an
    for (const q of caseStudy.cau_hoi) {
      if (seenIds.has(q.id)) {
        console.error(`[ERROR] Trung ID cau hoi luyen an: ${q.id} trong file ${filePath}`);
        hasError = true;
      }
      seenIds.add(q.id);
      totalCaseQuestions++;

      if (q.dap_an < 0 || q.dap_an >= q.lua_chon.length) {
        console.error(
          `[ERROR] Cau hoi ${q.id} trong vu an ${caseStudy.id} co dap_an (${q.dap_an}) ngoai pham vi lua_chon`
        );
        hasError = true;
      }
    }
  }
}

if (hasError) {
  console.error("Content check failed!");
  process.exit(1);
} else {
  console.log(
    `Content check passed! Verified ${seenIds.size} total items (${totalTinhHuong} tinh huong, ${totalCaseStudies} vu an that voi ${totalCaseQuestions} cau hoi).`
  );
}
