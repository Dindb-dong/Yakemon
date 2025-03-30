import { MoveInfo } from "../../models/Move";
import { StatusState } from "../../models/Status";

export function applyStatusEffect(
  status: StatusState[],
  currentRate: number,
  move: MoveInfo
): { rate: number; message?: string } {
  if (status.includes("화상") && move.category === "물리") {
    return { rate: currentRate * 0.5, message: "화상으로 공격력이 약해졌다!" };
  }
  return { rate: currentRate };
}