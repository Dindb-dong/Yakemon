import { useBattleStore } from "../../Context/useBattleStore";
import { decrementDisableTun, decrementYawnTurn, useDurationStore } from "../../Context/useDurationContext";
import { RankState } from "../../models/RankState";
import { StatusState } from "../../models/Status";
import { applyStatusConditionDamage } from "./applyNoneMoveDamage";
import { mainStatusCondition } from "./switchPokemon";
import { addStatus, changeHp, changeRank, removeStatus, resetState, setLockedMove } from "./updateBattlePokemon";
import { setField, setScreen, setWeather } from "./updateEnvironment";

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
    myEnv,
    enemyEnv
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

  // === 상태이상, 날씨데미지 효과 처리 ===
  [myActive, enemyActive].forEach(async (pokemon, i) => {
    const side = i === 0 ? "my" : "enemy";
    const opponentSide = i === 0 ? "enemy" : "my";
    const activeIndex = i === 0 ? activeMy : activeEnemy;
    const team = i === 0 ? myTeam : enemyTeam;
    const opponentTeam = i === 0 ? enemyTeam : myTeam;
    const activeOpponent = i === 0 ? activeEnemy : activeMy;
    // 이렇게 효율적으로 처리할 수도 있구만! 
    for (const status of ["화상", "맹독", "독", "조이기"] as const) {
      if (pokemon.status.includes(status)) {
        const { updated } = await applyStatusConditionDamage(pokemon, status);
        updatePokemon(side, activeIndex, (prev) => updated);
      }
    }
    if (pokemon.status.includes("씨뿌리기")) {
      if (!(pokemon.base.ability?.name === '매직가드')) {
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
    }
    if (publicEnv.weather === '모래바람') {
      const immuneAbilities = ['모래숨기', '모래의힘'];
      const immuneTypes = ['바위', '땅', '강철'];
      const hasImmunity =
        (pokemon.base.ability && immuneAbilities.includes(pokemon.base.ability.name)) ||
        pokemon.base.types.some((type) => immuneTypes.includes(type));

      if (!hasImmunity) {
        const damage = Math.floor(pokemon.base.hp / 16);
        updatePokemon(side, activeIndex, (prev) => changeHp(prev, -damage));
        addLog(`🌪️ ${pokemon.base.name}은 모래바람에 의해 피해를 입었다!`);
      }
    }
  });

  // === 지속형 효과 턴 감소 처리 ===
  const expired = decrementTurns();

  ["my", "enemy"].forEach((side, i) => {
    const active = i === 0 ? activeMy : activeEnemy;
    expired[side as "my" | "enemy"].forEach((effectName) => {
      updatePokemon(side as "my" | "enemy", active, (p) => removeStatus(p, effectName as StatusState));
      addLog(`🏋️‍♂️ ${side === "my" ? "내" : "상대"} 포켓몬의 ${effectName} 상태가 해제되었다!`);
    });
  });

  if (publicEnv.weather && expired.public.includes(publicEnv.weather)) {
    setWeather(null);
    addLog(`날씨(${publicEnv.weather})의 효과가 사라졌다!`);
  }

  if (publicEnv.field && expired.public.includes(publicEnv.field)) {
    setField(null);
    addLog(`필드(${publicEnv.field})의 효과가 사라졌다!`);
  }
  // 리플렉터 등 없애기 
  if (myEnv.screen && expired.myEnv.includes(myEnv.screen)) {
    setScreen('my', null);
    addLog(`내 필드의 ${myEnv.screen}이/가 사라졌다!`);
    console.log(`내 필드의 ${myEnv.screen}이/가 사라졌다!`);
  }
  if (enemyEnv.screen && expired.enemyEnv.includes(enemyEnv.screen)) {
    setScreen('enemy', null);
    addLog(`상대 필드의 ${myEnv.screen}이/가 사라졌다!`);
    console.log(`상대 필드의 ${myEnv.screen}이/가 사라졌다!`);
  }

  // 포켓몬 특성 효과 처리 
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
    if (pokemon.base.ability?.name === "아이스바디" && publicEnv.weather === '싸라기눈') {
      updatePokemon(side, activeIndex, (prev) => changeHp(prev, prev.base.hp * 1 / 16));
      addLog(`➕ ${pokemon.base.name}은 아이스바디로 체력을 회복했다!`);
    }
    if (pokemon.base.ability?.name === '가속') {
      updatePokemon(side, activeIndex, (prev) => changeRank(prev, 'speed', 1));
      addLog(`🦅 ${pokemon.base.name}의 가속 특성 발동!`);
    }
    if (pokemon.base.ability?.name === '변덕쟁이') {
      const getRandomStat = () => {
        const statList = ['attack', 'spAttack', 'defense', 'spDefense', 'speed'];
        return statList[Math.floor(Math.random() * 5)] as keyof RankState;
      }
      updatePokemon(side, activeIndex, (prev) => changeRank(prev, getRandomStat(), 2));
      updatePokemon(side, activeIndex, (prev) => changeRank(prev, getRandomStat(), -1));
      addLog(`🦅 ${pokemon.base.name}의 변덕쟁이 특성 발동!`);
    }
    if (pokemon.base.ability?.name === '선파워' && publicEnv.weather === '쾌청') {
      const damage = Math.floor(pokemon.base.hp / 16);
      updatePokemon(side, activeIndex, (prev) => changeHp(prev, -damage));
      addLog(`🦅 ${pokemon.base.name}의 선파워 특성 발동!`);
    }
    if (pokemon.base.ability?.name === '탈피' && pokemon.status.some((s) => mainStatusCondition.includes(s))) {
      pokemon.status.forEach((s) => mainStatusCondition.includes(s) ?
        updatePokemon(side, activeIndex, (prev) => removeStatus(prev, s)) : {}
      )
      addLog(`🦅 ${pokemon.base.name}의 탈피 특성 발동!`);
    }
  })

  // == resetState == //
  const actives = [activeMy, activeEnemy];
  ["my", "enemy"].forEach((side, i) => {
    const team = side === 'my' ? myTeam : enemyTeam;
    updatePokemon(side as "my" | "enemy", actives[i], (prev) => resetState(prev));
    if (team[actives[i]].lockedMove && team[actives[i]].lockedMoveTurn === 0) {
      // 이제 고정 기술 다 썼으니 고정해제하고 혼란처리
      updatePokemon(side as "my" | "enemy", actives[i], (prev) => setLockedMove(prev, null));
      console.log(`${team[actives[i]].base.name}은 지쳐서 혼란에 빠졌다..!`);
      addLog(`${team[actives[i]].base.name}은 지쳐서 혼란에 빠졌다..!`);
      addStatus(team[actives[i]], '혼란', side as ('my' | 'enemy'));
    }
  });

  return;
}