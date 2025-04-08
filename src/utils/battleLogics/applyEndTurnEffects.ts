import { useBattleStore } from "../../Context/useBattleStore";
import { useDurationStore } from "../../Context/useDurationContext";
import { StatusState } from "../../models/Status";
import { changeHp, changeRank, removeStatus } from "./updateBattlePokemon";
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

  // === 필드 효과 ===
  [myActive, enemyActive].forEach((pokemon, i) => {
    const side = i === 0 ? "my" : "enemy";
    if (publicEnv.field === '그래스필드') {
      console.log('그래스필드 효과 적용 시작')
      if (!(pokemon.base.types.includes('비행')) && (pokemon.position !== '하늘') && pokemon.currentHp > 0) { // 떠있지 않으면 회복 
        const heal = Math.floor(pokemon.base.hp / 16);
        const healed = (prev: any) => changeHp(prev, heal);
        updatePokemon(side, i === 0 ? activeMy : activeEnemy, healed);
        addLog(`➕ ${pokemon.base.name}은/는 그래스필드로 회복했다!`);
        console.log(`${pokemon.base.name}은/는 그래스필드로 회복했다!`);
      }
    }
  });

  // === 상태이상 효과 처리 ===
  [myActive, enemyActive].forEach((pokemon, i) => {
    const side = i === 0 ? "my" : "enemy";
    const opponentSide = i === 0 ? "enemy" : "my";
    const activeIndex = i === 0 ? activeMy : activeEnemy;
    const team = i === 0 ? myTeam : enemyTeam;
    const opponentTeam = i === 0 ? enemyTeam : myTeam;
    const activeOpponent = i === 0 ? activeEnemy : activeMy;
    // 이렇게 효율적으로 처리할 수도 있구만! 
    if (pokemon.status.includes("화상")) {
      const damage = Math.floor(pokemon.base.hp / 16);
      const updated = (pokemon) => changeHp(pokemon, -damage);
      updatePokemon(side, i === 0 ? activeMy : activeEnemy, updated);
      addLog(`🔥 ${pokemon.base.name}은 화상으로 ${damage}의 데미지를 입었다!`);
    }
    if (pokemon.status.includes("맹독")) {
      const damage = Math.floor(pokemon.base.hp / 6);
      const updated = (pokemon) => changeHp(pokemon, -damage);
      updatePokemon(side, i === 0 ? activeMy : activeEnemy, updated);
      addLog(`🍄 ${pokemon.base.name}은 맹독의 피해를 입었다!`);
      console.log(`${pokemon.base.name}은 맹독의 피해를 입었다!`);
    }
    if (pokemon.status.includes("독")) {
      const damage = Math.floor(pokemon.base.hp / 8);
      const updated = (pokemon) => changeHp(pokemon, -damage);
      updatePokemon(side, activeIndex, updated);
      addLog(`🍄 ${pokemon.base.name}은 독의 피해를 입었다!`);
      console.log(`${pokemon.base.name}은 독의 피해를 입었다!`);
    }
    if (pokemon.status.includes("씨뿌리기")) {
      const damage = Math.floor(pokemon.base.hp / 8);
      const damaged = (prev) => changeHp(prev, -damage);
      const healed = (prev) => changeHp(prev, damage);
      updatePokemon(side, activeIndex, damaged);
      if (opponentTeam[activeOpponent].currentHp > 0) {
        updatePokemon(opponentSide, activeOpponent, healed);
      }
      addLog(`🌱 ${opponentTeam[activeOpponent].base.name}은 씨뿌리기로 회복했다!`);
      addLog(`🌱 ${pokemon.base.name}은 씨뿌리기의 피해를 입었다!`);
      console.log(`${pokemon.base.name}은 씨뿌리기의 피해를 입었다!`);
    }
  });

  // === 지속형 효과 턴 감소 처리 ===
  const expired = decrementTurns();

  // ✅ [NEW] '풀죽음', '앵콜', '도발' 등 my/enemy 쪽 효과 만료 처리
  expired.my.forEach((effectName) => {
    updatePokemon("my", activeMy, (p) => removeStatus(p, effectName as StatusState));
    addLog(`🏋️‍♂️ 내 포켓몬의 ${effectName} 상태가 해제되었다!`);
  });

  expired.enemy.forEach((effectName) => {
    updatePokemon("enemy", activeEnemy, (p) => removeStatus(p, effectName as StatusState));
    addLog(`🏋️‍♂️ 상대 포켓몬의 ${effectName} 상태가 해제되었다!`);
  });

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
  [myActive, enemyActive].forEach((pokemon, i) => {
    const side = i === 0 ? "my" : "enemy";
    const opponentSide = i === 0 ? "enemy" : "my";
    const activeIndex = i === 0 ? activeMy : activeEnemy;
    if (pokemon.base.ability?.name === "포이즌힐") {
      if (pokemon.status.includes("독")) {
        updatePokemon(side, activeIndex, (prev) => changeHp(prev, prev.base.hp * 3 / 16));
        addLog(`➕ ${pokemon.base.name}은 포이즌힐로 체력을 회복했다!`);
      } else if (pokemon.status.includes("맹독")) {
        updatePokemon(side, activeIndex, (prev) => changeHp(prev, prev.base.hp * 22 / 96));
        addLog(`➕ ${pokemon.base.name}은 포이즌힐로 체력을 회복했다!`);
      }
    }
    if (pokemon.base.ability?.name === '가속') {
      updatePokemon(side, activeIndex, (prev) => changeRank(prev, 'speed', 1));
      addLog(`🦅 ${pokemon.base.name}의 가속 특성 발동!`);
    }
  })
  return;
}