"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Flag,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CommentItem, fetchComments, postComment, reportComment, deleteComment } from "@/lib/comments";
import { getLocalPlayer, PlayerProfile } from "@/lib/player";
import { NicknameModal } from "@/components/auth/NicknameModal";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

export function CommentModal({ isOpen, onClose, itemId }: CommentModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [showNickModal, setShowNickModal] = useState(false);
  const [player, setPlayer] = useState<PlayerProfile | null>(() => getLocalPlayer());

  useEffect(() => {
    let isMounted = true;
    if (isOpen && itemId) {
      fetchComments(itemId).then((list) => {
        if (isMounted) {
          setComments(list);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) {
      setShowNickModal(true);
      return;
    }

    setError(null);
    setSubmitting(true);
    const res = await postComment(itemId, body);
    setSubmitting(false);

    if (res.success && res.comment) {
      setComments((prev) => [...prev, res.comment!]);
      setBody("");
    } else {
      setError(res.error || "Không thể gửi bình luận.");
    }
  };

  const handleReport = async (cId: string) => {
    if (reportedIds.includes(cId)) return;
    if (confirm("Bạn có chắc muốn báo cáo bình luận này?")) {
      await reportComment(cId);
      setReportedIds((prev) => [...prev, cId]);
      setComments((prev) => prev.filter((c) => c.id !== cId));
    }
  };

  const handleDelete = async (cId: string) => {
    if (confirm("Bạn có chắc muốn xóa bình luận của mình?")) {
      await deleteComment(cId);
      setComments((prev) => prev.filter((c) => c.id !== cId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl border border-line bg-surface flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <header className="flex h-14 flex-none items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-navy-bar" />
            <h2 className="text-sm font-bold text-ink">
              Thảo luận câu hỏi ({comments.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="press flex h-9 w-9 items-center justify-center rounded-xl text-ink-3 hover:text-ink"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </header>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-3">
              <Loader2 size={20} className="animate-spin mr-2 text-navy-bar" />
              Đang tải bình luận...
            </div>
          ) : comments.length > 0 ? (
            comments.map((cmt) => {
              const isOwner = player && (cmt.playerId === player.id);
              return (
                <div
                  key={cmt.id}
                  className="rounded-2xl border border-line bg-bg-2 p-3 text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-ink">{cmt.nickname}</span>
                      <span className="rounded bg-navy-soft px-1.5 py-0.2 text-[10px] font-bold text-navy-ink">
                        {cmt.school}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <button
                          onClick={() => handleDelete(cmt.id)}
                          className="press text-ink-3 hover:text-danger flex items-center gap-0.5 text-[10px]"
                          title="Xóa bình luận của bạn"
                        >
                          <Trash2 size={12} /> Xóa
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReport(cmt.id)}
                          className="press text-ink-3 hover:text-danger flex items-center gap-0.5 text-[10px]"
                          title="Báo cáo bình luận"
                        >
                          <Flag size={11} /> Báo cáo
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-ink text-xs leading-relaxed break-words">
                    {cmt.body}
                  </p>

                  <span className="text-[10px] text-ink-3">
                    {new Date(cmt.createdAt).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-ink-3 py-10">
              <MessageSquare size={36} className="mb-2 opacity-40" />
              <p className="text-xs font-semibold text-ink">Chưa có bình luận nào</p>
              <p className="text-[11px] text-ink-3 mt-1">
                Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ góc nhìn pháp lý!
              </p>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="border-t border-line bg-surface p-3">
          {error && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-danger font-medium">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                player
                  ? `Bình luận dưới tên ${player.nickname}...`
                  : "Đặt biệt danh để tham gia bình luận..."
              }
              maxLength={500}
              className="h-10 flex-1 rounded-xl border border-line bg-bg-2 px-3 text-xs text-ink placeholder:text-ink-3 focus:border-navy-bar focus:outline-none"
            />
            <Button
              type="submit"
              disabled={submitting || !body.trim()}
              size="sm"
              className="h-10 px-3 font-bold"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </Button>
          </form>
          <div className="mt-1 flex items-center justify-between text-[10px] text-ink-3 px-1">
            <span>Tối đa 500 ký tự · Tự động ẩn nếu bị báo cáo 3 lần</span>
            <span>{body.length}/500</span>
          </div>
        </div>
      </div>

      <NicknameModal
        isOpen={showNickModal}
        onClose={() => setShowNickModal(false)}
        onSuccess={(p) => {
          setPlayer(p);
        }}
      />
    </div>
  );
}
