export const XP_CORRECT = 10;
export const XP_COMBO = 15;
export const COMBO_FROM = 3;

export function xpFor(combo: number): number {
  return combo >= COMBO_FROM ? XP_COMBO : XP_CORRECT;
}