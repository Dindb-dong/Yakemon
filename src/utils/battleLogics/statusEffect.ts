import { MoveInfo } from "../../models/Move";
import { StatusState } from "../../models/Status";

export function applyStatusEffectBefore(
  status: StatusState[],
  currentRate: number,
  move: MoveInfo
): { rate: number, isHit: boolean } {
  if (status.includes("화상") && move.category === "물리") {
    return { rate: currentRate * 0.5, isHit: true };
  } else if (status.includes('마비')) {
    if (Math.random() > 0.25) {
      return { rate: currentRate, isHit: true };
    } else {
      return { rate: currentRate, isHit: false };
    }
  } else if (status.includes('풀죽음')) {
    return { rate: currentRate, isHit: false }
  } else if (status.includes('얼음')) {
    if (Math.random() > 0.1) {
      return { rate: currentRate, isHit: true };
    } else {
      return { rate: currentRate, isHit: false };
    }
  } else if (status.includes('헤롱헤롱')) {
    if (Math.random() > 0.5) {
      return { rate: currentRate, isHit: true };
    } else {
      return { rate: currentRate, isHit: false };
    }
  }
  return { rate: currentRate, isHit: true };
}