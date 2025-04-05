// utils/battleLogics/getBestSwitchIndex.ts
import { useBattleStore } from "../../Context/useBattleStore";
import { calculateTypeEffectiveness } from "../typeRalation";

export function getBestSwitchIndex(side: "my" | "enemy"): number {
  const { myTeam, enemyTeam, activeMy, activeEnemy } = useBattleStore.getState();
  const team = side === "my" ? myTeam : enemyTeam;
  const activeIndex = side === "my" ? activeMy : activeEnemy;
  const opponent = side === "my" ? enemyTeam[activeEnemy] : myTeam[activeMy];

  let bestIndex = -1;
  let bestScore = -Infinity;

  team.forEach((p, i) => {
    if (i === activeIndex || p.currentHp <= 0) return;
    const effectiveness = calculateTypeEffectiveness(p.base.types[0], opponent.base.types); // 단일 타입 기준
    if (effectiveness > bestScore) {
      bestScore = effectiveness;
      bestIndex = i;
    }
  });

  return bestIndex !== -1 ? bestIndex : activeIndex;
}