import { z } from "zod";

export const SubjectSlugSchema = z.enum(["dan-su", "hanh-chinh", "doanh-nghiep"]);
export type SubjectSlug = z.infer<typeof SubjectSlugSchema>;

export const CanCuSchema = z.object({
  van_ban: z.string().min(1),
  dieu: z.string().min(1),
  link: z.string().url().refine((url) => url.startsWith("https://"), {
    message: "Link can cu phai bat dau bang https://",
  }),
});
export type CanCu = z.infer<typeof CanCuSchema>;

export const McqSchema = z.object({
  id: z.string().regex(/^[a-z-]+-c\d{2}-tn\d{2}$/, "ID phai co dang <mon>-<chuong>-tn01"),
  cau_hoi: z.string().min(1),
  lua_chon: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  dap_an: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  giai_thich: z.string().min(1),
  can_cu: z.array(CanCuSchema).min(1, "Phai co it nhat 1 can cu"),
});
export type Mcq = z.infer<typeof McqSchema>;

export const NhanDinhSchema = z.object({
  id: z.string().regex(/^[a-z-]+-c\d{2}-nd\d{2}$/, "ID phai co dang <mon>-<chuong>-nd01"),
  nhan_dinh: z.string().min(1),
  dap_an: z.enum(["dung", "sai"]),
  giai_thich: z.string().min(1),
  can_cu: z.array(CanCuSchema).min(1, "Phai co it nhat 1 can cu"),
});
export type NhanDinh = z.infer<typeof NhanDinhSchema>;

export const DieuHayRaDeSchema = CanCuSchema.extend({
  ten: z.string().min(1),
  ghi_chu: z.string().min(1),
});
export type DieuHayRaDe = z.infer<typeof DieuHayRaDeSchema>;

export const DeCuongSchema = z.object({
  tom_tat: z.string().min(1),
  dieu_hay_ra_de: z.array(DieuHayRaDeSchema),
});
export type DeCuong = z.infer<typeof DeCuongSchema>;

export const ChapterSchema = z.object({
  mon: SubjectSlugSchema,
  chuong: z.string().regex(/^c\d{2}$/, "Chuong phai co dang c01, c02..."),
  ten_chuong: z.string().min(1),
  de_cuong: DeCuongSchema,
  trac_nghiem: z.array(McqSchema),
  nhan_dinh: z.array(NhanDinhSchema),
});
export type Chapter = z.infer<typeof ChapterSchema>;