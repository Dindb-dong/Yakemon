import { useBattleStore } from "../../Context/useBattleStore";
import { applyAppearance } from "./applyAppearance";
import { applyTrapDamage } from "./applyTrapDamage";
import { setActive } from "./updateBattlePokemon";


export function switchPokemon(side: "my" | "enemy", newIndex: number) {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    updatePokemon,
    setActiveMy,
    setActiveEnemy,
    env,
    setEnvironment,
    addLog,
  } = useBattleStore.getState();

  const team = side === "my" ? myTeam : enemyTeam;
  const currentIndex = side === "my" ? activeMy : activeEnemy;

  const current = setActive(team[currentIndex], false);
  let next = setActive(team[newIndex], true);

  // 1. 교체 반영
  updatePokemon(side, currentIndex, current);
  updatePokemon(side, newIndex, next);
  if (side === "my") setActiveMy(newIndex);
  else setActiveEnemy(newIndex);

  // 2. 트랩 데미지
  const { updated: trapped, log: trapLog } = applyTrapDamage(next, env.trap);
  updatePokemon(side, newIndex, trapped);
  if (trapLog) addLog(trapLog);
  next = trapped;

  // 3. 등장 특성 발동
  const { updatedEnv, log: appearLog } = applyAppearance(next, env);
  setEnvironment(updatedEnv);
  if (appearLog) addLog(appearLog);
}