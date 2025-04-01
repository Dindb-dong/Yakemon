import { useBattleStore } from "../../Context/useBattleStore";
import { changeHp, addStatus } from "./updateBattlePokemon";

// 매 턴 종료 시 적용할 모든 효과를 통합적으로 처리
export function applyEndTurnEffects() {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    updatePokemon,
    addLog,
  } = useBattleStore.getState();

  const myActive = myTeam[activeMy];
  const enemyActive = enemyTeam[activeEnemy];

  // === 상태이상 효과 처리 ===
  [myActive, enemyActive].forEach((pokemon, i) => {
    if (pokemon.status.includes("화상")) {
      const damage = Math.floor(pokemon.base.hp / 16);
      const updated = changeHp(pokemon, -damage);
      const side = i === 0 ? "my" : "enemy";
      updatePokemon(side, i === 0 ? activeMy : activeEnemy, updated);
      addLog(`${pokemon.base.name}은 화상으로 ${damage}의 데미지를 입었다!`);
    }

    if (pokemon.status.includes("맹독")) {
      // TODO: 독 카운트 저장 후 점점 증가하는 피해 계산
      const damage = Math.floor(pokemon.base.hp / 8);
      const updated = changeHp(pokemon, -damage);
      const side = i === 0 ? "my" : "enemy";
      updatePokemon(side, i === 0 ? activeMy : activeEnemy, updated);
      addLog(`${pokemon.base.name}은 독의 피해를 입었다!`);
    }

    // 잠듦, 얼음 등은 별도 처리 안함 (확률 기반 행동안됨 처리에서)
  });

  // === 유틸 특성 처리 ===
  // 예: 포이즌힐, 젖은접시, 건조피부, 재생력 등 (향후 확장)

  // === 날씨 효과 처리 ===
  // 예: 모래바람 데미지, 햇살 회복 등 (추가 필요)

  // === 필드 효과 처리 ===
  // 예: 사이코필드에서 기술 무효화 등 (추가 필요)

  // === 아이템 효과 처리 ===
  // 예: 먹다남은음식 회복 등 (추가 필요)
}