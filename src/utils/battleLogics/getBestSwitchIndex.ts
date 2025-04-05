import { useBattleStore } from "../../Context/useBattleStore";
import { calculateTypeEffectiveness } from "../typeRalation";

// 공격자가 복수 타입일 때 가장 높은 상성값 반환
function getMaxEffectiveness(attackerTypes: string[], defenderTypes: string[]): number {
  return attackerTypes.reduce((max, atkType) => {
    const eff = calculateTypeEffectiveness(atkType, defenderTypes);
    return Math.max(max, eff);
  }, 1);
}

export function getBestSwitchIndex(side: "my" | "enemy"): number {
  const { myTeam, enemyTeam, activeMy, activeEnemy } = useBattleStore.getState();
  const team = side === "my" ? myTeam : enemyTeam;
  const activeIndex = side === "my" ? activeMy : activeEnemy;
  const opponent = side === "my" ? enemyTeam[activeEnemy] : myTeam[activeMy];

  // ✅ 교체 가능한 포켓몬 필터링
  const availableIndexes = team
    .map((p, i) => ({ ...p, index: i }))
    .filter(p => p.index !== activeIndex && p.currentHp > 0); // 지금 포켓몬과 다르고, 체력 남은 애. 

  if (availableIndexes.length === 0) {
    return -1;
  }
  // ✅ 1마리만 남은 경우
  if (availableIndexes.length === 1) {
    return availableIndexes[0].index;
  }

  let strongCounter: number | null = null;
  let neutralOption: number | null = null;
  let backup: number | null = null;

  availableIndexes.forEach(({ base, index }) => {
    const eff = getMaxEffectiveness(base.types, opponent.base.types);

    if (eff > 1.5 && strongCounter === null) {
      strongCounter = index;
    } else if (eff <= 1.0 && neutralOption === null) {
      neutralOption = index;
    } else if (backup === null) {
      backup = index;
    }
  });

  return (
    strongCounter ??
    neutralOption ??
    backup ??
    activeIndex
  );
}