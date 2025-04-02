import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { changeHp } from "./updateBattlePokemon";
import { setField, setWeather } from "./updateEnvironment";

// 매 턴 종료 시 적용할 모든 효과를 통합적으로 처리
export function applyEndTurnEffects() {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    updatePokemon,
    addLog,
    publicEnv,
  } = useBattleStore.getState();

  const { publicEffects, decrementTurns } = useDurationStore.getState();

  const myActive = myTeam[activeMy]; // 내 포켓몬 
  const enemyActive = enemyTeam[activeEnemy]; // 상대 포켓몬 

  // === 상태이상 효과 처리 ===
  [myActive, enemyActive].forEach((pokemon, i) => {
    const side = i === 0 ? "my" : "enemy";
    // 이렇게 효율적으로 처리할 수도 있구만! 
    if (pokemon.status.includes("화상")) {
      const damage = Math.floor(pokemon.base.hp / 16);
      const updated = changeHp(pokemon, -damage);
      updatePokemon(side, i === 0 ? activeMy : activeEnemy, updated);
      addLog(`${pokemon.base.name}은 화상으로 ${damage}의 데미지를 입었다!`);
    }

    if (pokemon.status.includes("맹독")) {
      const damage = Math.floor(pokemon.base.hp / 8);
      const updated = changeHp(pokemon, -damage);
      updatePokemon(side, i === 0 ? activeMy : activeEnemy, updated);
      addLog(`${pokemon.base.name}은 독의 피해를 입었다!`);
    }
  });

  // === 지속형 효과 턴 감소 처리 ===
  const expired = decrementTurns();

  if (publicEnv.weather && expired.public.includes(publicEnv.weather)) {
    setWeather(null);
    addLog(`날씨(${publicEnv.weather})의 효과가 사라졌다!`);
  }

  if (publicEnv.field && expired.public.includes(publicEnv.field)) {
    setField(null);
    addLog(`필드(${publicEnv.field})의 효과가 사라졌다!`);
  }

  // ⏳ TODO:
  // - 날씨 데미지 (모래바람 등)
  // - 유틸 특성 효과 (포이즌힐 등)
  // - 아이템 효과 (먹다남은 음식 등)
}