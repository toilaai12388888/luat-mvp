"use client";

import React, { useState, useEffect } from "react";
import { 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ExternalLink 
} from "lucide-react";
import { getApprovedCommunityQuestions, UserContribution } from "@/lib/contributions";
import { ContributeQuestionModal } from "./ContributeQuestionModal";

interface CommunityQuestionsListProps {
  subject: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  chapter: string;
}

export function CommunityQuestionsList({ subject, chapter }: CommunityQuestionsListProps) {
  const [questions, setQuestions] = useState<UserContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string | number, number | boolean>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    let active = true;
    getApprovedCommunityQuestions(subject, chapter).then((data) => {
      if (active) {
        setQuestions(data);
        setLoading(false);
      }
    });

    const onSubmitted = () => {
      getApprovedCommunityQuestions(subject, chapter).then((data) => {
        if (active) setQuestions(data);
      });
    };

    window.addEventListener("luat_contribution_submitted", onSubmitted);
    return () => {
      active = false;
      window.removeEventListener("luat_contribution_submitted", onSubmitted);
    };
  }, [subject, chapter]);

  const handleSelectOption = (qId: string | number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  const handleSelectBoolean = (qId: string | number, val: boolean) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: val }));
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="mt-8 pt-6 border-t border-line">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center border border-gold/30">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base text-ink flex items-center gap-1.5">
              Câu hỏi cộng đồng <Sparkles size={14} className="text-gold" />
            </h3>
            <p className="text-xs text-ink-3">Do chính sinh viên đóng góp và đã qua kiểm duyệt</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition cursor-pointer shadow-sm"
        >
          <PlusCircle size={14} /> Đóng góp câu mới
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-6 text-center text-xs text-ink-3">Đang tải câu hỏi cộng đồng...</div>
      ) : questions.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-surface border border-dashed border-line">
          <p className="text-xs text-ink-2 mb-2">
            Chưa có câu hỏi cộng đồng nào cho chương này.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-gold hover:underline cursor-pointer"
          >
            Hãy là sinh viên đầu tiên đóng góp câu hỏi!
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((item, idx) => {
            const p = item.payload;
            const qId = item.id || idx;
            const selected = selectedAnswers[qId];
            const isRevealed = showExplanations[qId];

            return (
              <div
                key={qId}
                className="p-4 rounded-2xl bg-surface border border-line shadow-sm hover:border-gold/30 transition"
              >
                {/* Author attribution */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-navy-ink bg-navy-soft/60 px-2.5 py-0.5 rounded-full border border-navy-bar/20">
                    Đóng góp bởi: <strong className="text-gold-ink">{p.authorName}</strong>
                  </span>
                  <span className="text-[10px] text-ink-3 uppercase font-mono">
                    {p.type === "mcq" ? "Trắc nghiệm" : "Nhận định"}
                  </span>
                </div>

                {/* Question statement */}
                <p className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                  {p.question}
                </p>

                {/* Options if MCQ */}
                {p.type === "mcq" && p.options && (
                  <div className="space-y-2 mb-3">
                    {p.options.map((opt, optIdx) => {
                      const isChosen = selected === optIdx;
                      const isCorrect = optIdx === p.correctIndex;
                      let btnStyle = "bg-bg-2 border-line text-ink hover:border-gold/40";

                      if (isRevealed) {
                        if (isCorrect) {
                          btnStyle = "bg-good-soft border-good text-good-ink font-bold";
                        } else if (isChosen && !isCorrect) {
                          btnStyle = "bg-danger-soft border-danger text-danger-ink";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qId, optIdx)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center gap-2 transition cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-mono font-bold w-5">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isRevealed && isCorrect && <CheckCircle2 size={16} className="text-good shrink-0" />}
                          {isRevealed && isChosen && !isCorrect && <XCircle size={16} className="text-danger shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Boolean choices if Nhận định */}
                {p.type === "nhan_dinh" && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[true, false].map((val) => {
                      const isChosen = selected === val;
                      const isCorrect = val === p.correctBoolean;
                      let btnStyle = "bg-bg-2 border-line text-ink hover:border-gold/40";

                      if (isRevealed) {
                        if (isCorrect) {
                          btnStyle = "bg-good-soft border-good text-good-ink font-bold";
                        } else if (isChosen && !isCorrect) {
                          btnStyle = "bg-danger-soft border-danger text-danger-ink";
                        }
                      }

                      return (
                        <button
                          key={String(val)}
                          onClick={() => handleSelectBoolean(qId, val)}
                          className={`py-2 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${btnStyle}`}
                        >
                          {val ? "ĐÚNG" : "SAI"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation Drawer */}
                {isRevealed && (
                  <div className="mt-3 p-3 bg-bg-2 rounded-xl text-xs space-y-1.5 border border-line">
                    <p className="text-ink-2 leading-relaxed">
                      <strong className="text-ink">Giải thích: </strong> {p.explanation}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap text-ink-3 pt-1 border-t border-line/60">
                      <strong>Căn cứ:</strong>
                      <span>{p.citationDoc} - Điều {p.citationArticle}</span>
                      {p.citationLink && (
                        <a
                          href={p.citationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold-ink underline inline-flex items-center gap-1 font-medium hover:text-gold"
                        >
                          Link kiểm chứng <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ContributeQuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialSubject={subject}
        initialChapter={chapter}
      />
    </div>
  );
}
