"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Laptop,
  Check,
  Globe,
  Radio,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getDeviceId, isLocalInternalDevice, setLocalInternalDevice } from "@/lib/usage";

interface DailyStat {
  date: string;
  browsers: number;
  studyBrowsers: number;
  lessons: number;
  dailyDone: number;
  questions: number;
}

interface SourceStat {
  source: string;
  count: number;
}

interface AnalyticsData {
  success?: boolean;
  tableReady?: boolean;
  error?: string;
  needsMigration?: boolean;
  range?: { start: string; end: string };
  filterMode?: string;
  firstTrackedDate?: string;
  lastUpdated?: string;
  activeRecently5m?: number;
  uniqueBrowsers?: number;
  studyBrowsers?: number;
  totalLessons?: number;
  dailyChallengeBrowsers?: number;
  returningBrowsers?: number;
  completionRate?: number;
  totalInternalDevices?: number;
  daily?: DailyStat[];
  sources?: SourceStat[];
}

interface UsageAnalyticsViewProps {
  pin: string;
}

export function UsageAnalyticsView({ pin }: UsageAnalyticsViewProps) {
  const [range, setRange] = useState<"today" | "7d" | "30d" | "custom">("7d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterMode, setFilterMode] = useState<"exclude_internal" | "all" | "only_internal">("exclude_internal");

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Device management
  const [currentDeviceId] = useState<string | null>(() => (typeof window !== "undefined" ? getDeviceId() : null));
  const [isInternal, setIsInternal] = useState<boolean>(() => (typeof window !== "undefined" ? isLocalInternalDevice() : false));
  const [isTogglingDevice, setIsTogglingDevice] = useState(false);
  const [toggleSuccess, setToggleSuccess] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    setErrorMsg(null);

    const params = new URLSearchParams();
    params.set("range", range);
    params.set("filterMode", filterMode);
    if (range === "custom") {
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
    }

    try {
      const res = await fetch(`/api/admin/usage?${params.toString()}`, {
        headers: {
          "x-admin-pin": pin,
        },
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        if (json.needsMigration || json.tableReady === false) {
          setData(json);
        } else {
          setErrorMsg(json.error || "Lỗi tải thống kê");
        }
      } else {
        setData(json);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg("Lỗi kết nối máy chủ: " + msg);
    } finally {
      setLoading(false);
    }
  }, [pin, range, filterMode, startDate, endDate]);

  useEffect(() => {
    if (!pin) return;
    let ignore = false;
    const params = new URLSearchParams();
    params.set("range", range);
    params.set("filterMode", filterMode);
    if (range === "custom") {
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
    }

    fetch(`/api/admin/usage?${params.toString()}`, {
      headers: { "x-admin-pin": pin },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          if (json.error && !json.needsMigration && json.tableReady !== false) {
            setErrorMsg(json.error);
          } else {
            setData(json);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorMsg("Lỗi kết nối: " + String(err));
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [pin, range, filterMode, startDate, endDate]);

  const handleToggleCurrentDevice = async () => {
    if (!currentDeviceId || isTogglingDevice) return;
    setIsTogglingDevice(true);
    setToggleSuccess(null);

    const nextState = !isInternal;
    try {
      const res = await fetch("/api/admin/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          action: "toggle_internal_device",
          deviceId: currentDeviceId,
          isInternal: nextState,
          label: nextState ? "Quản trị viên / Thiết bị test" : undefined,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setLocalInternalDevice(nextState);
        setIsInternal(nextState);
        setToggleSuccess(nextState ? "Đã đánh dấu là Thiết bị nội bộ" : "Đã bỏ đánh dấu (tính là khách)");
        setTimeout(() => setToggleSuccess(null), 3000);
        handleRefresh();
      } else {
        alert(resData.error || "Không thể cập nhật thiết bị");
      }
    } catch (err: unknown) {
      alert("Lỗi cập nhật thiết bị: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsTogglingDevice(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. THANH ĐIỀU KHIỂN & BỘ LỌC */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <span>Thống kê người dùng & lượt học</span>
              {data && data.activeRecently5m !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {data.activeRecently5m} đang hoạt động
                </span>
              )}
            </h2>
            <p className="text-xs text-ink-3 mt-0.5">
              Đo lường ẩn danh theo thiết bị/trình duyệt, múi giờ Việt Nam (UTC+7).
            </p>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 px-3 text-xs font-bold text-ink-2 gap-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </Button>
        </div>

        {/* Bộ lọc khoảng ngày */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60">
          <span className="text-xs font-medium text-ink-3">Thời gian:</span>
          <div className="flex rounded-xl border border-line bg-bg-2 p-1 text-xs font-bold">
            <button
              onClick={() => setRange("today")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === "today" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === "7d" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === "30d" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"
              }`}
            >
              30 ngày qua
            </button>
            <button
              onClick={() => setRange("custom")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                range === "custom" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"
              }`}
            >
              Tùy chọn
            </button>
          </div>

          {/* Nếu chọn Tùy chọn */}
          {range === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink outline-none"
              />
              <span className="text-ink-3">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink outline-none"
              />
            </div>
          )}

          {/* Bộ lọc nội bộ */}
          <div className="ml-auto flex items-center gap-2">
            <Filter size={13} className="text-ink-3" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as "exclude_internal" | "all" | "only_internal")}
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-bold text-ink outline-none cursor-pointer"
            >
              <option value="exclude_internal">Khách ngoài (loại trừ nội bộ)</option>
              <option value="all">Tất cả (gồm cả nội bộ)</option>
              <option value="only_internal">Chỉ kiểm thử nội bộ</option>
            </select>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* 2. CẢNH BÁO NẾU BẢNG HOẶC RPC CHƯA ĐƯỢC TẠO TRÊN SUPABASE */}
      {data && (data.tableReady === false || data.needsMigration) && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="text-xs space-y-1.5">
              <h4 className="font-bold text-sm text-amber-950">
                Chưa khởi tạo bảng đo lường trên Supabase
              </h4>
              <p>
                Bảng <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">usage_daily</code> và RPC thống kê chưa có trên database.
              </p>
              <p className="font-medium">
                Để kích hoạt, bạn hãy mở <strong>Supabase SQL Editor</strong> của dự án, dán nội dung tệp:
              </p>
              <code className="block bg-amber-100/90 p-2 rounded-lg font-mono text-[11px] text-amber-950 select-all">
                supabase/migrations/20261028_complete_usage_and_leaderboard.sql
              </code>
              <p className="text-[11px] text-amber-800">
                (hoặc tệp <code className="font-mono">D:\Projects\Luat Le - Bai dang\Theo doi so lieu\1 - Chay 1 lan - Tao bo dem.sql</code>) rồi bấm <strong>Run</strong>.
              </p>
              <Button
                size="sm"
                onClick={handleRefresh}
                className="mt-2 h-8 px-3 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Tôi đã chạy SQL, kiểm tra lại
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CARD QUẢN LÝ THIẾT BỊ NỘI BỘ HIỆN TẠI */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isInternal ? "bg-navy-soft text-navy-ink border border-navy-bar/40" : "bg-bg-2 text-ink-2"
          }`}>
            <Laptop size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">Trình duyệt hiện tại của bạn:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isInternal
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}>
                {isInternal ? "Đã đánh dấu Nội bộ / QA" : "Khách ngoài thông thường"}
              </span>
            </div>
            <span className="text-[11px] text-ink-3 font-mono block mt-0.5 truncate max-w-[280px]">
              ID: {currentDeviceId || "Đang tải mã..."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toggleSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check size={14} />
              {toggleSuccess}
            </span>
          )}
          <Button
            size="sm"
            variant={isInternal ? "ghost" : "secondary"}
            onClick={handleToggleCurrentDevice}
            disabled={isTogglingDevice || !currentDeviceId}
            className="h-8 text-xs font-bold whitespace-nowrap"
          >
            {isInternal ? "Bỏ đánh dấu (tính là khách)" : "Đánh dấu trình duyệt này là Nội bộ"}
          </Button>
        </div>
      </div>

      {/* 4. CHỈ SỐ TỔNG QUAN (6 CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Card 1: Khách ghé web */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-xs font-bold text-ink-2">Trình duyệt ghé web</span>
            <Users size={16} className="text-navy-bar" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-ink">
              {loading ? "..." : data?.uniqueBrowsers ?? 0}
            </span>
            <span className="text-[10px] text-ink-3 block mt-1">
              Mã trình duyệt phân biệt trong kỳ
            </span>
          </div>
        </div>

        {/* Card 2: Người học thực sự */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-xs font-bold text-ink-2">Người học thực sự</span>
            <GraduationCap size={16} className="text-indigo-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-indigo-700">
              {loading ? "..." : data?.studyBrowsers ?? 0}
            </span>
            <span className="text-[10px] text-ink-3 block mt-1">
              Hoàn thành ít nhất 1 bài tập
            </span>
          </div>
        </div>

        {/* Card 3: Tỷ lệ học */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-xs font-bold text-ink-2">Tỷ lệ hoàn thành bài</span>
            <ArrowUpRight size={16} className="text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-700">
              {loading ? "..." : `${data?.completionRate ?? 0}%`}
            </span>
            <span className="text-[10px] text-ink-3 block mt-1">
              Người học / Tổng khách ghé
            </span>
          </div>
        </div>

        {/* Card 4: Tổng lượt học hoàn thành */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-xs font-bold text-ink-2">Lượt học hoàn thành</span>
            <CheckCircle2 size={16} className="text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-navy-ink">
              {loading ? "..." : data?.totalLessons ?? 0}
            </span>
            <span className="text-[10px] text-ink-3 block mt-1">
              Trắc nghiệm, tình huống, thi thử, ngày
            </span>
          </div>
        </div>

        {/* Card 5: Thử thách hằng ngày */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-xs font-bold text-ink-2">Thử thách 5 câu</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">
              {loading ? "..." : data?.dailyChallengeBrowsers ?? 0}
            </span>
            <span className="text-[10px] text-ink-3 block mt-1">
              Hoàn thành thử thách hằng ngày
            </span>
          </div>
        </div>

        {/* Card 6: Người quay lại */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-xs font-bold text-ink-2">Khách quay lại (≥ 2 ngày)</span>
            <Calendar size={16} className="text-purple-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-700">
              {loading ? "..." : data?.returningBrowsers ?? 0}
            </span>
            <span className="text-[10px] text-ink-3 block mt-1">
              Hoạt động từ 2 ngày khác nhau trở lên
            </span>
          </div>
        </div>
      </div>

      {/* 5. HOẠT ĐỘNG GẦN ĐÂY 5 PHÚT */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-ink block">Hoạt động trong 5 phút qua (Ước tính)</span>
            <span className="text-[11px] text-ink-3">
              Số trình duyệt đang mở tab web và có tương tác gần nhất
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-black text-emerald-600">
            {loading ? "..." : data?.activeRecently5m ?? 0}
          </span>
          <span className="text-[10px] text-ink-3 block">trình duyệt</span>
        </div>
      </div>

      {/* 6. BẢNG CHI TIẾT THEO NGÀY */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <Calendar size={16} className="text-navy-bar" />
          <span>Chi tiết theo ngày (giờ Việt Nam)</span>
        </h3>

        {(!data?.daily || data.daily.length === 0) ? (
          <div className="py-8 text-center text-xs text-ink-3">
            Chưa có dữ liệu trong khoảng thời gian này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold text-ink-3">
                  <th className="pb-2">Ngày</th>
                  <th className="pb-2 text-right">Ghé web</th>
                  <th className="pb-2 text-right">Người học</th>
                  <th className="pb-2 text-right">Lượt học</th>
                  <th className="pb-2 text-right">Thử thách 5 câu</th>
                  <th className="pb-2 text-right">Số câu làm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.daily.map((d) => (
                  <tr key={d.date} className="hover:bg-bg-2/50 transition-colors">
                    <td className="py-2.5 font-bold text-ink">{d.date}</td>
                    <td className="py-2.5 text-right font-medium text-ink">{d.browsers}</td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">{d.studyBrowsers}</td>
                    <td className="py-2.5 text-right font-medium text-navy-ink">{d.lessons}</td>
                    <td className="py-2.5 text-right font-medium text-amber-600">{d.dailyDone}</td>
                    <td className="py-2.5 text-right font-medium text-ink-2">{d.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. BẢNG NGUỒN TRUY CẬP (REFERRERS) */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
          <Globe size={16} className="text-navy-bar" />
          <span>Nguồn truy cập (Referrer / UTM)</span>
        </h3>

        {(!data?.sources || data.sources.length === 0) ? (
          <div className="py-8 text-center text-xs text-ink-3">
            Chưa có dữ liệu nguồn truy cập.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-[11px] font-bold text-ink-3">
                  <th className="pb-2">Kênh dẫn đến</th>
                  <th className="pb-2 text-right">Số trình duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {data.sources.map((s) => (
                  <tr key={s.source} className="hover:bg-bg-2/50 transition-colors">
                    <td className="py-2.5 font-bold text-ink">{s.source}</td>
                    <td className="py-2.5 text-right font-black text-navy-ink">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. THÔNG TIN & LƯU Ý PHƯƠNG PHÁP ĐO */}
      <div className="rounded-2xl border border-line bg-bg-2 p-4 text-xs text-ink-3 space-y-2">
        <div className="flex items-center gap-2 text-ink font-bold">
          <Clock size={14} />
          <span>Thông tin đo lường & Giới hạn kỹ thuật</span>
        </div>
        <p>
          • <strong>Định danh:</strong> 1 trình duyệt = 1 mã UUID ngẫu nhiên lưu trong localStorage. Đổi sang điện thoại, tab ẩn danh hoặc xóa bộ nhớ duyệt web sẽ được tính là trình duyệt mới.
        </p>
        <p>
          • <strong>Quyền riêng tư:</strong> Không thu thập địa chỉ IP thô, email hay danh tính cá nhân.
        </p>
        <p>
          • <strong>Khách quay lại:</strong> Được tính là trình duyệt có hoạt động từ 2 ngày dương lịch khác nhau trở lên trong khoảng thời gian được chọn.
        </p>
        <p>
          • <strong>Ngày bắt đầu ghi nhận:</strong> {data?.firstTrackedDate || "Chưa có bản ghi nào"}. Lần đồng bộ máy chủ: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString("vi-VN") : "--:--"}.
        </p>
      </div>
    </div>
  );
}
