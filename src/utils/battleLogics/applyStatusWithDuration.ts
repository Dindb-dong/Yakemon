import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { addStatus } from "./updateBattlePokemon";

// side: "my" | "enemy"
// index: 몇 번째 포켓몬인지
// status: '풀죽음'
export function applyStatusWithDuration(
  side: "my" | "enemy",
  index: number,
  status: "도발" | "앵콜" | "풀죽음" | "잠듦"
) {
  const { updatePokemon } = useBattleStore.getState();
  const { addEffect } = useDurationStore.getState();

  // 1. 포켓몬에 상태이상 부여
  updatePokemon(side, index, (prev) => addStatus(prev, status));

  // 2. 지속 시간 설정
  const durationMap: Record<typeof status, number> = {
    도발: 3,
    앵콜: 3,
    풀죽음: 1,
    잠듦: 3,
  };

  addEffect(side, {
    name: status,
    remainingTurn: durationMap[status],
  });
}