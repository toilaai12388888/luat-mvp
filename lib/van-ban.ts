import bldsData from "@/content/van-ban/bo-luat-dan-su-2015.json";
import xlvphcData from "@/content/van-ban/luat-xu-ly-vi-pham-hanh-chinh-2012.json";
import ldnData from "@/content/van-ban/luat-doanh-nghiep-2020.json";

export interface VanBanSuaDoi {
  van_ban: string;
  link: string;
}

export interface DieuLuatItem {
  ten: string;
  noi_dung: string;
}

export interface VanBanDocument {
  van_ban: string;
  so_hieu: string;
  ngay_hieu_luc: string;
  link: string;
  sua_doi: VanBanSuaDoi[];
  dieu: Record<string, DieuLuatItem>;
}

export const VAN_BAN_MAP: Record<string, VanBanDocument> = {
  "bo-luat-dan-su-2015": bldsData as VanBanDocument,
  "luat-xu-ly-vi-pham-hanh-chinh-2012": xlvphcData as VanBanDocument,
  "luat-doanh-nghiep-2020": ldnData as VanBanDocument,
};

export interface TraCuuDieuResult {
  vanBanSlug: string;
  vanBanTen: string;
  soHieu: string;
  link: string;
  suaDoi: VanBanSuaDoi[];
  dieuSo: string;
  ten: string;
  noiDung: string;
}

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

export function resolveVanBanSlug(vanBanStr: string): string | null {
  const norm = normalizeSearchText(vanBanStr);
  if (norm.includes("dan su") || norm.includes("blds")) {
    return "bo-luat-dan-su-2015";
  }
  if (norm.includes("hanh chinh") || norm.includes("xlvphc") || norm.includes("xu ly vi pham")) {
    return "luat-xu-ly-vi-pham-hanh-chinh-2012";
  }
  if (norm.includes("doanh nghiep") || norm.includes("ldn")) {
    return "luat-doanh-nghiep-2020";
  }
  return null;
}

export function extractDieuNumber(dieuStr: string): string | null {
  const match = dieuStr.match(/Điều\s*(\d+)/i) || dieuStr.match(/\b(\d+)\b/);
  return match ? match[1] : null;
}

export function getDieuLuat(vanBanOrMon: string, dieuInput: string): TraCuuDieuResult | null {
  let slug = resolveVanBanSlug(vanBanOrMon);
  if (!slug) {
    if (vanBanOrMon === "dan-su") slug = "bo-luat-dan-su-2015";
    else if (vanBanOrMon === "hanh-chinh") slug = "luat-xu-ly-vi-pham-hanh-chinh-2012";
    else if (vanBanOrMon === "doanh-nghiep") slug = "luat-doanh-nghiep-2020";
  }
  if (!slug) return null;

  const doc = VAN_BAN_MAP[slug];
  if (!doc) return null;

  const num = extractDieuNumber(dieuInput);
  if (!num || !doc.dieu[num]) return null;

  const item = doc.dieu[num];
  return {
    vanBanSlug: slug,
    vanBanTen: doc.van_ban,
    soHieu: doc.so_hieu,
    link: doc.link,
    suaDoi: doc.sua_doi,
    dieuSo: num,
    ten: item.ten,
    noiDung: item.noi_dung,
  };
}

export function getAllDieuLuat(): TraCuuDieuResult[] {
  const results: TraCuuDieuResult[] = [];
  for (const [slug, doc] of Object.entries(VAN_BAN_MAP)) {
    for (const [num, item] of Object.entries(doc.dieu)) {
      results.push({
        vanBanSlug: slug,
        vanBanTen: doc.van_ban,
        soHieu: doc.so_hieu,
        link: doc.link,
        suaDoi: doc.sua_doi,
        dieuSo: num,
        ten: item.ten,
        noiDung: item.noi_dung,
      });
    }
  }
  return results.sort((a, b) => {
    if (a.vanBanSlug !== b.vanBanSlug) {
      return a.vanBanSlug.localeCompare(b.vanBanSlug);
    }
    return Number(a.dieuSo) - Number(b.dieuSo);
  });
}

export function searchDieuLuat(query: string): TraCuuDieuResult[] {
  const trimmed = query.trim();
  if (!trimmed) return getAllDieuLuat();

  const normQuery = normalizeSearchText(trimmed);
  const all = getAllDieuLuat();

  return all.filter((item) => {
    const normDieu = `dieu ${item.dieuSo}`;
    const normTen = normalizeSearchText(item.ten);
    const normDoc = normalizeSearchText(item.vanBanTen);
    const normContent = normalizeSearchText(item.noiDung);

    return (
      normDieu.includes(normQuery) ||
      normTen.includes(normQuery) ||
      normDoc.includes(normQuery) ||
      normContent.includes(normQuery)
    );
  });
}
