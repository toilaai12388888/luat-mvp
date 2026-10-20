"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Bot, 
  Send, 
  AlertCircle, 
  RefreshCw, 
  ShieldAlert
} from "lucide-react";
import { getLocalPlayer } from "@/lib/player";

interface HoiAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  questionText?: string;
}

const QUICK_PROMPTS = [
  "Vì sao đáp án này đúng theo điều luật?",
  "Có trường hợp ngoại lệ nào cần lưu ý không?",
  "Bẫy hay gặp ở câu này trong đề thi là gì?",
];

export function HoiAiModal({ isOpen, onClose, itemId, questionText }: HoiAiModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAsk = async (textToAsk: string) => {
    const q = textToAsk.trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg("");
    setResponse(null);

    const player = getLocalPlayer();

    try {
      const res = await fetch("/api/hoi-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          userQuestion: q,
          playerId: player?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Không thể kết nối trợ lý AI");
        if (data.remaining !== undefined) setRemaining(data.remaining);
        return;
      }

      setResponse(data.answer);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch {
      setErrorMsg("Lỗi kết nối mạng khi gọi Hỏi AI");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-slate-900 border border-slate-700 p-5 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Hỏi Trợ Lý AI</h2>
                <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.2 rounded-full">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">Giải đáp chuyên sâu & đối chiếu điều luật</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {questionText && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 line-clamp-2 italic">
              &ldquo;{questionText}&rdquo;
            </div>
          )}

          {/* Quick suggestions */}
          {!response && !loading && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Gợi ý câu hỏi nhanh:
              </label>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(qp);
                      handleAsk(qp);
                    }}
                    className="text-left text-xs p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 text-slate-300 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{qp}</span>
                    <Sparkles size={14} className="text-purple-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Response Display */}
          {loading && (
            <div className="p-6 text-center space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl">
              <RefreshCw size={24} className="animate-spin text-purple-400 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                AI đang tra cứu và đối chiếu nguyên văn điều luật...
              </p>
            </div>
          )}

          {response && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/30 shadow-md">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-2">
                  <Sparkles size={14} /> Phản hồi từ trợ lý pháp lý:
                </div>
                <div className="text-xs text-slate-100 leading-relaxed whitespace-pre-line font-normal">
                  {response}
                </div>
              </div>

              {remaining !== null && (
                <div className="text-[11px] text-slate-400 text-right">
                  Còn <strong>{remaining}/5</strong> lượt hỏi hôm nay
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

          {/* Disclaimer (Mandatory) */}
          <div className="pt-2 pb-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldAlert size={13} className="text-amber-400 shrink-0" />
              AI có thể sai, hãy đối chiếu điều luật.
            </span>
            <span className="text-slate-500">Giới hạn 5 lần/ngày</span>
          </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmit} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            maxLength={300}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Đặt câu hỏi về câu này (tối đa 300 ký tự)..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
          >
            <Send size={14} /> Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
