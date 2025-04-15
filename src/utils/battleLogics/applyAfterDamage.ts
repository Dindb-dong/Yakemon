// 데미지 계산 후의 함수. 
// 예를 들어, 기술의 부가 효과/특성의 부가효과/방어적 특성 효과/아이템의 부가효과 등을 적용시킴. 

import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { StatusState } from "../../models/Status";
import { addStatus, changeHp, changeRank } from "./updateBattlePokemon";
import { RankState } from "../../models/RankState";
import { applyStatusWithDuration } from "./applyStatusWithDuration";
import { applyConfusionStatus } from "./applyConfusionStatus";
import { switchPokemon } from "./switchPokemon";
import { calculateTypeEffectiveness } from "../typeRalation";
import { getBestSwitchIndex } from "./getBestSwitchIndex";


// 사용 주체, 내 포켓몬, 상대 포켓몬, 기술, 내 포켓몬의 남은 체력
export async function applyAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean) {

  await applyDefensiveAbilityEffectAfterDamage(side, attacker, deffender, usedMove, appliedDameage, watchMode);
  await applyMoveEffectAfterDamage(side, attacker, deffender, usedMove, appliedDameage, watchMode);
}

async function applyDefensiveAbilityEffectAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const demeritEffect = usedMove.demeritEffects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const opponentTeam = side === 'my' ? enemyTeam : myTeam;
  const ability = deffender.base.ability;
  ability?.defensive?.forEach((category: string) => {
    switch (category) {
      case "rank_change":
        if (ability.name === '증기기관' && (usedMove.type === '물' || usedMove.type === '불')) {
          if (deffender.currentHp > 0) {
            console.log(`${deffender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${deffender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'speed', 6));
          }
        } else if (ability.name === '깨어진갑옷' && usedMove.category === '물리') {
          if (deffender.currentHp > 0) {
            console.log(`${deffender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${deffender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'speed', 2));
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'defense', -1));
          }
        }
      case "status_change":
        if (ability.name === '불꽃몸' && usedMove.isTouch) {
          if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '화상'));
            addLog(`🥵 ${mineTeam[activeMine].base.name}은/는 화상상태가 되었다!`);
            console.log(`${mineTeam[activeMine].base.name}은/는 화상상태가 되었다!`);
          }
        }
        if (ability.name === '독가시' && usedMove.isTouch) {
          if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '독'));
            addLog(`🤢 ${mineTeam[activeMine].base.name}은/는 독상태가 되었다!`);
            console.log(`${mineTeam[activeMine].base.name}은/는 독상태가 되었다!`);
          }
        }
      default:
        return;
    }
  })

}

function applyOffensiveAbilityEffectAfrerDamage() {

}

async function applyMoveEffectAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const demeritEffect = usedMove.demeritEffects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const opponentTeam = side === 'my' ? enemyTeam : myTeam;
  const enemyPokemon = side === 'enemy' ? myTeam[activeMy] : enemyTeam[activeEnemy];

  let shouldWaitForSwitch = false;
  let switchPromise: Promise<void> | null = null;
  demeritEffect?.forEach((demerit) => {
    if (demerit && Math.random() < demerit.chance) {
      console.log(`${usedMove.name}의 디메리트 효과 발동!`)
      if (demerit?.recoil && appliedDameage) {
        // 반동 데미지 적용
        const recoilDamage = appliedDameage * demerit.recoil;
        updatePokemon(side, activeMine, (attacker) => changeHp(attacker, - recoilDamage));
        addLog(`🤕 ${attacker.base.name}은/는 반동 데미지를 입었다!`);
      }
      if (demerit.statChange) {
        demerit.statChange.forEach((statChange) => {
          const target = side === 'my' ? attacker : deffender; // 자기자신
          const stat = statChange.stat;
          const change = statChange.change;
          const activeTeam = side === 'my' ? myTeam : enemyTeam;
          const activeIndex = side === 'my' ? activeMy : activeEnemy;
          updatePokemon(side, activeIndex, (target) => changeRank(target, stat as keyof RankState, change))
          console.log(`${activeTeam[activeIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`);
          addLog(`🔃 ${activeTeam[activeIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`)
        });
      }
    }
  })
  if (attacker.base.ability?.name !== '우격다짐' && usedMove.target === 'opponent') { // 우격다짐일 때에는 부가효과 적용안함.
    effect?.forEach((effect) => {
      if (effect && Math.random() < effect.chance) {
        if (usedMove.name === '마지막일침' && deffender.currentHp === 0) {
          console.log(`${usedMove.name}의 부가효과 발동!`)
          updatePokemon(side, activeMine, (target) => changeRank(target, 'attack', 3))
          console.log(`${attacker.base.name}의 공격이 3랭크 변했다!`);
          addLog(`🔃 ${attacker.base.name}의 공격이 3랭크 변했다!`);
          return;
        }
        console.log(`${usedMove.name}의 부가효과 발동!`)
        if (effect.statChange) {
          effect.statChange.forEach((statChange) => {
            let targetSide: 'my' | 'enemy' = 'enemy'; // 누구의 랭크를 변화시킬건지 정함. 
            if (side === 'my' && statChange.target === 'opponent') {
              targetSide = 'enemy';
            } else if (side === 'my' && statChange.target === 'self') {
              targetSide = 'my';
            } else if (side === 'enemy' && statChange.target === 'opponent') {
              targetSide = 'my';
            } else if (side === 'enemy' && statChange.target === 'self') {
              targetSide = 'enemy';
            }
            const stat = statChange.stat;
            const change = statChange.change;
            const activeTeam = targetSide === 'my' ? myTeam : enemyTeam;
            const activeIndex = targetSide === 'my' ? activeMy : activeEnemy;
            updatePokemon(targetSide, activeIndex, (target) => changeRank(target, stat as keyof RankState, change))
            console.log(`${activeTeam[activeIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`);
            addLog(`🔃 ${activeTeam[activeIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`)
          });
        }
        if (effect.status) {
          // 상태이상 적용
          const status = effect.status;
          let noStatusCondition: boolean = false;
          if (status === '화상' && deffender.base.types.includes('불')) { noStatusCondition = true };
          if (status === '마비' && deffender.base.types.includes('전기')) { noStatusCondition = true };
          if (status === '얼음' && deffender.base.types.includes('얼음')) { noStatusCondition = true };
          if (status === '독' && (deffender.base.types.includes('독') || deffender.base.types.includes('강철'))) { noStatusCondition = true };
          if (status === '맹독' && (deffender.base.types.includes('독') || deffender.base.types.includes('강철'))) { noStatusCondition = true };
          if (status === '풀죽음' || status === '앵콜' || status === '잠듦') {
            applyStatusWithDuration(opponentSide, activeOpponent, status);
          } else if (status === '도발' || status === '헤롱헤롱' && !(deffender.base.ability?.name === '둔감')) {
            applyConfusionStatus(opponentSide, activeOpponent);
          } else if (status === '혼란' && !(deffender.base.ability?.name === '마이페이스')) {
            applyConfusionStatus(opponentSide, activeOpponent);
          } else {
            updatePokemon(opponentSide, activeOpponent, (prev) => addStatus(prev, status));
          }

          if (!noStatusCondition) {
            addLog(`🍄 ${opponentTeam[activeOpponent].base.name}은/는 ${status}상태가 되었다!`);
            console.log(`${opponentTeam[activeOpponent].base.name}은/는 ${status}상태가 되었다!`);
          }
        }
        if (effect.heal && appliedDameage && appliedDameage > 0) {
          const deal = appliedDameage;
          const healRate = effect.heal;
          updatePokemon(side, activeMine, (attacker) => changeHp(attacker, deal * healRate));
          addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
        }
        if (effect.heal && !appliedDameage) {
          // 반피 회복 로직 
          const healRate = effect.heal;
          updatePokemon(side, activeMine, (attacker) => changeHp(attacker, attacker.base.hp * healRate));
          addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
        }
      }
    })
  }
  if (usedMove.exile) {
    console.log('💨 강제 교체 발동!');
    const available = opponentTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeOpponent);

    if (available.length === 0) {
      console.log('📛 교체 가능한 포켓몬이 없습니다.');
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    await switchPokemon(opponentSide, random.index);
    addLog(`💨 ${opponentTeam[activeOpponent].base.name}은/는 강제 교체되었다!`);
  }
  if (usedMove.uTurn) {
    const { setSwitchRequest, clearSwitchRequest } = useBattleStore.getState();
    const availableIndexes = mineTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeMine); // 현재 포켓몬은 제외


    // ✅ 1마리만 남은 경우
    if (availableIndexes.length <= 1) {
      return;
    }
    if (watchMode) {
      console.log('관전 모드에서 유턴 사용');
      const switchIndex = getBestSwitchIndex(side); // 상성 기반 추천 교체
      // Promise 사용해서 교체 끝날 때까지 넘어가지 않기
      switchPromise = new Promise<void>(async (resolve) => {
        await switchPokemon(side, switchIndex);
        resolve();
      });

    } else if (side === 'my') {
      console.log('내가 유턴 사용');
      switchPromise = new Promise<void>((resolve) => {
        setSwitchRequest({
          side,
          reason: "uTurn",
          onSwitch: async (index: number) => {
            await switchPokemon(side, index);
            setSwitchRequest(null);
            clearSwitchRequest();
            resolve();
          },
        });
      });
      shouldWaitForSwitch = true;
    }
    else {
      // ✅ AI가 유턴 사용한 경우 자동 교체!
      console.log('ai가 유턴 사용');
      const switchIndex = getBestSwitchIndex(side);
      switchPromise = new Promise<void>(async (resolve) => {
        await switchPokemon(side, switchIndex);
        resolve();
      });
    }

  }

  if (shouldWaitForSwitch && switchPromise) {
    console.log('유턴 로직 실행중...2');
    await switchPromise;
    console.log('유턴 로직 실행중...5 (완료)');
  }
  return;
}