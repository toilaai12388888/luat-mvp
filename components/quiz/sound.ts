let audioCtx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const s = localStorage.getItem("sound");
  return s === null ? true : s === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sound", String(enabled));
}

export function playTone(kind: "good" | "bad" | "done"): void {
  if (typeof window === "undefined") return;
  if (!isSoundEnabled()) return;

  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!audioCtx) {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const ac = audioCtx;
    // Frequencies from DESIGN.md:
    // good: [784, 1175] (sine)
    // bad: [233, 175] (triangle)
    // done: [659, 880, 1319] (sine)
    const notes =
      kind === "good"
        ? [784, 1175]
        : kind === "bad"
        ? [233, 175]
        : [659, 880, 1319];

    notes.forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = kind === "bad" ? "triangle" : "sine";
      o.frequency.value = f;

      const t = ac.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      o.connect(g);
      g.connect(ac.destination);
      o.start(t);
      o.stop(t + 0.22);
    });
  } catch {}
}