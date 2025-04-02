import { useBattleStore } from "../../Context/useBattleStore";
import { StatusState } from "../../models/Status";
import { applyAppearance } from "./applyAppearance";
import { applyTrapDamage } from "./applyNoneMoveDamage";
import { addStatus, resetRank, setActive } from "./updateBattlePokemon";
import { removeAura, removeDisaster, removeTrap } from "./updateEnvironment";

export function switchPokemon(side: "my" | "enemy", newIndex: number) {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    updatePokemon,
    setActiveMy,
    setActiveEnemy,
    myEnv,
    enemyEnv,
    addLog,
  } = useBattleStore.getState();

  const team = side === "my" ? myTeam : enemyTeam;
  const currentIndex = side === "my" ? activeMy : activeEnemy;
  const env = side === "my" ? myEnv : enemyEnv;
  const switchingPokemon = team[currentIndex]; // 현재 교체하고자 하는 포켓몬
  let next = team[newIndex];
  // 3. 새 포켓몬 활성화
  updatePokemon(side, newIndex, (newPokemon) => setActive(newPokemon, true));

  // 1. 현재 포켓몬 비활성화
  updatePokemon(side, currentIndex, (switchingPokemon) => setActive(switchingPokemon, false));
  // 재앙 제거 
  if (String(switchingPokemon.base.ability?.appear?.includes('disaster'))) {
    removeDisaster(String(switchingPokemon.base.ability?.name));
  }
  // 오라 제거
  if (String(switchingPokemon.base.ability?.appear?.includes('aura_change'))) {
    removeAura(String(switchingPokemon.base.ability?.name));
  }

  // 2. 랭크업 초기화
  updatePokemon(side, currentIndex, (switchingPokemon) => resetRank(switchingPokemon))

  if (side === "my") {
    setActiveMy(newIndex);
  } else {
    setActiveEnemy(newIndex);
  }

  // 4. 트랩 데미지 적용
  const { updated: trapped, log: trapLog, status_condition: trapCondition } = applyTrapDamage(next, env.trap);
  updatePokemon(side, newIndex, (prev) => trapped);
  // 독압정 등일 경우 상태이상 적용
  if (trapCondition) {
    if (trapCondition === '독압정 제거') {
      removeTrap(side, '독압정')
    }
    updatePokemon(side, newIndex, (prev) => addStatus(prev, trapCondition as StatusState))
  }
  if (trapLog) addLog(trapLog);
  next = trapped;

  // 5. 등장 특성 적용
  const logs = applyAppearance(next, side);
  logs.forEach(addLog);
  const wncp = side === 'my' ? '나' : '상대';
  console.log(wncp + '는 ' + next.base.name + '을/를 내보냈다!');
  addLog(wncp + '는 ' + next.base.name + '을/를 내보냈다!')
}