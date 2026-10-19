"use client";

import React, { useState } from "react";
import { User, School, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LAW_SCHOOLS, ensureAnonymousPlayer, PlayerProfile } from "@/lib/player";

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (player: PlayerProfile) => void;
  title?: string;
  description?: string;
}

export function NicknameModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Chọn biệt danh & Trường",
  description = "Tạo danh tính để tham gia bảng xếp hạng tuần, thách đấu và thảo luận.",
}: NicknameModalProps) {
  const [nickname, setNickname] = useState("");
  const [school, setSchool] = useState<string>(LAW_SCHOOLS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await ensureAnonymousPlayer(nickname, school);
    setLoading(false);

    if (res.success && res.player) {
      onSuccess(res.player);
      onClose();
    } else {
      setError(res.error || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="press absolute right-4 top-4 text-ink-3 hover:text-ink"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="mt-1 text-xs text-ink-2">{description}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-danger/20 bg-danger-soft p-3 text-xs text-danger font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
              <User size={14} className="text-navy-bar" />
              Biệt danh hiển thị
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="VD: LuatSuTuongLai, MinhDuc_K47..."
              maxLength={24}
              required
              className="h-11 w-full rounded-xl border border-line bg-bg-2 px-3 text-sm text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
              <School size={14} className="text-navy-bar" />
              Trường đang học / làm việc
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {LAW_SCHOOLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSchool(s)}
                  className={`press flex items-center justify-start rounded-lg border p-2 text-left text-xs font-medium transition-colors ${
                    school === s
                      ? "border-navy-bar bg-navy-soft text-navy-ink font-bold"
                      : "border-line bg-bg-2 text-ink-2 hover:bg-bg-3"
                  }`}
                >
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="mt-2 h-11 w-full font-bold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </span>
            ) : (
              "Lưu & Tiếp tục"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
