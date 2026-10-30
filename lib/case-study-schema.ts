import { z } from "zod";
import { SubjectSlugSchema, CanCuSchema } from "./content-schema";

export const CaseSourceTypeSchema = z.enum([
  "an-le",
  "ban-an-phuc-tham",
  "ban-an-so-tham",
  "quyet-dinh-giam-doc-tham",
]);
export type CaseSourceType = z.infer<typeof CaseSourceTypeSchema>;

export const CasePartySchema = z.object({
  vai_tro: z.string().min(1),
  ten: z.string().min(1),
  mo_ta: z.string().min(1),
});
export type CaseParty = z.infer<typeof CasePartySchema>;

export const CaseSourceSchema = z.object({
  so_hieu: z.string().min(1),
  ngay_ban_hanh: z.string().min(1),
  toa_an: z.string().min(1),
  cap_xet_xu: z.string().min(1),
  loai_nguon: CaseSourceTypeSchema,
  url_cong_bo: z.string().url().refine((url) => url.startsWith("https://"), {
    message: "Link nguon phai bat dau bang https://",
  }),
  ngay_truy_cap: z.string().min(1),
  hieu_luc: z.string().min(1),
  la_an_le: z.boolean(),
  so_an_le: z.string().optional(),
});
export type CaseSource = z.infer<typeof CaseSourceSchema>;

export const CaseQuestionSchema = z.object({
  id: z.string().min(1),
  cau_hoi: z.string().min(1),
  lua_chon: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  dap_an: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  giai_thich: z.string().min(1),
  can_cu: z.array(CanCuSchema).min(1, "Moi cau hoi phai co it nhat 1 can cu"),
});
export type CaseQuestion = z.infer<typeof CaseQuestionSchema>;

export const ComparisonItemSchema = z.object({
  van_de: z.string().min(1),
  y_chinh_toa_an: z.string().min(1),
  cau_hoi_tu_ra: z.string().min(1),
});
export type ComparisonItem = z.infer<typeof ComparisonItemSchema>;

export const CaseStudySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "ID chi duoc chua chu thuong, so va dau gach ngang"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug chi duoc chua chu thuong, so va dau gach ngang"),
  title: z.string().min(1),
  mon: SubjectSlugSchema,
  chuong: z.string().regex(/^c\d{2}$/, "Ma chuong phai co dang c01, c02"),
  ten_chuong: z.string().min(1),
  thoi_gian_phut: z.number().int().min(3).max(15),
  do_kho: z.enum(["co-ban", "vua-suc", "nang-cao"]),
  xuat_ban: z.boolean().default(true).optional(),
  nguon: CaseSourceSchema,
  luat_ap_dung: z.object({
    luat_thoi_diem: z.string().min(1),
    luat_hien_hanh: z.string().min(1),
    ghi_chu_thay_doi: z.string().optional(),
  }),
  ho_so: z.object({
    cac_ben: z.array(CasePartySchema).min(2, "Phai co it nhat 2 ben duong su"),
    dien_bien: z.array(z.string().min(1)).min(2, "Phai co it nhat 2 dien bien"),
    yeu_cau_khoi_kien: z.string().min(1),
    can_cu_tom_tat: z.array(z.string().min(1)).min(1),
  }),
  cau_hoi: z.array(CaseQuestionSchema).min(3, "Moi vu an phai co tu 3-5 cau hoi").max(5),
  goi_y_lap_luan: z.object({
    van_de: z.string().min(1),
    can_cu: z.string().min(1),
    ket_luan: z.string().min(1),
  }),
  doi_chieu: z.object({
    nhan_dinh_toa_an: z.array(z.string().min(1)).min(1),
    quyet_dinh_cuoi_cung: z.string().min(1),
    bang_tu_doi_chieu: z.array(ComparisonItemSchema).min(2),
    luu_y_bien_tap: z.string().min(1),
  }),
});
export type CaseStudy = z.infer<typeof CaseStudySchema>;
