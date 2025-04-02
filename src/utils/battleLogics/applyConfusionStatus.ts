import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { addStatus } from "./updateBattlePokemon";

export function applyConfusionStatus(side: "my" | "enemy", index: number) {
  const { updatePokemon } = useBattleStore.getState();
  const { addEffect } = useDurationStore.getState();

  // 1. 상태이상 부여
  updatePokemon(side, index, (prev) => addStatus(prev, "혼란"));

  // 2. 1~4턴 랜덤 설정
  const duration = Math.floor(Math.random() * 4) + 1;

  // 3. 지속효과 추가 (혼란은 durationStore에만 등록, 상태이상은 위에서 등록됨)
  addEffect(side, {
    name: "혼란",
    remainingTurn: duration,
  });
}