import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { MoveInfo } from "../../models/Move";
import { StatusState } from "../../models/Status";
import { removeStatus } from "./updateBattlePokemon";

export function applyStatusEffectBefore(
  status: StatusState[],
  currentRate: number,
  move: MoveInfo,
  side: "my" | "enemy",
): { rate: number, isHit: boolean } {
  const durationState = useDurationStore.getState();
  const { activeMy, activeEnemy, addLog, updatePokemon, myTeam, enemyTeam } = useBattleStore.getState();
  const activeTeam = side === 'my' ? myTeam : enemyTeam;
  const activeIndex = side === "my" ? activeMy : activeEnemy;
  const update = updatePokemon;

  // 💥 잠듦 처리
  if (status.includes("잠듦")) {
    const sleepList = side === "my" ? durationState.myEffects : durationState.enemyEffects;
    const sleepEffect = sleepList.find(e => e.name === "잠듦");

    if (sleepEffect) {
      const remaining = sleepEffect.remainingTurn;
      let recoveryChance = 0;

      if (remaining === 2) recoveryChance = 1 / 3;
      else if (remaining === 1) recoveryChance = 1 / 2;
      else if (remaining <= 0) recoveryChance = 1;

      if (Math.random() < recoveryChance) {
        // ✅ 잠듦 해제
        durationState.removeEffect(side, "잠듦");
        update(side, activeIndex, (prev) => removeStatus(prev, "잠듦"));
        addLog(`${activeTeam[activeIndex]}은/는 잠에서 깼다!`)
        return { rate: currentRate, isHit: true };
      } else {
        return { rate: currentRate, isHit: false };
      }
    }
  }

  if (status.includes("화상") && move.category === "물리") {
    return { rate: currentRate * 0.5, isHit: true };
  } else if (status.includes('마비')) {
    if (Math.random() > 0.25) {
      return { rate: currentRate, isHit: true };
    } else {
      addLog(`${activeTeam[activeIndex]}은/는 몸이 저렸다!`)
      return { rate: currentRate, isHit: false };
    }
  } else if (status.includes('풀죽음')) {
    return { rate: currentRate, isHit: false }
  } else if (status.includes('얼음')) {
    if (Math.random() > 0.1 || move.type === '불') {
      update(side, activeIndex, (prev) => removeStatus(prev, '얼음'));
      addLog(`${activeTeam[activeIndex]}의 얼음이 녹았다!`)
      return { rate: currentRate, isHit: true };
    } else {
      addLog(`${activeTeam[activeIndex]}은/는 얼어있다!`)
      return { rate: currentRate, isHit: false };
    }
  } else if (status.includes('헤롱헤롱')) {
    if (Math.random() > 0.5) {
      return { rate: currentRate, isHit: true };
    } else {
      addLog(`${activeTeam[activeIndex]}은/는 헤롱헤롱해있다!`)
      return { rate: currentRate, isHit: false };
    }
  }
  return { rate: currentRate, isHit: true };
}