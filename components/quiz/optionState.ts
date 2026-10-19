import { AnswerValue } from "./useQuizSession";

export type OptionState = "idle" | "sel" | "good" | "bad" | "dim";

export function optionState(
  value: AnswerValue,
  selected: AnswerValue | null,
  picked: AnswerValue | null,
  dapAn: AnswerValue
): OptionState {
  if (picked === null || picked === undefined) {
    return selected === value ? "sel" : "idle";
  }
  if (value === dapAn) {
    return "good";
  }
  if (value === picked) {
    return "bad";
  }
  return "dim";
}