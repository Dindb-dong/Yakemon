// 데미지 계산 후의 함수. 
// 예를 들어, 기술의 부가 효과/특성의 부가효과/방어적 특성 효과/아이템의 부가효과 등을 적용시킴. 

import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { addStatus, changeHp, changeRank, setTypes } from "./updateBattlePokemon";
import { RankState } from "../../models/RankState";
import { switchPokemon } from "./switchPokemon";
import { getBestSwitchIndex } from "./getBestSwitchIndex";
import { calculateRankEffect } from "./rankEffect";
import { applyRecoilDamage } from "./applyNoneMoveDamage";
import { delay } from "../delay"; // await delay(1500) -> 1.5초 기다리게 해주는 유틸함수
import { setWeather } from "./updateEnvironment";

async function applyPanicUturn(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean, multiHit?: boolean) {
  // 여기에 들어오는 side는 기술 쓴 쪽의 opponentSide임. 즉, 원본 handleMove에서 side에 my가 넘어갔으면 
  // 여기 side에는 enemy가 오는것.
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    setSwitchRequest,
    clearSwitchRequest
  } = useBattleStore.getState();
  const team = side === "my" ? myTeam : enemyTeam;
  const active = side === "my" ? activeMy : activeEnemy;

  defender = team[active];
  if (
    defender.base.ability?.name === "위기회피" &&
    defender.currentHp > 0 &&
    (defender.currentHp <= defender.base.hp / 2)
  ) {
    console.log(`🛡️ ${defender.base.name}의 특성 '위기회피' 발동!`);


    const availableIndexes = team
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== active);

    if (availableIndexes.length === 0) {
      console.log("⚠️ 위기회피 가능 포켓몬 없음 (교체 생략)");
      return;
    }

    let switchPromise: Promise<void> | null = null;

    if (watchMode || side === "enemy") {
      console.log("👀 AI: 위기회피 자동 교체");
      const switchIndex = getBestSwitchIndex(side);
      switchPromise = new Promise<void>(async (resolve) => {
        await switchPokemon(side, switchIndex);
        resolve();
      });
    } else if (side === "my") {
      console.log("🎮 플레이어: 위기회피 수동 교체 요청");
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
    }

    if (switchPromise) {
      await switchPromise;
    }
  }
}

// 사용 주체, 내 포켓몬, 상대 포켓몬, 기술, 내 포켓몬의 남은 체력
export async function applyAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean, multiHit?: boolean) {
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  await applyDefensiveAbilityEffectAfterDamage(side, attacker, defender, usedMove, appliedDameage, watchMode, multiHit);
  await applyOffensiveAbilityEffectAfrerDamage(side, attacker, defender, usedMove, appliedDameage, watchMode, multiHit);
  await applyMoveEffectAfterDamage(side, attacker, defender, usedMove, appliedDameage, watchMode, multiHit);
  await applyPanicUturn(opponentSide, attacker, defender, usedMove, appliedDameage, watchMode, multiHit);

}

export async function applyMoveEffectAfterMultiDamage(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const demeritEffect = usedMove.demeritEffects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const mirroredTeam = side === 'my' ? enemyTeam : myTeam;
  const enemyPokemon = side === 'enemy' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const batonTouch = usedMove.name === '배턴터치' ? true : false;
  const nullification = attacker.base.ability?.name === '부식' ? true : false;
  if (usedMove.cannotMove) {
    updatePokemon(side, activeMine, (prev) => ({
      ...prev,
      cannotMove: true
    }));
    console.log(`💥 ${attacker.base.name}은 피로로 인해 다음 턴 움직일 수 없다!`);
    addLog(`💥 ${attacker.base.name}은 피로로 인해 다음 턴 움직일 수 없다!`);
  }
  let shouldWaitForSwitch = false;
  let switchPromise: Promise<void> | null = null;
  if (usedMove.uTurn && !attacker.status.includes('교체불가')) {
    console.log('유턴 기술 사용!')

    const availableOpponent = mirroredTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeOpponent);
    if (side === 'my' && availableOpponent.length === 0 && enemyPokemon.currentHp === 0) {
      console.log('내가 유턴으로 게임을 끝냄!');
      return;
    }
    if (side === 'enemy' && availableOpponent.length === 0 && enemyPokemon.currentHp === 0) {
      console.log('상대가 유턴으로 게임을 끝냄!');
      return;
    }
    const { setSwitchRequest, clearSwitchRequest } = useBattleStore.getState();
    const availableIndexes = mineTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeMine); // 현재 포켓몬은 제외

    console.log(availableIndexes);
    // 1마리만 남은 경우는 실행안함
    if (availableIndexes.length != 0) {
      if (watchMode) {
        console.log('관전 모드에서 유턴 사용');
        const switchIndex = getBestSwitchIndex(side); // 상성 기반 추천 교체
        // Promise 사용해서 교체 끝날 때까지 넘어가지 않기
        switchPromise = new Promise<void>(async (resolve) => {
          await switchPokemon(side, switchIndex, batonTouch);
          resolve();
        });

      } else if (side === 'my') {
        console.log('내가 유턴 사용');
        switchPromise = new Promise<void>((resolve) => {
          setSwitchRequest({
            side,
            reason: "uTurn",
            onSwitch: async (index: number) => {
              await switchPokemon(side, index, batonTouch);
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
        await delay(1500);
        const switchIndex = getBestSwitchIndex(side);
        switchPromise = new Promise<void>(async (resolve) => {
          await switchPokemon(side, switchIndex, batonTouch);
          resolve();
        });
      }
    }
  }

  if (shouldWaitForSwitch && switchPromise) {
    console.log('유턴 로직 실행중...2');
    await switchPromise;
    console.log('유턴 로직 실행중...5 (완료)');
  }
  if (usedMove.selfKill) { // 대폭발, 자폭, 추억의선물, 목숨걸기
    updatePokemon(side, activeMine, (attacker) => changeHp(attacker, -attacker.base.hp));
    addLog(`🤕 ${attacker.base.name}은/는 반동으로 기절했다...!`);
    console.log(`🤕 ${attacker.base.name}은/는 반동으로 기절했다...!`);
  }
  demeritEffect?.forEach(async (demerit) => {
    if (demerit && Math.random() < demerit.chance) {
      console.log(`${usedMove.name}의 디메리트 효과 발동!`)
      if (demerit?.recoil && appliedDameage) {
        // 반동 데미지 적용
        const { updated: updatedAttacker } = await applyRecoilDamage(attacker, (demerit.recoil ?? 0), appliedDameage);
        updatePokemon(side, activeMine, (attacker) => updatedAttacker);
      }
      if (demerit.statChange) {
        demerit.statChange.forEach((statChange) => {
          const target = side === 'my' ? attacker : defender; // 자기자신
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
    let roll: number = Math.random();
    if (attacker.base.ability?.name === '하늘의은총') {
      roll *= 2;
    }
    effect?.forEach((effect) => {
      if (defender.base.ability?.name === '매직미러' && usedMove.category === '변화') {
        console.log(`${defender.base.name}의 매직미러 발동!`);
        addLog(`🔁 ${defender.base.name}의 매직미러 발동!`);

        // 공격자 쪽 정보 설정
        const mirrorTargetSide = side; // 공격자 쪽
        const mirrorTargetIndex = activeMine;
        const mirrorTargetTeam = side === 'my' ? myTeam : enemyTeam;

        // 각 효과를 반사해서 적용
        if (effect.status) {
          updatePokemon(mirrorTargetSide, mirrorTargetIndex, (target) =>
            addStatus(target, effect.status!, mirrorTargetSide)
          );
          addLog(`🪞 ${mirrorTargetTeam[mirrorTargetIndex].base.name}은/는 ${effect.status} 상태가 되었다!`);
        }

        if (effect.statChange) {
          effect.statChange.forEach((sc) => {
            updatePokemon(mirrorTargetSide, mirrorTargetIndex, (target) =>
              changeRank(target, sc.stat as keyof RankState, sc.change)
            );
            addLog(`🪞 ${mirrorTargetTeam[mirrorTargetIndex].base.name}의 ${sc.stat}이/가 ${sc.change}랭크 변했다!`);
          });
        }
      }
      else if (effect && roll < effect.chance) {
        console.log(`${usedMove.name}의 부가효과 발동!`)
        if (effect.heal && !appliedDameage) {
          const healRate = effect.heal;
          if (healRate < 1) {
            // 반피 회복 로직 
            updatePokemon(side, activeMine, (attacker) => changeHp(attacker, attacker.base.hp * healRate));
            addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
          } else {
            // 힘흡수
            let healAmount: number;
            healAmount = calculateRankEffect(defender.rank.attack) * defender.base.attack;
            updatePokemon(side, activeMine, (attacker) => changeHp(attacker, healAmount));
            addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
          }

        }
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
            const mirroredTeam = targetSide === 'enemy' ? myTeam : enemyTeam;
            const activeIndex = targetSide === 'my' ? activeMy : activeEnemy;
            const mirroredIndex = targetSide === 'enemy' ? activeMy : activeEnemy;
            // 미러아머 효과 적용 
            const finalTarget = (activeTeam[activeIndex].base.ability?.name === '미러아머' && statChange.target === 'opponent') ? side : targetSide;
            const finalActiveIndex = (activeTeam[activeIndex].base.ability?.name === '미러아머' && statChange.target === 'opponent') ? mirroredIndex : activeIndex;
            const finalActiveTeam = (activeTeam[activeIndex].base.ability?.name === '미러아머' && statChange.target === 'opponent') ? mirroredTeam : activeTeam;
            updatePokemon(finalTarget, finalActiveIndex, (target) => changeRank(target, stat as keyof RankState, change))
            if (finalActiveIndex === mirroredIndex) {
              console.log(`미러아머 발동!`);
              addLog(`미러아머 발동!`);
            }
            console.log(`${finalActiveTeam[finalActiveIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`);
            addLog(`🔃 ${finalActiveTeam[finalActiveIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`)
          });
        }
        if (effect.status) {
          // 상태이상 적용
          const status = effect.status;
          let noStatusCondition = false;
          if (usedMove.name === '매혹의보이스') {
            if (defender.hadRankUp) {
              if (status === '혼란' && !(defender.base.ability?.name === '마이페이스')) {
                addStatus(enemyPokemon, status, opponentSide, nullification);
              }
            } else {
              noStatusCondition = true;
            }
          } else {
            if (status === '화상' && defender.base.types.includes('불')) { noStatusCondition = true };
            if (status === '마비' && defender.base.types.includes('전기')) { noStatusCondition = true };
            if (status === '얼음' && defender.base.types.includes('얼음')) { noStatusCondition = true };
            if (status === '독' && (defender.base.types.includes('독') || defender.base.types.includes('강철')) || defender.base.ability?.name === '면역') { noStatusCondition = true };
            if (status === '맹독' && (defender.base.types.includes('독') || defender.base.types.includes('강철')) || defender.base.ability?.name === '면역') { noStatusCondition = true };
            if (status === '풀죽음') {
              if (defender.base.ability?.name === '정신력') {
                noStatusCondition = true;
              }
            }
            if (status === '잠듦') {
              if (defender.base.ability?.name === '불면' || defender.base.ability?.name === '의기양양' || defender.base.ability?.name === '스위트베일') {
                noStatusCondition = true;
              }
            }
            if (status === '도발' || status === '헤롱헤롱' && (defender.base.ability?.name === '둔감')) {
              noStatusCondition = true
            }
            if (status === '혼란' && (defender.base.ability?.name === '마이페이스')) {
              noStatusCondition = true;
            }
          }
          if (!noStatusCondition) {
            updatePokemon(opponentSide, activeOpponent, (prev) => addStatus(prev, status, opponentSide, nullification));
            console.log(`🏜️ ${mirroredTeam[activeOpponent].base.name}은/는 ${status}상태가 되었다!`);
          }
        }
        if (effect.heal && appliedDameage && appliedDameage > 0) {
          const deal = appliedDameage;
          const healRate = effect.heal;
          updatePokemon(side, activeMine, (attacker) => changeHp(attacker, deal * healRate));
          addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
        }
      }
    })
  }
  if (usedMove.exile) {
    console.log('💨 강제 교체 발동!');
    if (mirroredTeam[activeOpponent].currentHp === 0) { return; }
    // 이 기술로 상대 죽이면 강제교체 발동 안함
    const available = mirroredTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeOpponent);

    if (available.length === 0) {
      console.log('📛 교체 가능한 포켓몬이 없습니다.');
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    await switchPokemon(opponentSide, random.index, batonTouch);
    addLog(`💨 ${mirroredTeam[activeOpponent].base.name}은/는 강제 교체되었다!`);
  }
  return;
}

export async function applyDefensiveAbilityEffectAfterMultiDamage(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean, multiHit?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const ability = defender.base.ability;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  ability?.defensive?.forEach((category: string) => {
    switch (category) {
      case "rank_change":
        if (ability.name === '지구력' && (appliedDameage ?? 0) > 0) {
          if (defender.currentHp > 0) {
            console.log(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (defender) => changeRank(defender, 'defense', 1));
          }
        }
        break;
    }
  }
  )
}


async function applyDefensiveAbilityEffectAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean, multiHit?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const demeritEffect = usedMove.demeritEffects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const mirroredTeam = side === 'my' ? enemyTeam : myTeam;
  const ability = defender.base.ability;
  ability?.defensive?.forEach((category: string) => {
    switch (category) {
      case "weather_change":
        if (ability.name === '모래뿜기') {
          setWeather("모래바람");
          addLog(`🏜️ ${defender.base.name}의 특성으로 날씨가 모래바람이 되었다!`);
        }
        break;
      case "rank_change":
        if (ability.name === '증기기관' && (usedMove.type === '물' || usedMove.type === '불')) {
          if (defender.currentHp > 0) {
            console.log(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (defender) => changeRank(defender, 'speed', 6));
          }
        } else if (ability.name === '깨어진갑옷' && usedMove.isTouch) {
          if (defender.currentHp > 0) {
            console.log(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (defender) => changeRank(defender, 'speed', 2));
            updatePokemon(opponentSide, activeOpponent, (defender) => changeRank(defender, 'defense', -1));
          }
        } else if (ability.name === '정의의마음' && usedMove.type === '악') {
          if (defender.currentHp > 0) {
            console.log(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (defender) => changeRank(defender, 'attack', 1));
          }
        } else if (ability.name === '지구력' && (appliedDameage ?? 0) > 0 && !multiHit) {
          if (defender.currentHp > 0) {
            console.log(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            addLog(`${defender.base.name}의 특성 ${ability.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (defender) => changeRank(defender, 'defense', 1));
          }
        }
        break;
      case "status_change":
        if (ability.name === '불꽃몸' && usedMove.isTouch) {
          if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '화상', side));
          }
        }
        if (ability.name === '정전기' && usedMove.isTouch) {
          if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '마비', side));
          }
        }
        if (ability.name === '독가시' && usedMove.isTouch) {
          if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '독', side));
          }
        }
        if (ability.name === '포자' && usedMove.isTouch) {
          if (Math.random() < 0.1) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '독', side));
          } else if (Math.random() < 0.2) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '마비', side));
          } else if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '잠듦', side));
          }
        }
        if (ability.name === '저주받은바디') {
          if (Math.random() < 0.3) {
            updatePokemon(side, activeMine, (prev) => addStatus(prev, '사슬묶기', side));
          }
        }
        break;
      default:
        return;
    }
  })

}

async function applyOffensiveAbilityEffectAfrerDamage(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean, multiHit?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const demeritEffect = usedMove.demeritEffects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const mirroredTeam = side === 'my' ? enemyTeam : myTeam;
  const ability = attacker.base.ability;
  ability?.offensive?.forEach((category: string) => {
    switch (category) {
      case "status_change":
        if (ability.name === '독수' && usedMove.isTouch) {
          if (Math.random() < 0.3) {
            updatePokemon(opponentSide, activeOpponent, (prev) => addStatus(prev, '독', opponentSide));
          }
        }
        break;
      default:
        return;
    }
  })
}

async function applyMoveEffectAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, defender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number, watchMode?: boolean, multiHit?: boolean) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const demeritEffect = usedMove.demeritEffects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const mineTeam = side === 'my' ? myTeam : enemyTeam;
  const mirroredTeam = side === 'my' ? enemyTeam : myTeam;
  const enemyPokemon = side === 'enemy' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const batonTouch = usedMove.name === '배턴터치' ? true : false;
  defender = mirroredTeam[activeOpponent];
  attacker = mineTeam[activeMine];
  if (usedMove.cannotMove) {
    updatePokemon(side, activeMine, (prev) => ({
      ...prev,
      cannotMove: true
    }));
    console.log(`💥 ${attacker.base.name}은 피로로 인해 다음 턴 움직일 수 없다!`);
    addLog(`💥 ${attacker.base.name}은 피로로 인해 다음 턴 움직일 수 없다!`);
  }
  let shouldWaitForSwitch = false;
  let switchPromise: Promise<void> | null = null;
  if (usedMove.uTurn && !attacker.status.includes('교체불가')) {
    console.log('유턴 기술 사용!')

    const availableOpponent = mirroredTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeOpponent);
    if (side === 'my' && availableOpponent.length === 0 && enemyPokemon.currentHp === 0) {
      console.log('내가 유턴으로 게임을 끝냄!');
      return;
    }
    if (side === 'enemy' && availableOpponent.length === 0 && enemyPokemon.currentHp === 0) {
      console.log('상대가 유턴으로 게임을 끝냄!');
      return;
    }
    const { setSwitchRequest, clearSwitchRequest } = useBattleStore.getState();
    const availableIndexes = mineTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeMine); // 현재 포켓몬은 제외

    console.log(availableIndexes);
    // 1마리만 남은 경우는 실행안함
    if (availableIndexes.length != 0) {
      if (watchMode) {
        console.log('관전 모드에서 유턴 사용');
        const switchIndex = getBestSwitchIndex(side); // 상성 기반 추천 교체
        // Promise 사용해서 교체 끝날 때까지 넘어가지 않기
        switchPromise = new Promise<void>(async (resolve) => {
          await switchPokemon(side, switchIndex, batonTouch);
          resolve();
        });

      } else if (side === 'my') {
        console.log('내가 유턴 사용');
        switchPromise = new Promise<void>((resolve) => {
          setSwitchRequest({
            side,
            reason: "uTurn",
            onSwitch: async (index: number) => {
              await switchPokemon(side, index, batonTouch);
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
        await delay(1500);
        const switchIndex = getBestSwitchIndex(side);
        switchPromise = new Promise<void>(async (resolve) => {
          await switchPokemon(side, switchIndex, batonTouch);
          resolve();
        });
      }
    }
  }

  if (shouldWaitForSwitch && switchPromise) {
    console.log('유턴 로직 실행중...2');
    await switchPromise;
    console.log('유턴 로직 실행중...5 (완료)');
  }
  if (usedMove.selfKill) { // 대폭발, 자폭, 추억의선물, 목숨걸기
    updatePokemon(side, activeMine, (attacker) => changeHp(attacker, -attacker.base.hp));
    addLog(`🤕 ${attacker.base.name}은/는 반동으로 기절했다...!`);
    console.log(`🤕 ${attacker.base.name}은/는 반동으로 기절했다...!`);
  }
  demeritEffect?.forEach(async (demerit) => {
    if (demerit && Math.random() < demerit.chance) {
      console.log(`${usedMove.name}의 디메리트 효과 발동!`)
      if (demerit?.recoil && appliedDameage) {
        // 반동 데미지 적용
        const { updated: updatedAttacker } = await applyRecoilDamage(attacker, (demerit.recoil ?? 0), appliedDameage);
        updatePokemon(side, activeMine, (attacker) => updatedAttacker);
      }
      if (demerit.statChange) {
        demerit.statChange.forEach((statChange) => {
          const target = side === 'my' ? attacker : defender; // 자기자신
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
  if (attacker.base.ability?.name !== '우격다짐' && usedMove.target === 'opponent' && !multiHit) { // 우격다짐일 때에는 부가효과 적용안함. 다회공격도 여기서 처리 안함 
    let roll: number = Math.random();
    if (attacker.base.ability?.name === '하늘의은총') {
      roll *= 2;
    }
    effect?.forEach((effect) => {
      if (defender.base.ability?.name === '매직미러' && usedMove.category === '변화') {
        console.log(`${defender.base.name}의 매직미러 발동!`);
        addLog(`🔁 ${defender.base.name}의 매직미러 발동!`);

        // 공격자 쪽 정보 설정
        const mirrorTargetSide = side; // 공격자 쪽
        const mirrorTargetIndex = activeMine;
        const mirrorTargetTeam = side === 'my' ? myTeam : enemyTeam;

        // 각 효과를 반사해서 적용
        if (effect.status) {
          updatePokemon(mirrorTargetSide, mirrorTargetIndex, (target) =>
            addStatus(target, effect.status!, mirrorTargetSide)
          );
          addLog(`🪞 ${mirrorTargetTeam[mirrorTargetIndex].base.name}은/는 ${effect.status} 상태가 되었다!`);
        }
        if (effect.statChange) {
          effect.statChange.forEach((sc) => {
            updatePokemon(mirrorTargetSide, mirrorTargetIndex, (target) =>
              changeRank(target, sc.stat as keyof RankState, sc.change)
            );
            addLog(`🪞 ${mirrorTargetTeam[mirrorTargetIndex].base.name}의 ${sc.stat}이/가 ${sc.change}랭크 변했다!`);
          });
        }
      }
      else if (effect && roll < effect.chance) {
        console.log(`${usedMove.name}의 부가효과 발동!`)
        if (effect.typeChange) {
          updatePokemon(opponentSide, activeOpponent, (prev) => setTypes(prev, [effect.typeChange ?? '']));
        }
        if (effect.heal && !appliedDameage) {
          const healRate = effect.heal;
          if (healRate < 1) {
            // 반피 회복 로직 
            updatePokemon(side, activeMine, (prev) => changeHp(prev, attacker.base.hp * healRate));
            addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
          } else {
            let healAmount: number;
            healAmount = calculateRankEffect(defender.rank.attack) * defender.base.attack;
            updatePokemon(side, activeMine, (prev) => changeHp(prev, healAmount));
            addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
            if (usedMove.name === '힘흡수') {
              updatePokemon(opponentSide, activeOpponent, (prev) => changeRank(prev, 'attack', -1));
            }
          }

        }
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
            const mirroredTeam = targetSide === 'enemy' ? myTeam : enemyTeam;
            const activeIndex = targetSide === 'my' ? activeMy : activeEnemy;
            const mirroredIndex = targetSide === 'enemy' ? activeMy : activeEnemy;
            // 미러아머 효과 적용 
            const finalTarget = (activeTeam[activeIndex].base.ability?.name === '미러아머' && statChange.target === 'opponent') ? side : targetSide;
            const finalActiveIndex = (activeTeam[activeIndex].base.ability?.name === '미러아머' && statChange.target === 'opponent') ? mirroredIndex : activeIndex;
            const finalActiveTeam = (activeTeam[activeIndex].base.ability?.name === '미러아머' && statChange.target === 'opponent') ? mirroredTeam : activeTeam;
            updatePokemon(finalTarget, finalActiveIndex, (target) => changeRank(target, stat as keyof RankState, change));
            if (finalActiveTeam === mirroredTeam) {
              console.log(`미러아머 발동!`);
              addLog(`미러아머 발동!`);
            }
            console.log(`${finalActiveTeam[finalActiveIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`);
            addLog(`🔃 ${finalActiveTeam[finalActiveIndex].base.name}의 ${stat}이/가 ${change}랭크 변했다!`)
          });
        }
        if (effect.status) {
          // 상태이상 적용
          const status = effect.status;
          let noStatusCondition = false;
          let nullification = false;
          if (attacker.base.ability?.name === '부식') {
            nullification = true;
          }
          if (usedMove.name === '매혹의보이스') {
            if (defender.hadRankUp) {
              if (status === '혼란' && !(defender.base.ability?.name === '마이페이스')) {
                addStatus(enemyPokemon, status, opponentSide, nullification);
              }
            } else {
              noStatusCondition = true;
            }
          } else {
            if (status === '화상' && defender.base.types.includes('불')) { noStatusCondition = true };
            if (status === '마비' && defender.base.types.includes('전기')) { noStatusCondition = true };
            if (status === '얼음' && defender.base.types.includes('얼음')) { noStatusCondition = true };
            if (status === '독' && (defender.base.types.includes('독') || defender.base.types.includes('강철')) || defender.base.ability?.name === '면역') { noStatusCondition = true };
            if (status === '맹독' && (defender.base.types.includes('독') || defender.base.types.includes('강철')) || defender.base.ability?.name === '면역') { noStatusCondition = true };
            if (status === '풀죽음') {
              if (defender.base.ability?.name === '정신력') {
                noStatusCondition = true;
              }
            }
            if (status === '잠듦') {
              if (defender.base.ability?.name === '불면' || defender.base.ability?.name === '의기양양' || defender.base.ability?.name === '스위트베일') {
                noStatusCondition = true;
              }
            }
            if (status === '도발' || status === '헤롱헤롱' && (defender.base.ability?.name === '둔감')) {
              noStatusCondition = true
            }
            if (status === '혼란' && (defender.base.ability?.name === '마이페이스')) {
              noStatusCondition = true;
            }
          }
          if (!noStatusCondition) {
            updatePokemon(opponentSide, activeOpponent, (prev) => addStatus(prev, status, opponentSide, nullification));
          }
        }
        if (effect.heal && appliedDameage && appliedDameage > 0) {
          const deal = appliedDameage;
          const healRate = effect.heal;
          updatePokemon(side, activeMine, (attacker) => changeHp(attacker, deal * healRate));
          addLog(`➕ ${attacker.base.name}은/는 체력을 회복했다!`)
        }
      }
    })
  }
  if (usedMove.exile) {
    console.log('💨 강제 교체 발동!');
    if (mirroredTeam[activeOpponent].currentHp === 0) { return; }
    // 이 기술로 상대 죽이면 강제교체 발동 안함
    const available = mirroredTeam
      .map((p, i) => ({ ...p, index: i }))
      .filter((p, i) => p.currentHp > 0 && i !== activeOpponent);

    if (available.length === 0) {
      console.log('📛 교체 가능한 포켓몬이 없습니다.');
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    await switchPokemon(opponentSide, random.index, batonTouch);
    addLog(`💨 ${mirroredTeam[activeOpponent].base.name}은/는 강제 교체되었다!`);
  }
  return;
}