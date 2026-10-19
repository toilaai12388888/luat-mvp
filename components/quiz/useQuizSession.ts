"use client";

import { useState, useCallback, useMemo } from "react";
import { CanCu } from "@/lib/content-schema";
import { saveAttempt } from "@/lib/attempts";
import { xpFor } from "@/lib/game";
import { playTone } from "./sound";

export type AnswerValue = number | "dung" | "sai";

export interface QuizItem {
  id: string;
  dap_an: AnswerValue;
  giai_thich: string;
  can_cu: CanCu[];
  type?: "mcq" | "nhan_dinh";
  subject?: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  cau_hoi?: string;
  nhan_dinh?: string;
  lua_chon?: string[];
  question?: string;
  statement?: string;
  options?: string[];
  explanation?: string;
  references?: CanCu[];
  [key: string]: unknown;
}

export interface UseQuizSessionProps {
  items: QuizItem[];
  subject?: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  itemType?: "mcq" | "nhan_dinh";
  onFinish?: (results: ("good" | "bad")[]) => void;
}

export function useQuizSession({ items, subject = "dan-su", itemType = "mcq", onFinish }: UseQuizSessionProps) {
  const [queue, setQueue] = useState<number[]>(() => items.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<AnswerValue | null>(null);
  const [picked, setPicked] = useState<AnswerValue | null>(null);
  const [results, setResults] = useState<("good" | "bad")[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [xpRun, setXpRun] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const currentIdx = queue[index] ?? 0;
  const rawCurrent = items[currentIdx] ?? null;
  const current = useMemo<QuizItem | null>(() => {
    if (!rawCurrent) return null;
    return {
      ...rawCurrent,
      question: rawCurrent.cau_hoi ?? (typeof rawCurrent.question === "string" ? rawCurrent.question : undefined),
      statement: rawCurrent.nhan_dinh ?? (typeof rawCurrent.statement === "string" ? rawCurrent.statement : undefined),
      options: rawCurrent.lua_chon ?? (Array.isArray(rawCurrent.options) ? rawCurrent.options : undefined),
      explanation: rawCurrent.giai_thich ?? (typeof rawCurrent.explanation === "string" ? rawCurrent.explanation : undefined),
      references: rawCurrent.can_cu ?? (Array.isArray(rawCurrent.references) ? rawCurrent.references : undefined),
    };
  }, [rawCurrent]);

  const total = queue.length;
  const isCorrect = picked !== null && picked === current?.dap_an;

  const select = useCallback(
    (a: AnswerValue) => {
      if (picked !== null) return;
      setSelected(a);
    },
    [picked]
  );

  const check = useCallback(() => {
    if (selected === null || picked !== null || !current) return;

    const ok = selected === current.dap_an;
    const nextCombo = ok ? combo + 1 : 0;
    const gain = ok ? xpFor(nextCombo) : 0;

    const nextResults: ("good" | "bad")[] = [...results, ok ? "good" : "bad"];
    setPicked(selected);
    setResults(nextResults);
    if (ok) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongIndices((w) => [...w, currentIdx]);
    }
    setCombo(nextCombo);
    setMaxCombo((m) => Math.max(m, nextCombo));
    setXpRun((x) => x + gain);
    setLastGain(gain);

    playTone(ok ? "good" : "bad");

    const effectiveSubject = current.subject || subject;
    const effectiveType = current.type || itemType;

    saveAttempt({
      itemId: current.id,
      itemType: effectiveType,
      subject: effectiveSubject,
      isCorrect: ok,
      xp: gain,
    });

    if (index + 1 >= queue.length && onFinish) {
      onFinish(nextResults);
    }
  }, [selected, picked, current, combo, currentIdx, itemType, subject, results, index, queue.length, onFinish]);

  const next = useCallback(() => {
    if (index + 1 < queue.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setPicked(null);
    } else {
      setFinished(true);
      playTone("done");
      if (onFinish) {
        onFinish(results);
      }
    }
  }, [index, queue.length, onFinish, results]);

  const restart = useCallback(
    (onlyWrong: boolean = false) => {
      let nextQueue: number[] = [];
      if (onlyWrong && wrongIndices.length > 0) {
        nextQueue = [...wrongIndices];
      } else {
        nextQueue = items.map((_, i) => i);
      }
      setQueue(nextQueue);
      setIndex(0);
      setSelected(null);
      setPicked(null);
      setResults([]);
      setCombo(0);
      setMaxCombo(0);
      setXpRun(0);
      setLastGain(0);
      setCorrectCount(0);
      setWrongIndices([]);
      setFinished(false);
    },
    [wrongIndices, items]
  );

  return {
    current,
    currentItem: current,
    index,
    currentIndex: index,
    total,
    selected,
    selectedAnswer: selected,
    picked,
    isCorrect,
    isCurrentCorrect: isCorrect,
    results,
    combo,
    maxCombo,
    xpRun,
    totalXp: xpRun,
    lastGain,
    correctCount,
    wrongCount: wrongIndices.length,
    finished,
    isFinished: finished,
    status: (picked !== null ? "checked" : "idle") as "idle" | "checked",
    select,
    selectAnswer: select,
    check,
    checkAnswer: check,
    next,
    nextQuestion: next,
    restart,
    retry: restart,
  };
}
