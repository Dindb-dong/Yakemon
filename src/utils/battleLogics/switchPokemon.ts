import { useBattleStore } from "../../Context/useBattleStore";
import { transferDurationEffects, useDurationStore } from "../../Context/useDurationContext";
import { StatusState } from "../../models/Status";
import { applyAppearance } from "./applyAppearance";
import { applyTrapDamage } from "./applyNoneMoveDamage";
import { getBestSwitchIndex } from "./getBestSwitchIndex";
import { addStatus, changeHp, changeRank, removeStatus, resetRank, resetState, setActive } from "./updateBattlePokemon";
import { removeAura, removeDisaster, removeTrap } from "./updateEnvironment";

export const unMainStatusCondition = ['헤롱헤롱', '씨뿌리기']; // 비주요 상태이상
export const unMainStatusConditionWithDuration = ['도발', '트집', '사슬묶기', '회복봉인', '앵콜', '소리기술사용불가', '하품', '혼란', '교체불가', '조이기', '멸망의노래', '풀죽음'] as const; // 비주요 상태이상
export const mainStatusCondition = ['화상', '마비', '잠듦', '얼음', '독', '맹독']; // 주요 상태이상
export async function switchPokemon(side: "my" | "enemy", newIndex: number, batonTouch?: boolean) {
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
  const { removeEffect } = useDurationStore.getState();
  const team = side === "my" ? myTeam : enemyTeam;
  const currentIndex = side === "my" ? activeMy : activeEnemy;
  const env = side === "my" ? myEnv : enemyEnv;
  const switchingPokemon = team[currentIndex]; // 현재 교체하고자 하는 포켓몬
  let next = team[newIndex];

  if (newIndex === -1) {
    console.log(`${side}는 더 이상 낼 포켓몬이 없음`);
    addLog(`${side}는 더 이상 낼 포켓몬이 없음`);
    return;
  }

  if (switchingPokemon.base.ability?.name === '재생력' && switchingPokemon.currentHp > 0) {
    console.log('재생력 발동!');
    updatePokemon(side, currentIndex, (switchingPokemon) => changeHp(switchingPokemon, switchingPokemon.base.hp / 3));
  }
  // 0. 배턴터치 처리
  if (batonTouch) {
    updatePokemon(side, newIndex, (switchingPokemon) => ({ ...switchingPokemon, rank: team[currentIndex].rank }));
    updatePokemon(side, newIndex, (switchingPokemon) => ({ ...switchingPokemon, substitute: team[currentIndex].substitute }));
    updatePokemon(side, newIndex, (switchingPokemon) => ({
      ...switchingPokemon, status:
        team[currentIndex].status.filter((s) => unMainStatusCondition.includes(s)).concat(
          team[currentIndex].status.filter((s): s is typeof unMainStatusConditionWithDuration[number] => unMainStatusConditionWithDuration.includes(s as typeof unMainStatusConditionWithDuration[number])))
    }));
    transferDurationEffects(side, currentIndex, newIndex);
  }

  // 1. 랭크업 초기화, 상태이상 제거 
  console.log('1. 랭크업 초기화 ')
  updatePokemon(side, currentIndex, (switchingPokemon) => resetState(switchingPokemon, true))
  updatePokemon(side, currentIndex, (switchingPokemon) => resetRank(switchingPokemon))
  updatePokemon(side, currentIndex, (prev) => ({
    ...prev, isFirstTurn: false
  }));

  // 비메이저 상태이상 제거
  for (const status of unMainStatusCondition) {
    if (team[currentIndex].status.includes(status as StatusState)) {
      updatePokemon(side, currentIndex, (switchingPokemon) => removeStatus(switchingPokemon, status as StatusState));
    }
  }
  for (const status of unMainStatusConditionWithDuration) {
    if (team[currentIndex].status.includes(status as StatusState)) {
      removeEffect(side, status as StatusState);
      updatePokemon(side, currentIndex, (switchingPokemon) => removeStatus(switchingPokemon, status as StatusState));
    }
  }
  if (switchingPokemon.base.ability?.name === '자연회복') {
    for (const status of unMainStatusCondition) {
      if (team[currentIndex].status.includes(status as StatusState)) {
        updatePokemon(side, currentIndex, (switchingPokemon) => removeStatus(switchingPokemon, status as StatusState));
      }
    }
    for (const status of unMainStatusConditionWithDuration) {
      if (team[currentIndex].status.includes(status as StatusState)) {
        removeEffect(side, status as StatusState);
        updatePokemon(side, currentIndex, (switchingPokemon) => removeStatus(switchingPokemon, status as StatusState));
      }
    }
    for (const status of mainStatusCondition) {
      if (team[currentIndex].status.includes(status as StatusState)) {
        updatePokemon(side, currentIndex, (switchingPokemon) => removeStatus(switchingPokemon, status as StatusState));
      }
    }
  }

  // 2. 현재 포켓몬 비활성화
  console.log('2. 현재 포켓몬 비활성화')
  updatePokemon(side, currentIndex, (switchingPokemon) => setActive(switchingPokemon, false));
  // 재앙 제거 
  if (String(switchingPokemon.base.ability?.appear?.includes('disaster'))) {
    removeDisaster(String(switchingPokemon.base.ability?.name));
  }
  // 오라 제거
  if (String(switchingPokemon.base.ability?.appear?.includes('aura_change'))) {
    removeAura(String(switchingPokemon.base.ability?.name));
  }

  // 3. 새 포켓몬 활성화
  console.log('3. 새 포켓몬 활성화')
  updatePokemon(side, newIndex, (newPokemon) => setActive(newPokemon, true));
  updatePokemon(side, newIndex, (prev) => ({
    ...prev, isFirstTurn: true
  }));

  if (side === "my") {
    setActiveMy(newIndex);
  } else {
    setActiveEnemy(newIndex);
  }

  // 4. 트랩 데미지 적용
  console.log('4. 트랩 데미지 적용')
  if (env.trap.length > 0) {
    const { updated: trapped, log: trapLog, status_condition: trapCondition } = await applyTrapDamage(next, env.trap);
    updatePokemon(side, newIndex, (prev) => trapped);
    // 독압정 등일 경우 상태이상 적용
    if (trapCondition) {
      console.log('트랩 효과 적용')
      if (trapCondition === '독압정 제거') {
        console.log('독압정 제거됨')
        removeTrap(side, '독압정')
        removeTrap(side, '맹독압정')
      } else if (trapCondition === '끈적끈적네트') {
        updatePokemon(side, newIndex, (prev) => changeRank(prev, 'speed', -1));
      } else {
        updatePokemon(side, newIndex, (prev) => addStatus(prev, trapCondition as StatusState, side))
      }
    }
    if (trapLog) addLog(trapLog); console.log(trapLog);
    next = trapped;
  }
  if (next.currentHp <= 0 && side === 'enemy') {
    // 관전모드 아니고 ai 포켓몬이 쓰러졌을 경우 (스텔스록 밟고 기절 등)
    console.log('ai 포켓몬이 등장하자마자 쓰러져서 교체')
    const switchIndex = getBestSwitchIndex(side);
    await switchPokemon(side, switchIndex);
  } else {
    // 5. 등장 특성 적용
    console.log('5. 등장 특성 적용')
    const wncp = side === 'my' ? '나' : '상대';
    console.log(wncp + '는 ' + team[newIndex].base.name + '을/를 내보냈다!');
    addLog(wncp + '는 ' + team[newIndex].base.name + '을/를 내보냈다!');
    applyAppearance(next, side);
  }
  return;
}