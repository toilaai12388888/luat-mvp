"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UsageAnalyticsView } from "@/components/admin/UsageAnalyticsView";
import { 
  BarChart3,
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  FileQuestion,
  Flag,
  Users
} from "lucide-react";

interface AdminStats {
  totalPlayers: number;
  pendingContributions: number;
  reportedComments: number;
  unresolvedReports: number;
}

interface ContributionItem {
  id: number;
  player_id: string;
  payload: {
    subject?: string;
    chapter?: string;
    type?: "mcq" | "true-false";
    question: string;
    options?: string[];
    correctIndex?: number;
    correctBoolean?: boolean;
    explanation: string;
    citationArticle?: string;
    citationDoc?: string;
    citationLink?: string;
    authorName?: string;
  };
  status: "pending" | "approved" | "rejected";
  note?: string;
  created_at: string;
}

interface ReportedComment {
  id: number;
  item_id: string;
  player_id: string;
  author_name: string;
  content: string;
  reports: number;
  hidden: boolean;
  created_at: string;
}

interface ItemReport {
  id: number;
  item_id: string;
  reason: string;
  note: string | null;
  resolved: boolean;
  player_id: string | null;
  created_at: string;
}

export default function QuanTriPage() {
  const [pin, setPin] = useState(() => (typeof window !== "undefined" ? sessionStorage.getItem("luat_admin_pin") || "" : ""));
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(typeof window !== "undefined" && sessionStorage.getItem("luat_admin_pin")));

  // Data states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [serverNotice, setServerNotice] = useState("");
  const [stats, setStats] = useState<AdminStats>({
    totalPlayers: 0,
    pendingContributions: 0,
    reportedComments: 0,
    unresolvedReports: 0,
  });
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [comments, setComments] = useState<ReportedComment[]>([]);
  const [reports, setReports] = useState<ItemReport[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"usage" | "contribs" | "comments" | "reports">("usage");
  const [contribFilter, setContribFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [reportFilter, setReportFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");

  // Edit Contribution Modal State
  const [editingContrib, setEditingContrib] = useState<ContributionItem | null>(null);
  const [editPayloadJson, setEditPayloadJson] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reject Note Prompt Modal
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const fetchData = useCallback(async (activePin: string) => {
    setLoading(true);
    setErrorMsg("");
    setServerNotice("");
    try {
      const res = await fetch("/api/admin", {
        headers: { "x-admin-pin": activePin },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("luat_admin_pin");
          setErrorMsg("Mã PIN không đúng.");
          return;
        }
        if (data.needsConfig) {
          setServerNotice(data.error);
        } else {
          setErrorMsg(data.error || "Lỗi tải dữ liệu");
        }
        return;
      }

      setStats(data.stats || { totalPlayers: 0, pendingContributions: 0, reportedComments: 0, unresolvedReports: 0 });
      setContributions(data.contributions || []);
      setComments(data.comments || []);
      setReports(data.reports || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Không thể kết nối API quản trị");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount if already authenticated
  useEffect(() => {
    if (!pin) return;
    let active = true;
    fetch("/api/admin", { headers: { "x-admin-pin": pin } })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.stats) setStats(data.stats);
        if (data.contributions) setContributions(data.contributions);
        if (data.comments) setComments(data.comments);
        if (data.reports) setReports(data.reports);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsVerifying(true);
    setPinError("");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pinInput },
        body: JSON.stringify({ action: "verify_pin" }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPinError(data.error || "Mã PIN không đúng");
        setIsVerifying(false);
        return;
      }

      // Valid
      setPin(pinInput);
      setIsAuthenticated(true);
      sessionStorage.setItem("luat_admin_pin", pinInput);
      fetchData(pinInput);
    } catch {
      setPinError("Lỗi kết nối kiểm tra PIN");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin("");
    setPinInput("");
    sessionStorage.removeItem("luat_admin_pin");
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ action: "approve_contribution", id }),
      });
      if (res.ok) {
        await fetchData(pin);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ action: "reject_contribution", id, note: rejectNote }),
      });
      if (res.ok) {
        setRejectingId(null);
        setRejectNote("");
        await fetchData(pin);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingContrib) return;
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(editPayloadJson);
    } catch {
      alert("JSON không hợp lệ! Vui lòng kiểm tra cú pháp.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ action: "update_contribution", id: editingContrib.id, payload: parsedPayload }),
      });
      if (res.ok) {
        setEditingContrib(null);
        await fetchData(pin);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentAction = async (action: "unhide_comment" | "hide_comment" | "delete_comment", id: number) => {
    if (action === "delete_comment" && !confirm("Bạn chắc chắn muốn xóa vĩnh viễn bình luận này?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ action, id }),
      });
      if (res.ok) {
        await fetchData(pin);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveReport = async (id: number, resolved: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify({ action: "resolve_report", id, resolved }),
      });
      if (res.ok) {
        await fetchData(pin);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // PIN Login Gate
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <ShieldAlert size={26} />
          </div>
          <h1 className="text-xl font-bold text-center text-slate-100 mb-1">Khu vực Quản trị</h1>
          <p className="text-xs text-slate-400 text-center mb-6">
            Duyệt câu đóng góp, bình luận và báo sai hệ thống Luật Lẹ
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mã PIN Quản trị
              </label>
              <input
                type="password"
                maxLength={64}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Nhập mã quản trị"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            {(pinError || errorMsg) && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center">
                {pinError || errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !pinInput}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="animate-spin" size={18} /> Đang kiểm tra...
                </>
              ) : (
                "Mở Bảng Điều Khiển"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 transition">
              ← Quay lại trang chủ học tập
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Filtered views
  const filteredContributions = contributions.filter((c) => {
    if (contribFilter === "all") return true;
    return c.status === contribFilter;
  });

  const filteredReports = reports.filter((r) => {
    if (reportFilter === "all") return true;
    if (reportFilter === "unresolved") return !r.resolved;
    return r.resolved;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
              §
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-slate-100">Quản Trị Luật Lẹ</h1>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Admin PIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Kiểm duyệt nội dung & phản hồi sinh viên</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(pin)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition border border-rose-500/30 cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {/* Notice if Supabase Admin not configured */}
        {serverNotice && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-amber-200">
              <strong className="block text-sm font-semibold text-amber-300 mb-1">
                Lưu ý cấu hình Vercel / Server:
              </strong>
              {serverNotice}
              <p className="mt-1 text-slate-300">
                Hãy thêm biến môi trường <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> trên Vercel để kết nối đầy đủ quyền admin.
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Người chơi</span>
              <Users size={16} />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.totalPlayers}</div>
            <p className="text-[11px] text-slate-500 mt-1">Đã lưu trữ trong hệ thống</p>
          </div>

          <div className={`p-4 bg-slate-900/60 border rounded-2xl ${stats.unresolvedReports > 0 ? "border-rose-500/40 bg-rose-500/5" : "border-slate-800"}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Báo sai chưa xử lý</span>
              <Flag size={16} className={stats.unresolvedReports > 0 ? "text-rose-400" : ""} />
            </div>
            <div className={`text-2xl font-bold ${stats.unresolvedReports > 0 ? "text-rose-400" : "text-slate-100"}`}>
              {stats.unresolvedReports}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Từ nút báo lỗi trong app</p>
          </div>

          <div className={`p-4 bg-slate-900/60 border rounded-2xl ${stats.pendingContributions > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-slate-800"}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Câu chờ duyệt</span>
              <FileQuestion size={16} className={stats.pendingContributions > 0 ? "text-amber-400" : ""} />
            </div>
            <div className={`text-2xl font-bold ${stats.pendingContributions > 0 ? "text-amber-400" : "text-slate-100"}`}>
              {stats.pendingContributions}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sinh viên gửi đóng góp</p>
          </div>

          <div className={`p-4 bg-slate-900/60 border rounded-2xl ${stats.reportedComments > 0 ? "border-orange-500/40 bg-orange-500/5" : "border-slate-800"}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Bình luận bị báo</span>
              <MessageSquare size={16} className={stats.reportedComments > 0 ? "text-orange-400" : ""} />
            </div>
            <div className={`text-2xl font-bold ${stats.reportedComments > 0 ? "text-orange-400" : "text-slate-100"}`}>
              {stats.reportedComments}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">≥ 1 lượt tố cáo hoặc ẩn</p>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("usage")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "usage"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 size={16} />
            Thống kê sử dụng
          </button>
          <button
            onClick={() => setActiveTab("contribs")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === "contribs"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileQuestion size={16} />
            Câu Đóng Góp
            {stats.pendingContributions > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono">
                {stats.pendingContributions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("comments")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === "comments"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare size={16} />
            Bình Luận Bị Báo Cáo
            {stats.reportedComments > 0 && (
              <span className="px-1.5 py-0.2 bg-orange-500/20 text-orange-300 rounded-full text-xs font-mono">
                {stats.reportedComments}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === "reports"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flag size={16} />
            Báo Sai
            {stats.unresolvedReports > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded-full text-xs font-mono">
                {stats.unresolvedReports}
              </span>
            )}
          </button>
        </div>

        {/* TAB 0: THỐNG KÊ NGƯỜI DÙNG */}
        {activeTab === "usage" && <UsageAnalyticsView pin={pin} />}

        {/* TAB 1: CÂU ĐÓNG GÓP */}
        {activeTab === "contribs" && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setContribFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      contribFilter === st
                        ? "bg-slate-700 text-white font-semibold"
                        : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {st === "all" && "Tất cả"}
                    {st === "pending" && "Chờ duyệt"}
                    {st === "approved" && "Đã duyệt"}
                    {st === "rejected" && "Đã từ chối"}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                Hiển thị {filteredContributions.length} câu
              </span>
            </div>

            {filteredContributions.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                Không có câu đóng góp nào trong mục này.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContributions.map((c) => {
                  const p = c.payload;
                  return (
                    <div
                      key={c.id}
                      className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-sm hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              c.status === "approved"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : c.status === "rejected"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {c.status === "approved" ? "Đã duyệt" : c.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Môn: <strong className="text-slate-200">{p.subject || "Chưa rõ"}</strong> ({p.chapter || ""})
                          </span>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs text-slate-400">
                            Tác giả: <strong className="text-amber-300">{p.authorName || "Ẩn danh"}</strong>
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(c.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      {/* Question Content */}
                      <p className="text-sm font-semibold text-slate-100 mb-3 leading-relaxed">
                        {p.question}
                      </p>

                      {/* Options if MCQ */}
                      {p.options && p.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {p.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl text-xs border ${
                                idx === p.correctIndex
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium"
                                  : "bg-slate-950/40 border-slate-800 text-slate-400"
                              }`}
                            >
                              <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span>
                              {opt}
                              {idx === p.correctIndex && " (Đáp án đúng)"}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explanation & Citation */}
                      <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl mb-3 text-xs space-y-1">
                        <div className="text-slate-300 leading-relaxed">
                          <strong className="text-slate-400">Giải thích: </strong> {p.explanation}
                        </div>
                        <div className="text-amber-300/90 pt-1 flex items-center gap-2 flex-wrap">
                          <strong className="text-slate-400">Căn cứ: </strong>
                          <span>{p.citationDoc || "Văn bản"} - Điều {p.citationArticle || "..."}</span>
                          {p.citationLink && (
                            <a
                              href={p.citationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-400 underline inline-flex items-center gap-1 hover:text-amber-300"
                            >
                              Link kiểm chứng <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        {c.note && (
                          <div className="text-rose-300 pt-1 border-t border-slate-800 mt-1">
                            <strong>Ghi chú admin:</strong> {c.note}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setEditingContrib(c);
                            setEditPayloadJson(JSON.stringify(c.payload, null, 2));
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit3 size={14} /> Sửa nhanh
                        </button>

                        {c.status !== "approved" && (
                          <button
                            onClick={() => handleApprove(c.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-500/20"
                          >
                            <CheckCircle2 size={14} /> Duyệt câu này
                          </button>
                        )}

                        {c.status !== "rejected" && (
                          <button
                            onClick={() => {
                              setRejectingId(c.id);
                              setRejectNote(c.note || "");
                            }}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <XCircle size={14} /> Từ chối...
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BÌNH LUẬN BỊ BÁO CÁO */}
        {activeTab === "comments" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">
                Các bình luận nhận từ 1 báo cáo trở lên hoặc đang bị tự động ẩn
              </span>
              <span className="text-xs text-slate-400">{comments.length} bình luận</span>
            </div>

            {comments.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                Không có bình luận nào bị báo cáo. Hệ thống trong sạch!
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((cm) => (
                  <div
                    key={cm.id}
                    className={`p-4 bg-slate-900/80 border rounded-2xl ${
                      cm.hidden ? "border-rose-500/40 bg-rose-500/5" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-amber-300">{cm.author_name}</span>
                        <span className="text-[11px] font-mono text-slate-500">ID câu: {cm.item_id}</span>
                        {cm.hidden && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            Đang ẩn
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                          {cm.reports} báo cáo
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(cm.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 mb-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {cm.content}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      {cm.hidden ? (
                        <button
                          onClick={() => handleCommentAction("unhide_comment", cm.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye size={14} /> Hiện lại & Xóa báo cáo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCommentAction("hide_comment", cm.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <EyeOff size={14} /> Ẩn bình luận
                        </button>
                      )}

                      <button
                        onClick={() => handleCommentAction("delete_comment", cm.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Trash2 size={14} /> Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BÁO SAI */}
        {activeTab === "reports" && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {(["unresolved", "resolved", "all"] as const).map((rf) => (
                  <button
                    key={rf}
                    onClick={() => setReportFilter(rf)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      reportFilter === rf
                        ? "bg-slate-700 text-white font-semibold"
                        : "bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {rf === "unresolved" && "Chưa xử lý"}
                    {rf === "resolved" && "Đã xử lý"}
                    {rf === "all" && "Tất cả"}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">
                Hiển thị {filteredReports.length} báo cáo
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                Không có báo cáo sai sót nào trong mục này.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((rp) => (
                  <div
                    key={rp.id}
                    className={`p-4 bg-slate-900/80 border rounded-2xl ${
                      !rp.resolved ? "border-rose-500/40 bg-rose-500/5" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            !rp.resolved
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {!rp.resolved ? "Chưa xử lý" : "Đã xử lý"}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          Mã câu: <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">{rp.item_id}</code>
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(rp.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div className="mb-3 text-xs space-y-1">
                      <div>
                        <strong className="text-slate-400">Lý do: </strong>
                        <span className="text-rose-300 font-medium">{rp.reason}</span>
                      </div>
                      {rp.note && (
                        <div className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-1">
                          <strong className="text-slate-400">Chi tiết từ sinh viên: </strong>
                          {rp.note}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleResolveReport(rp.id, !rp.resolved)}
                        disabled={actionLoading}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          !rp.resolved
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        {!rp.resolved ? "Đánh dấu đã xử lý" : "Mở lại báo cáo"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: SỬA NHANH CÂU HỎI */}
      {editingContrib && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Edit3 className="text-amber-400" size={18} />
                Sửa Nhanh Câu Đóng Góp #{editingContrib.id}
              </h2>
              <button
                onClick={() => setEditingContrib(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Chỉnh sửa trực tiếp cấu trúc JSON trước khi duyệt câu hỏi này vào thư viện:
            </p>

            <div className="flex-1 overflow-auto mb-4">
              <textarea
                value={editPayloadJson}
                onChange={(e) => setEditPayloadJson(e.target.value)}
                rows={14}
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingContrib(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TỪ CHỐI KÈM GHI CHÚ */}
      {rejectingId !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h2 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
              <XCircle className="text-rose-400" size={18} />
              Từ Chối Câu Đóng Góp #{rejectingId}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Nhập lý do để sinh viên biết lý do câu chưa được duyệt (sai luật, trùng lặp, thiếu căn cứ):
            </p>

            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="VD: Căn cứ chưa chính xác theo Bộ luật Dân sự 2015 hiện hành..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
