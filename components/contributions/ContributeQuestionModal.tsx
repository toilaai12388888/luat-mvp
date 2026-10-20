"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  AlertCircle,
  HelpCircle,
  Send
} from "lucide-react";
import { getLocalPlayer, saveLocalPlayer } from "@/lib/player";
import { submitContribution, ContributionPayload } from "@/lib/contributions";

interface ContributeQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  initialChapter?: string;
}

const SUBJECT_OPTIONS = [
  { slug: "dan-su" as const, name: "Bộ luật Dân sự 2015", defaultDoc: "Bộ luật Dân sự 2015" },
  { slug: "hanh-chinh" as const, name: "Luật Xử lý VPHC 2012", defaultDoc: "Luật Xử lý vi phạm hành chính 2012" },
  { slug: "doanh-nghiep" as const, name: "Luật Doanh nghiệp 2020", defaultDoc: "Luật Doanh nghiệp 2020" },
];

export function ContributeQuestionModal({
  isOpen,
  onClose,
  initialSubject = "dan-su",
  initialChapter = "c01",
}: ContributeQuestionModalProps) {
  const [player, setPlayer] = useState(() => getLocalPlayer());
  const [nicknameInput, setNicknameInput] = useState("");

  // Form states
  const [subject, setSubject] = useState<"dan-su" | "hanh-chinh" | "doanh-nghiep">(initialSubject);
  const [chapter, setChapter] = useState(initialChapter);
  const [type, setType] = useState<"mcq" | "nhan_dinh">("mcq");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctBoolean, setCorrectBoolean] = useState(true);

  const [explanation, setExplanation] = useState("");
  const [citationArticle, setCitationArticle] = useState("");
  const [citationDoc, setCitationDoc] = useState(
    SUBJECT_OPTIONS.find((s) => s.slug === initialSubject)?.defaultDoc || "Bộ luật Dân sự 2015"
  );
  const [citationLink, setCitationLink] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubjectChange = (newSub: "dan-su" | "hanh-chinh" | "doanh-nghiep") => {
    setSubject(newSub);
    const meta = SUBJECT_OPTIONS.find((s) => s.slug === newSub);
    if (meta) setCitationDoc(meta.defaultDoc);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    const newPlayer = {
      id: `local-${Date.now()}`,
      nickname: nicknameInput.trim(),
      school: "Sinh viên Luật",
      createdAt: new Date().toISOString(),
    };
    saveLocalPlayer(newPlayer);
    setPlayer(newPlayer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const authorName = player?.nickname || nicknameInput.trim();
    if (!authorName) {
      setErrorMsg("Vui lòng đặt biệt danh trước khi đóng góp câu hỏi.");
      return;
    }

    if (!question.trim()) {
      setErrorMsg("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    if (type === "mcq") {
      if (options.some((opt) => !opt.trim())) {
        setErrorMsg("Vui lòng điền đủ 4 lựa chọn A, B, C, D cho câu trắc nghiệm.");
        return;
      }
    }

    if (!explanation.trim()) {
      setErrorMsg("Vui lòng nhập phần giải thích chi tiết cho đáp án.");
      return;
    }

    if (!citationArticle.trim()) {
      setErrorMsg("Vui lòng nhập số điều luật căn cứ (ví dụ: 117).");
      return;
    }

    if (!citationLink.trim() || !citationLink.startsWith("http")) {
      setErrorMsg("Vui lòng nhập đường link kiểm chứng chính thức (bắt đầu bằng https://...) từ vbpl.vn hoặc thuvienphapluat.vn.");
      return;
    }

    setIsSubmitting(true);

    const payload: ContributionPayload = {
      subject,
      chapter,
      type,
      question: question.trim(),
      explanation: explanation.trim(),
      citationArticle: citationArticle.trim().replace(/^Điều\s+/i, ""),
      citationDoc: citationDoc.trim(),
      citationLink: citationLink.trim(),
      authorName,
      ...(type === "mcq"
        ? { options: options.map((o) => o.trim()), correctIndex }
        : { correctBoolean }),
    };

    try {
      await submitContribution(payload);
      setIsSuccess(true);
    } catch {
      setErrorMsg("Lỗi khi gửi câu hỏi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center border border-gold/30">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Đóng Góp Câu Hỏi <Sparkles size={16} className="text-gold" />
              </h2>
              <p className="text-xs text-slate-400">Chia sẻ kiến thức cùng cộng đồng sinh viên Luật Lẹ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Đã gửi đóng góp thành công!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Cảm ơn bạn! Câu hỏi đã được chuyển đến ban biên tập để đối chiếu điều luật. Bạn vừa mở khóa huy hiệu <strong className="text-gold">&ldquo;Người đóng góp&rdquo;</strong> 🏅!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        ) : !player ? (
          /* Nickname Prompt Gate */
          <form onSubmit={handleSaveNickname} className="py-8 space-y-4 text-center">
            <p className="text-xs text-slate-300">
              Trước khi đóng góp, bạn cần một biệt danh để được ghi nhận công lao (ví dụ: &ldquo;Đóng góp bởi Tuấn Luật K45&rdquo;):
            </p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Nhập biệt danh của bạn..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold text-center"
              autoFocus
            />
            <button
              type="submit"
              disabled={!nicknameInput.trim()}
              className="w-full py-2.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-navy-950 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Tiếp tục đóng góp câu hỏi
            </button>
          </form>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Subject & Chapter */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Môn học</label>
                <select
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value as "dan-su" | "hanh-chinh" | "doanh-nghiep")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chương</label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="c01">Chương 1</option>
                  <option value="c02">Chương 2</option>
                </select>
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Loại câu hỏi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("mcq")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    type === "mcq"
                      ? "bg-gold/20 border-gold text-gold font-bold"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  Trắc nghiệm (4 lựa chọn)
                </button>
                <button
                  type="button"
                  onClick={() => setType("nhan_dinh")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    type === "nhan_dinh"
                      ? "bg-gold/20 border-gold text-gold font-bold"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  Nhận định (Đúng / Sai)
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === "mcq" ? "Nội dung câu hỏi *" : "Nội dung nhận định *"}
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  type === "mcq"
                    ? "VD: Năng lực hành vi dân sự của cá nhân phát sinh từ thời điểm nào?"
                    : "VD: Người từ đủ 15 tuổi đến chưa đủ 18 tuổi tự mình xác lập mọi giao dịch dân sự."
                }
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold leading-relaxed"
                required
              />
            </div>

            {/* Options for MCQ */}
            {type === "mcq" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Các lựa chọn & tích chọn đáp án đúng:
                </label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="accent-gold w-4 h-4 cursor-pointer"
                      title="Chọn đây là đáp án đúng"
                    />
                    <span className="font-mono text-xs font-bold text-slate-400 w-4">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}...`}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Boolean for Nhận định */}
            {type === "nhan_dinh" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Đáp án chuẩn của nhận định này:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectBoolean(true)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      correctBoolean
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-950/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    ĐÚNG
                  </button>
                  <button
                    type="button"
                    onClick={() => setCorrectBoolean(false)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      !correctBoolean
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : "bg-slate-950/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    SAI
                  </button>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Giải thích chi tiết *
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Giải thích vì sao đáp án này đúng theo quy định pháp luật..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>

            {/* Legal Citation (Mandatory) */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2.5">
              <span className="text-xs font-bold text-gold flex items-center gap-1.5">
                <HelpCircle size={14} /> Căn cứ pháp lý (Bắt buộc kiểm chứng)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Số điều (VD: 117) *</label>
                  <input
                    type="text"
                    value={citationArticle}
                    onChange={(e) => setCitationArticle(e.target.value)}
                    placeholder="VD: 117"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Văn bản</label>
                  <input
                    type="text"
                    value={citationDoc}
                    onChange={(e) => setCitationDoc(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Link kiểm chứng (vbpl.vn hoặc thuvienphapluat.vn) *
                </label>
                <input
                  type="url"
                  value={citationLink}
                  onChange={(e) => setCitationLink(e.target.value)}
                  placeholder="https://thuvienphapluat.vn/van-ban/..."
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gold hover:bg-gold-light disabled:opacity-50 text-navy-950 font-bold text-xs rounded-xl transition shadow-lg shadow-gold/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={14} /> {isSubmitting ? "Đang gửi..." : "Gửi Đóng Góp Câu Hỏi"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
