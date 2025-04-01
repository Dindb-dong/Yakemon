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
  } // TODO: 헤롱헤롱, 풀죽음, 얼음, 잠듦 등 추가 
  return { rate: currentRate, isHit: true };
}