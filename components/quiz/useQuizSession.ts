"use client";

import { useState, useCallback } from "react";
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
  [key: string]: unknown;
}

export interface UseQuizSessionProps {
  items: QuizItem[];
  subject: "dan-su" | "hanh-chinh" | "doanh-nghiep";
  itemType: "mcq" | "nhan_dinh";
}

export function useQuizSession({ items, subject, itemType }: UseQuizSessionProps) {
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
  const current = items[currentIdx] ?? null;
  const total = queue.length;
  const isCorrect = picked !== null && picked === current?.dap_an;

  const select = useCallback((a: AnswerValue) => {
    if (picked !== null) return;
    setSelected(a);
  }, [picked]);

  const check = useCallback(() => {
    if (selected === null || picked !== null || !current) return;

    const ok = selected === current.dap_an;
    const nextCombo = ok ? combo + 1 : 0;
    const gain = ok ? xpFor(nextCombo) : 0;

    setPicked(selected);
    setResults((prev) => [...prev, ok ? "good" : "bad"]);
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

    saveAttempt({
      itemId: current.id,
      itemType,
      subject,
      isCorrect: ok,
      xp: gain,
    });
  }, [selected, picked, current, combo, currentIdx, itemType, subject]);

  const next = useCallback(() => {
    if (index + 1 < queue.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setPicked(null);
    } else {
      setFinished(true);
      playTone("done");
    }
  }, [index, queue.length]);

  const restart = useCallback((onlyWrong: boolean = false) => {
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
  }, [wrongIndices, items]);

  return {
    current,
    index,
    total,
    selected,
    picked,
    isCorrect,
    results,
    combo,
    maxCombo,
    xpRun,
    lastGain,
    correctCount,
    wrongCount: wrongIndices.length,
    finished,
    select,
    check,
    next,
    restart,
  };
}