"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Scale,
  Sparkles,
  ExternalLink,
  FileText,
  AlertTriangle,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReportButton } from "@/components/ui/ReportButton";
import { CaseStudy } from "@/lib/case-study-schema";
import { trackUsage } from "@/lib/usage";
import { saveAttempt } from "@/lib/attempts";
import { syncWeeklyXpToSupabase } from "@/lib/player";

interface CaseStudyRunnerProps {
  caseStudy: CaseStudy;
}

type Step = 1 | 2 | 3 | 4;

interface DraftArgument {
  vanDe: string;
  canCu: string;
  ketLuan: string;
}

export function CaseStudyRunner({ caseStudy }: CaseStudyRunnerProps) {
  // Khởi tạo step an toàn từ localStorage (chống trang trắng)
  const [step, setStepState] = useState<Step>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = localStorage.getItem(`luatle_case_step_${caseStudy.id}`);
      if (saved) {
        const num = Number(saved);
        if ([1, 2, 3, 4].includes(num)) return num as Step;
      }
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
    return 1;
  });

  const setStep = (newStep: Step) => {
    setStepState(newStep);
    try {
      localStorage.setItem(`luatle_case_step_${caseStudy.id}`, String(newStep));
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
  };

  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Khởi tạo câu trả lời trắc nghiệm an toàn từ localStorage (chống mất khi reload/xem lại hồ sơ)
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(`luatle_case_answers_${caseStudy.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
    return {};
  });

  const [showFactModal, setShowFactModal] = useState(false);
  const [skippedArgument, setSkippedArgument] = useState(false);

  // Khởi tạo bản nháp 3 ô tự luận an toàn từ localStorage
  const [draft, setDraft] = useState<DraftArgument>(() => {
    if (typeof window === "undefined") {
      return { vanDe: "", canCu: "", ketLuan: "" };
    }
    try {
      const saved = localStorage.getItem(`luatle_case_draft_${caseStudy.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            vanDe: parsed.vanDe || "",
            canCu: parsed.canCu || "",
            ketLuan: parsed.ketLuan || "",
          };
        }
      }
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
    return { vanDe: "", canCu: "", ketLuan: "" };
  });

  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [isEditingArgumentInStep4, setIsEditingArgumentInStep4] = useState(false);

  // Khởi tạo runId duy nhất cho phiên làm bài hiện tại (tránh double count XP & Analytics)
  const [runId] = useState<string>(() => {
    if (typeof window === "undefined") return `run_${caseStudy.id}_${Date.now()}`;
    try {
      let current = sessionStorage.getItem(`luatle_case_run_${caseStudy.id}`);
      if (!current) {
        current = `run_${caseStudy.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        sessionStorage.setItem(`luatle_case_run_${caseStudy.id}`, current);
      }
      return current;
    } catch {
      return `run_${caseStudy.id}_${Date.now()}`;
    }
  });

  const saveDraftToStorage = (newDraft: DraftArgument) => {
    setDraft(newDraft);
    try {
      localStorage.setItem(`luatle_case_draft_${caseStudy.id}`, JSON.stringify(newDraft));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2000);
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => {
      const next = {
        ...prev,
        [qIdx]: optIdx,
      };
      try {
        localStorage.setItem(`luatle_case_answers_${caseStudy.id}`, JSON.stringify(next));
      } catch {
        // Bỏ qua lỗi lưu trữ
      }
      return next;
    });
  };

  const handleCompleteToStep4 = (skipped: boolean) => {
    setSkippedArgument(skipped);
    setStep(4);

    // Khóa chống trao thưởng và ghi nhận trùng lặp cho cùng một phiên làm bài
    const awardedKey = `luatle_case_awarded_${caseStudy.id}_${runId}`;
    let alreadyAwarded = false;
    try {
      alreadyAwarded = localStorage.getItem(awardedKey) === "true";
    } catch {
      // Bỏ qua lỗi lưu trữ
    }

    if (!alreadyAwarded) {
      try {
        localStorage.setItem(awardedKey, "true");
      } catch {
        // Bỏ qua lỗi lưu trữ
      }

      // 1. Ghi nhận đo lường không trùng lặp (1 lần / sessionKey)
      trackUsage("lesson", caseStudy.cau_hoi.length, runId);

      // 2. Thưởng +15 XP duy nhất cho lượt hoàn thành (tuân thủ giới hạn add_weekly_xp: 1 <= delta <= 15)
      syncWeeklyXpToSupabase(15).catch(() => {});

      // 3. Lưu attempt vụ án hoàn thành với 15 XP
      saveAttempt({
        itemId: `case-${caseStudy.id}`,
        itemType: "mcq",
        subject: caseStudy.mon,
        isCorrect: true,
        xp: 15,
      });

      // 4. Lưu attempts cho từng câu hỏi với xp: 0 (ghi nhận lịch sử và wrong tracker mà không spam rate-limit 2 giây)
      caseStudy.cau_hoi.forEach((q, idx) => {
        const userChoice = answers[idx];
        const isCorrect = userChoice === q.dap_an;
        saveAttempt({
          itemId: q.id,
          itemType: "mcq",
          subject: caseStudy.mon,
          isCorrect,
          xp: 0,
        });
      });

      // 5. Đánh dấu đã hoàn thành vụ án vào danh sách
      try {
        const rawCompleted = localStorage.getItem("luatle_completed_cases");
        const list: string[] = rawCompleted ? JSON.parse(rawCompleted) : [];
        if (!list.includes(caseStudy.slug)) {
          list.push(caseStudy.slug);
          localStorage.setItem("luatle_completed_cases", JSON.stringify(list));
        }
      } catch {
        // Bỏ qua lỗi lưu trữ
      }

      // 6. Tích lũy streak ngày
    }
  };

  const handleResetToPracticeAgain = () => {
    try {
      localStorage.removeItem(`luatle_case_answers_${caseStudy.id}`);
      localStorage.removeItem(`luatle_case_step_${caseStudy.id}`);
      sessionStorage.removeItem(`luatle_case_run_${caseStudy.id}`);
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
    setStep(1);
    setCurrentQIndex(0);
    setAnswers({});
    setSkippedArgument(false);
  };

  const allAnswered = caseStudy.cau_hoi.every((_, idx) => answers[idx] !== undefined);
  const correctCount = caseStudy.cau_hoi.filter((q, idx) => answers[idx] === q.dap_an).length;

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-24 text-ink">
      {/* Top Header & Step Breadcrumbs */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link
            href="/luyen-an"
            className="press flex h-9 w-9 items-center justify-center rounded-xl bg-bg border border-line text-ink-2 hover:text-ink"
            aria-label="Về danh sách vụ án"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { num: 1 as Step, label: "Hồ sơ" },
              { num: 2 as Step, label: "Câu hỏi" },
              { num: 3 as Step, label: "Lập luận" },
              { num: 4 as Step, label: "Đối chiếu" },
            ].map((s) => {
              const active = step === s.num;
              const passed = step > s.num;
              const canNavigate = s.num <= step || (s.num === 2) || (s.num === 3 && allAnswered);

              return (
                <div key={s.num} className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => {
                      if (canNavigate) setStep(s.num);
                    }}
                    className={`flex h-6 px-2 sm:px-2.5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      active
                        ? "bg-navy-bar text-white shadow-sm ring-2 ring-navy-bar/20"
                        : passed
                        ? "bg-good-soft text-good hover:opacity-80 cursor-pointer"
                        : canNavigate
                        ? "bg-bg text-ink-2 border border-line hover:border-navy-bar cursor-pointer"
                        : "bg-bg text-ink-3 border border-line opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {passed ? <Check size={12} className="inline mr-0.5" /> : null}
                    {s.num}. {s.label}
                  </button>
                  {s.num < 4 && <ChevronRight size={12} className="text-ink-3" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-ink-3 hidden sm:inline">Vụ:</span>
            <ReportButton itemId={caseStudy.id} />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-4">
        {/* ==================== BƯỚC 1: HỒ SƠ VỤ VIỆC ==================== */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-navy-soft px-2.5 py-1 text-xs font-bold text-navy-ink">
                {caseStudy.mon === "dan-su"
                  ? "Dân sự"
                  : caseStudy.mon === "doanh-nghiep"
                  ? "Doanh nghiệp"
                  : "Hành chính"}
              </span>
              <span className="rounded-md border border-line px-2 py-0.5 text-xs text-ink-2">
                Chương: {caseStudy.ten_chuong}
              </span>
              <span className="rounded-md bg-gold-soft px-2 py-0.5 text-xs font-medium text-gold-ink">
                ~{caseStudy.thoi_gian_phut} phút
              </span>
              {caseStudy.nguon.la_an_le ? (
                <span className="rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-2 py-0.5 text-xs font-bold">
                  {caseStudy.nguon.so_an_le || "Án lệ chính thức"}
                </span>
              ) : (
                <span className="rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 text-xs font-semibold">
                  Bản án có hiệu lực
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold leading-tight tracking-tight text-ink sm:text-2xl">
              {caseStudy.title}
            </h1>

            {/* Hộp nguồn gốc chính thức */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-ink">
                <Scale size={15} className="text-navy-bar" />
                <span>Nguồn công bố chính thức</span>
              </div>
              <div className="space-y-1 text-ink-2">
                <p>
                  <span className="font-semibold text-ink">Số hiệu:</span> {caseStudy.nguon.so_hieu}
                </p>
                <p>
                  <span className="font-semibold text-ink">Cơ quan xét xử:</span> {caseStudy.nguon.toa_an} (Cấp {caseStudy.nguon.cap_xet_xu})
                </p>
                <p>
                  <span className="font-semibold text-ink">Hiệu lực:</span> {caseStudy.nguon.hieu_luc}
                </p>
                <p className="pt-1">
                  <a
                    href={caseStudy.nguon.url_cong_bo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-navy-bar underline hover:text-navy-bar/80 font-medium"
                  >
                    <span>Xem văn bản công bố chính thức</span>
                    <ExternalLink size={12} />
                  </a>
                </p>
              </div>
            </div>

            {/* Các bên tham gia tranh chấp */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                <FileText size={16} className="text-navy-bar" />
                <span>Các bên đương sự</span>
              </h2>
              <div className="space-y-2 text-xs">
                {caseStudy.ho_so.cac_ben.map((b, idx) => (
                  <div key={idx} className="rounded-xl bg-bg p-3 border border-line space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{b.ten}</span>
                      <span className="rounded bg-navy-soft px-2 py-0.5 text-[11px] font-semibold text-navy-ink">
                        {b.vai_tro}
                      </span>
                    </div>
                    <p className="text-ink-2 leading-relaxed">{b.mo_ta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Diễn biến tình tiết */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                <ClockIcon />
                <span>Tóm tắt tình tiết vụ việc</span>
              </h2>
              <div className="relative border-l-2 border-line-2 ml-2 pl-4 space-y-3">
                {caseStudy.ho_so.dien_bien.map((db, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[23px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-navy-bar ring-4 ring-surface" />
                    <p className="text-xs text-ink-2 leading-relaxed">{db}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Yêu cầu cần giải quyết */}
            <div className="rounded-2xl border border-navy-bar/30 bg-navy-soft/30 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-bar">
                Yêu cầu khởi kiện cần giải quyết
              </h3>
              <p className="text-xs text-ink font-medium leading-relaxed">
                {caseStudy.ho_so.yeu_cau_khoi_kien}
              </p>
            </div>

            {/* Căn cứ pháp luật liên quan */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2 text-xs">
              <h3 className="font-bold text-ink">Luật áp dụng tại thời điểm và hiện hành</h3>
              <p className="text-ink-2">
                <span className="font-semibold text-ink">Thời điểm sự việc / xét xử:</span>{" "}
                {caseStudy.luat_ap_dung.luat_thoi_diem}
              </p>
              <p className="text-ink-2">
                <span className="font-semibold text-ink">Quy định hiện hành tương ứng:</span>{" "}
                {caseStudy.luat_ap_dung.luat_hien_hanh}
              </p>
              {caseStudy.luat_ap_dung.ghi_chu_thay_doi && (
                <p className="text-[11px] text-ink-3 italic pt-1 border-t border-line">
                  * {caseStudy.luat_ap_dung.ghi_chu_thay_doi}
                </p>
              )}
            </div>

            {/* Nút sang bước 2 */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md flex items-center justify-center gap-2"
                onClick={() => setStep(2)}
              >
                <span>Bắt đầu giải quyết ({caseStudy.cau_hoi.length} câu hỏi)</span>
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 2: CÂU HỎI TRỌNG TÂM ==================== */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header thanh tiến độ câu hỏi */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-ink">
                  Câu {currentQIndex + 1} / {caseStudy.cau_hoi.length}
                </span>
                <span className="text-xs text-ink-3">·</span>
                <ReportButton itemId={caseStudy.cau_hoi[currentQIndex]?.id} />
              </div>
              <button
                type="button"
                onClick={() => setShowFactModal(true)}
                className="press inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-navy-bar hover:bg-navy-soft/30 cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Xem lại hồ sơ</span>
              </button>
            </div>

            {/* Thẻ câu hỏi */}
            {(() => {
              const q = caseStudy.cau_hoi[currentQIndex];
              const selectedOpt = answers[currentQIndex];

              return (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-line bg-surface p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-3">
                      Vấn đề {currentQIndex + 1}
                    </span>
                    <h2 className="mt-1 text-sm font-semibold leading-relaxed text-ink sm:text-base">
                      {q.cau_hoi}
                    </h2>
                  </div>

                  {/* Danh sách 4 lựa chọn (Không lộ kết quả đúng/sai trước bước đối chiếu) */}
                  <div className="space-y-2.5">
                    {q.lua_chon.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const letter = ["A", "B", "C", "D"][optIdx];

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQIndex, optIdx)}
                          className={`press flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-navy-bar bg-navy-soft/50 font-semibold text-ink ring-1 ring-navy-bar"
                              : "border-line bg-surface text-ink-2 hover:border-ink-3 hover:bg-bg"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                              isSelected
                                ? "bg-navy-bar text-white"
                                : "border border-line bg-bg text-ink-2"
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-relaxed pt-0.5">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Điều hướng câu trước / câu sau */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
              <Button
                variant="ghost"
                size="md"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Câu trước</span>
              </Button>

              {currentQIndex < caseStudy.cau_hoi.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentQIndex((prev) => prev + 1)}
                  className="flex items-center gap-1 font-bold"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!allAnswered}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1 font-bold shadow-md"
                >
                  <span>Sang bước Lập luận</span>
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>

            {!allAnswered && (
              <p className="text-center text-[11px] text-ink-3">
                * Vui lòng chọn đáp án cho tất cả câu hỏi trước khi chuyển bước. Lời giải chi tiết và kết quả sẽ hiển thị ở bước Đối chiếu để rèn luyện tư duy độc lập.
              </p>
            )}
          </div>
        )}

        {/* ==================== BƯỚC 3: LẬP LUẬN TÙY CHỌN ==================== */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-navy-bar/20 bg-navy-soft/30 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-navy-ink font-bold text-sm">
                <PenTool size={16} className="text-navy-bar" />
                <span>Lập luận pháp lý của bạn (Không bắt buộc)</span>
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">
                Tập giải quyết vụ việc theo 3 phần chuẩn:{" "}
                <span className="font-semibold text-ink">Vấn đề – Căn cứ – Kết luận</span>. Bạn có thể tự viết để đối chiếu với nhận định thực tế của Tòa án, hoặc bấm bỏ qua để xem ngay đối chiếu.
              </p>
              <p className="text-[11px] text-ink-3">
                * Bản nháp được lưu riêng tư trên trình duyệt của bạn, tự động giữ nguyên khi tải lại trang.
              </p>
            </div>

            {/* Ô 1: Vấn đề pháp lý */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
              <label className="text-xs font-bold text-ink flex items-center justify-between">
                <span>1. Vấn đề pháp lý cần giải quyết:</span>
                <span className="text-[11px] text-ink-3 font-normal">Gợi ý tư duy</span>
              </label>
              <p className="text-[11px] text-ink-3 bg-bg rounded-lg p-2 border border-line/60">
                💡 {caseStudy.goi_y_lap_luan.van_de}
              </p>
              <textarea
                value={draft.vanDe}
                onChange={(e) =>
                  saveDraftToStorage({ ...draft, vanDe: e.target.value })
                }
                rows={3}
                placeholder="Theo bạn, điểm mấu chốt của vụ việc này là gì..."
                className="w-full rounded-xl border border-line bg-bg p-3 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Ô 2: Căn cứ & Áp dụng */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
              <label className="text-xs font-bold text-ink flex items-center justify-between">
                <span>2. Căn cứ và lập luận áp dụng:</span>
                <span className="text-[11px] text-ink-3 font-normal">Điều luật & tình tiết</span>
              </label>
              <p className="text-[11px] text-ink-3 bg-bg rounded-lg p-2 border border-line/60">
                💡 {caseStudy.goi_y_lap_luan.can_cu}
              </p>
              <textarea
                value={draft.canCu}
                onChange={(e) =>
                  saveDraftToStorage({ ...draft, canCu: e.target.value })
                }
                rows={4}
                placeholder="Áp dụng điều khoản luật nào vào diễn biến thực tế..."
                className="w-full rounded-xl border border-line bg-bg p-3 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Ô 3: Kết luận */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-2">
              <label className="text-xs font-bold text-ink flex items-center justify-between">
                <span>3. Kết luận / Đề xuất phán quyết của bạn:</span>
                <span className="text-[11px] text-ink-3 font-normal">Hướng giải quyết</span>
              </label>
              <p className="text-[11px] text-ink-3 bg-bg rounded-lg p-2 border border-line/60">
                💡 {caseStudy.goi_y_lap_luan.ket_luan}
              </p>
              <textarea
                value={draft.ketLuan}
                onChange={(e) =>
                  saveDraftToStorage({ ...draft, ketLuan: e.target.value })
                }
                rows={3}
                placeholder="Chấp nhận hay bác bỏ yêu cầu khởi kiện, nghĩa vụ các bên..."
                className="w-full rounded-xl border border-line bg-bg p-3 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {draftSavedToast && (
              <div className="text-center text-[11px] text-good font-semibold animate-in fade-in">
                ✓ Đã lưu nháp tự động trên trình duyệt
              </div>
            )}

            {/* Các nút hành động */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-line">
              <Button
                variant="ghost"
                size="md"
                onClick={() => handleCompleteToStep4(true)}
                className="w-full sm:w-auto flex-1 text-ink-2"
              >
                Bỏ qua và xem đối chiếu
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleCompleteToStep4(false)}
                className="w-full sm:w-auto flex-1 font-bold shadow-md"
              >
                Hoàn thành & Xem đối chiếu
              </Button>
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 4: ĐỐI CHIẾU PHÁN QUYẾT ==================== */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Banner kết quả + XP */}
            <div className="rounded-2xl border border-good/30 bg-good-soft/30 p-4 text-center space-y-1.5 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-good font-bold text-base">
                <Sparkles size={20} />
                <span>Hoàn thành lượt luyện án thật!</span>
              </div>
              <p className="text-xs text-ink-2">
                Bạn đã trả lời đúng{" "}
                <span className="font-bold text-good">
                  {correctCount}/{caseStudy.cau_hoi.length}
                </span>{" "}
                câu hỏi. Thưởng <span className="font-bold text-gold-ink">+15 XP</span> tích lũy!
              </p>
            </div>

            {/* MỤC 1: ĐÁP ÁN & GIẢI THÍCH CHI TIẾT */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <CheckCircle2 size={16} className="text-navy-bar" />
                <span>Chi tiết đáp án & căn cứ pháp lý</span>
              </h3>

              {caseStudy.cau_hoi.map((q, qIdx) => {
                const userChoice = answers[qIdx];
                const isCorrect = userChoice === q.dap_an;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-line bg-surface p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-ink leading-relaxed">
                        Câu {qIdx + 1}: {q.cau_hoi}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-good-soft px-2 py-0.5 text-[11px] font-bold text-good">
                            <Check size={12} /> Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-bad-soft px-2 py-0.5 text-[11px] font-bold text-bad">
                            <XCircle size={12} /> Chưa đúng
                          </span>
                        )}
                        <ReportButton itemId={q.id} />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-ink-2">
                        <span className="font-medium text-ink">Lựa chọn của bạn:</span>{" "}
                        <span className={isCorrect ? "text-good font-semibold" : "text-bad font-semibold"}>
                          {userChoice !== undefined ? q.lua_chon[userChoice] : "Chưa chọn"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-ink-2">
                          <span className="font-medium text-good">Đáp án chuẩn:</span>{" "}
                          <span className="font-semibold text-good">{q.lua_chon[q.dap_an]}</span>
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-bg p-3 text-xs text-ink-2 leading-relaxed border border-line">
                      <p className="font-semibold text-ink mb-1">Giải thích:</p>
                      <p>{q.giai_thich}</p>
                      <CanCuList items={q.can_cu} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MỤC 2: BÀI LẬP LUẬN CỦA NGƯỜI HỌC */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <PenTool size={16} className="text-navy-bar" />
                  <span>Lập luận của bạn</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingArgumentInStep4(!isEditingArgumentInStep4)}
                  className="text-xs text-navy-bar font-semibold hover:underline cursor-pointer"
                >
                  {isEditingArgumentInStep4 ? "Thu gọn" : "Chỉnh sửa bài viết"}
                </button>
              </div>

              {skippedArgument && !draft.vanDe && !draft.canCu && !draft.ketLuan ? (
                <p className="text-xs text-ink-3 italic">
                  Bạn đã chọn bỏ qua bước tự luận. Hãy đối chiếu trực tiếp với nhận định và phán quyết thực tế của Tòa án bên dưới.
                </p>
              ) : isEditingArgumentInStep4 ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-ink">Vấn đề pháp lý:</label>
                    <textarea
                      value={draft.vanDe}
                      onChange={(e) => saveDraftToStorage({ ...draft, vanDe: e.target.value })}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-line bg-bg p-2 text-xs text-ink resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink">Căn cứ & Áp dụng:</label>
                    <textarea
                      value={draft.canCu}
                      onChange={(e) => saveDraftToStorage({ ...draft, canCu: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-line bg-bg p-2 text-xs text-ink resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink">Kết luận:</label>
                    <textarea
                      value={draft.ketLuan}
                      onChange={(e) => saveDraftToStorage({ ...draft, ketLuan: e.target.value })}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-line bg-bg p-2 text-xs text-ink resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p>
                    <span className="font-semibold text-ink">1. Vấn đề:</span>{" "}
                    <span className="text-ink-2">{draft.vanDe || "(Chưa ghi)"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-ink">2. Căn cứ & Áp dụng:</span>{" "}
                    <span className="text-ink-2">{draft.canCu || "(Chưa ghi)"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-ink">3. Kết luận:</span>{" "}
                    <span className="text-ink-2">{draft.ketLuan || "(Chưa ghi)"}</span>
                  </p>
                </div>
              )}
            </div>

            {/* MỤC 3: NHẬN ĐỊNH CỦA TÒA ÁN */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Scale size={16} className="text-navy-bar" />
                <span>Nhận định thực tế của Tòa án</span>
              </h3>
              <div className="space-y-2">
                {caseStudy.doi_chieu.nhan_dinh_toa_an.map((nd, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border-l-2 border-navy-bar bg-bg p-3 text-xs text-ink-2 leading-relaxed"
                  >
                    {nd}
                  </div>
                ))}
              </div>
            </div>

            {/* MỤC 4: QUYẾT ĐỊNH CỦA TÒA ÁN */}
            <div className="rounded-2xl border border-navy-bar/30 bg-navy-soft/30 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-bar">
                Phán quyết cuối cùng của Tòa án
              </h3>
              <p className="text-xs font-semibold text-ink leading-relaxed">
                {caseStudy.doi_chieu.quyet_dinh_cuoi_cung}
              </p>
            </div>

            {/* MỤC 5: BẢNG TỰ ĐỐI CHIẾU */}
            <div className="rounded-2xl border border-line bg-surface p-4 space-y-3">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <HelpCircle size={16} className="text-navy-bar" />
                <span>Bảng tự đối chiếu rà soát lập luận</span>
              </h3>
              <div className="space-y-3">
                {caseStudy.doi_chieu.bang_tu_doi_chieu.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-line bg-bg p-3 text-xs space-y-1.5"
                  >
                    <div className="font-bold text-ink text-[13px]">{item.van_de}</div>
                    <div className="text-ink-2">
                      <span className="font-semibold text-navy-bar">Ý chính bản án:</span>{" "}
                      {item.y_chinh_toa_an}
                    </div>
                    <div className="rounded-lg bg-surface p-2 text-ink-3 italic border border-line/60">
                      ❓ <span className="font-medium text-ink-2">Câu hỏi tự rà soát:</span> {item.cau_hoi_tu_ra}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MỤC 6: GHI CHÚ SƯ PHẠM */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle size={15} />
                <span>Ghi chú phương pháp từ Luật Lẹ</span>
              </div>
              <p className="text-ink-2 leading-relaxed">
                Kết luận khác Tòa không tự động có nghĩa là lập luận của bạn vô giá trị. Trong thực tiễn tranh tụng và khoa học pháp lý, cùng một tình tiết có thể có nhiều quan điểm tiếp cận. Điều cốt lõi là bạn đã xác định đúng dữ kiện then chốt, viện dẫn đúng điều luật và lập luận có tính thuyết phục logic.
              </p>
            </div>

            {/* Nút hành động cuối */}
            <div className="space-y-2 pt-2 border-t border-line">
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={caseStudy.nguon.url_cong_bo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-xs font-semibold text-ink hover:bg-bg"
                >
                  <ExternalLink size={14} />
                  <span>Đọc toàn văn bản án gốc</span>
                </a>
                <Link
                  href={`/mon/${caseStudy.mon}`}
                  className="press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-xs font-semibold text-navy-bar hover:bg-navy-soft/30"
                >
                  <BookOpen size={14} />
                  <span>Ôn lại môn {caseStudy.mon}</span>
                </Link>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetToPracticeAgain}
                  className="press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-xs font-medium text-ink-2 hover:text-ink cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Luyện lại vụ này</span>
                </button>
                <Link
                  href="/luyen-an"
                  className="press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy-bar py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95"
                >
                  <span>Chọn vụ án khác</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL XEM LẠI HỒ SƠ TÌNH TIẾT TỪ BƯỚC 2 */}
      {showFactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-4">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <FileText size={16} className="text-navy-bar" />
                <span>Hồ sơ vụ việc (Xem lại tình tiết)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowFactModal(false)}
                className="press rounded-lg p-1 text-ink-3 hover:text-ink cursor-pointer"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-ink mb-1">Các bên:</h4>
                <div className="space-y-1.5">
                  {caseStudy.ho_so.cac_ben.map((b, i) => (
                    <div key={i} className="rounded-lg bg-bg p-2 border border-line">
                      <span className="font-semibold text-ink">{b.ten} ({b.vai_tro}):</span>{" "}
                      <span className="text-ink-2">{b.mo_ta}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink mb-1">Diễn biến chính:</h4>
                <div className="space-y-1.5">
                  {caseStudy.ho_so.dien_bien.map((d, i) => (
                    <div key={i} className="rounded-lg bg-bg p-2 text-ink-2 border border-line">
                      • {d}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-navy-soft/40 p-3 border border-navy-bar/20">
                <h4 className="font-bold text-navy-ink mb-1">Yêu cầu khởi kiện:</h4>
                <p className="text-ink font-medium">{caseStudy.ho_so.yeu_cau_khoi_kien}</p>
              </div>
            </div>

            <div className="border-t border-line p-3 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFactModal(false)}
                className="font-bold"
              >
                Quay lại làm bài
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      className="h-4 w-4 text-navy-bar"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polyline points="12 6 12 12 16 14" strokeWidth="2" />
    </svg>
  );
}

function CanCuList({
  items,
}: {
  items: Array<{ van_ban: string; dieu: string; link?: string }>;
}) {
  return (
    <div className="mt-2 space-y-1 border-t border-line/60 pt-2">
      <span className="font-medium text-ink">Căn cứ:</span>
      <ul className="list-inside list-disc space-y-0.5 text-[11px] text-ink-3">
        {items.map((c, i) => (
          <li key={i}>
            {c.link ? (
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-bar underline hover:text-navy-bar/80 inline-flex items-center gap-1"
              >
                <span>
                  {c.van_ban} – {c.dieu}
                </span>
                <ExternalLink size={10} />
              </a>
            ) : (
              <span>
                {c.van_ban} – {c.dieu}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
