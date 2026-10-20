"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Share2, PlusSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { subscribeToPush, isIosSafari } from "@/lib/push";

export function PushPromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if prompted before
    const dismissed = localStorage.getItem("luat_push_prompt_dismissed");
    const alreadySubbed = localStorage.getItem("luat_push_subscribed");
    if (dismissed || alreadySubbed) return;

    const handler = () => {
      setIsIos(isIosSafari());
      setIsOpen(true);
    };

    window.addEventListener("luat_first_quiz_completed", handler);
    return () => window.removeEventListener("luat_first_quiz_completed", handler);
  }, []);

  if (!isOpen) return null;

  const handleDismiss = () => {
    localStorage.setItem("luat_push_prompt_dismissed", "true");
    setIsOpen(false);
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    const res = await subscribeToPush();
    setSubscribing(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } else {
      // Permission denied or dismissed
      handleDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-5 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="press absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-ink-3 hover:text-ink"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-soft text-navy-bar">
            <Bell size={24} />
          </div>

          <h3 className="text-base font-bold text-ink">Giữ chuỗi ôn thi Luật</h3>
          <p className="mt-1 text-xs text-ink-3 leading-relaxed">
            Nhận thông báo nhắc học vào 20:00 hằng ngày — chỉ 5 câu để không đứt chuỗi!
          </p>

          {isIos ? (
            <div className="mt-4 w-full rounded-2xl border border-line bg-bg-2 p-3 text-left text-xs text-ink-2">
              <div className="font-semibold text-ink flex items-center gap-1.5 mb-1.5">
                <Share2 size={14} className="text-navy-bar" /> Dành cho iPhone / Safari:
              </div>
              <p className="text-[11px] leading-relaxed text-ink-3">
                1. Bấm nút <span className="font-bold text-ink">Chia sẻ</span> ở thanh dưới Safari.<br />
                2. Chọn <span className="font-bold text-ink flex items-center gap-1 inline-flex"><PlusSquare size={12} /> Thêm vào MH chính</span> để nhận nhắc học.
              </p>
              <div className="mt-3">
                <Button variant="secondary" size="sm" className="w-full text-xs" onClick={handleDismiss}>
                  Đã hiểu
                </Button>
              </div>
            </div>
          ) : success ? (
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-success">
              <Check size={16} /> Đã bật nhắc học thành công!
            </div>
          ) : (
            <div className="mt-5 flex w-full gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleDismiss}
              >
                Để sau
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs font-bold"
                onClick={handleSubscribe}
                disabled={subscribing}
              >
                {subscribing ? "Đang bật..." : "Bật nhắc học"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
