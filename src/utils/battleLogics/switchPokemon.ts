import { useBattleStore } from "../../Context/useBattleStore";
import { applyAppearance } from "./applyAppearance";
import { applyTrapDamage } from "./applyTrapDamage";
import { setActive } from "./updateBattlePokemon";
import { removeAura, removeDisaster } from "./updateEnvironment";

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
  const switchingPokemon = team[currentIndex];

  // 1. 현재 포켓몬 비활성화
  updatePokemon(side, currentIndex, setActive(switchingPokemon, false));
  // 재앙 제거 
  if (String(switchingPokemon.base.ability?.appear?.includes('disaster'))) {
    removeDisaster(String(switchingPokemon.base.ability?.name));
  }
  // 오라 제거
  if (String(switchingPokemon.base.ability?.appear?.includes('aura_change'))) {
    removeAura(String(switchingPokemon.base.ability?.name));
  }

  // 2. 새 포켓몬 활성화
  let next = setActive(team[newIndex], true);
  updatePokemon(side, newIndex, next);

  if (side === "my") setActiveMy(newIndex);
  else setActiveEnemy(newIndex);

  // 3. 트랩 데미지
  const { updated: trapped, log: trapLog } = applyTrapDamage(next, env.trap);
  updatePokemon(side, newIndex, trapped);
  if (trapLog) addLog(trapLog);
  next = trapped;

  // 4. 등장 특성 적용
  const logs = applyAppearance(next, side);
  logs.forEach(addLog);
}