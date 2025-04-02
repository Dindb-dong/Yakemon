// 배틀 전반적인 흐름을 다룸. 
// 나와 상대(AI)가 할 수 있는 행동은 2가지. 
// 기술을 사용하냐, 교체를 하냐. 
// Battle.tsx에서 사용자의 입력 (교체 / 기술사용), 그리고 인공지능의 입력 (교체 / 기술사용)에 따라 플로우가 달라져야 함. 
// 교체가 무조건 먼저 발동.
// 둘 다 교체를 눌렀을 경우, 스피드가 빠른 쪽이 먼저 교체함. 
// 이 때, 교체한 쪽이 switchPokemon 쓰고 다른 한 쪽이 calculateMoveDamage 씀.
// 이후에 applyAfterDamage(피격 이후 발동하는 내 특성 및 상대 특성을 적용, 기술 효과 발동)
// 만약 multiHit이 true인 기술을 사용했을 경우, calculateMoveDamage와 applyAfterDamage를 랜덤한 횟수만큼 작동시킴 (2~5회)
// 그리고 마지막으로 applyEndTrun(상태이상 데미지 적용, 날씨 데미지 적용, 필드효과 적용, 매 턴 발동하는 유틸 특성 적용 등 )

import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { applyAfterDamage } from "./applyAfterDamage";
import { applyEndTurnEffects } from "./applyEndTurnEffects";
import { calculateOrder } from "./calculateOrder";
import { calculateMoveDamage } from "./damageCalculator";
import { calculateRankEffect } from "./rankEffect";
import { switchPokemon } from "./switchPokemon";
import { decrementConfusionTurn } from "../../Context/useDurationContext";

type BattleAction = MoveInfo | { type: "switch", index: number };

function isMoveAction(action: BattleAction): action is MoveInfo {
  return (action as MoveInfo).power !== undefined;
}

function isSwitchAction(action: BattleAction): action is { type: "switch", index: number } {
  return (action as any).type === "switch";
}



export async function battleSequence(
  myAction: BattleAction,
  aiAction: BattleAction
) {
  const { addLog, myTeam, enemyTeam, activeEnemy, activeMy } = useBattleStore.getState();
  const myPokemon = myTeam[activeMy];
  const aiPokemon = enemyTeam[activeEnemy];
  console.log('우선도 및 스피드 계산중...')

  // === 0. 기절한 포켓몬 자동 교체 (행동과 무관하게 즉시 처리) ===
  if (aiPokemon.currentHp <= 0) {
    removeFaintedPokemon("enemy");
    const updatedEnemy = useBattleStore.getState().enemyTeam[
      useBattleStore.getState().activeEnemy
    ];
    if (updatedEnemy.currentHp <= 0) return; // 남은 포켓몬이 없으면 턴 종료
    return;
  }

  if (myPokemon.currentHp <= 0 && isSwitchAction(myAction)) {
    switchPokemon("my", myAction.index);
    const updatedMine = useBattleStore.getState().myTeam[
      useBattleStore.getState().activeMy
    ];
    if (updatedMine.currentHp <= 0) return;
    return;
  }

  const whoIsFirst = calculateOrder(
    isMoveAction(myAction) ? myAction : undefined,
    isMoveAction(aiAction) ? aiAction : undefined
  );

  // === 1. 둘 다 교체 ===
  if (isSwitchAction(myAction) && isSwitchAction(aiAction)) {
    if (whoIsFirst === "my") {
      switchPokemon("my", myAction.index);
      switchPokemon("enemy", aiAction.index);
    } else {
      switchPokemon("enemy", aiAction.index);
      switchPokemon("my", myAction.index);
    }
    applyEndTurnEffects();
    return;
  }

  // === 2. 한 쪽만 교체 ===
  if (isSwitchAction(myAction)) {
    switchPokemon("my", myAction.index);
    if (isMoveAction(aiAction)) {
      await handleMove("enemy", aiAction);
    }
    applyEndTurnEffects();
    return;
  }

  if (isSwitchAction(aiAction)) {
    switchPokemon("enemy", aiAction.index);
    if (isMoveAction(myAction)) {
      await handleMove("my", myAction);
    }
    applyEndTurnEffects();
    return;
  }

  // === 3. 둘 다 기술 ===
  if (whoIsFirst === "my") {
    await handleMove("my", myAction as MoveInfo);

    // 상대가 쓰러졌는지 확인
    const updatedEnemy = useBattleStore.getState().enemyTeam[
      useBattleStore.getState().activeEnemy
    ];
    if (updatedEnemy.currentHp <= 0) {
      removeFaintedPokemon("enemy");
      applyEndTurnEffects();
      return;
    }

    await handleMove("enemy", aiAction as MoveInfo);
  } else { // 상대가 선공일 경우 
    await handleMove("enemy", aiAction as MoveInfo);

    // 내가 쓰러졌는지 확인
    const updatedMe = useBattleStore.getState().myTeam[
      useBattleStore.getState().activeMy
    ];
    if (updatedMe.currentHp <= 0) {
      removeFaintedPokemon("my");
      applyEndTurnEffects();
      return;
    }

    await handleMove("my", myAction as MoveInfo);
  }

  applyEndTurnEffects();
}

async function handleMove(side: "my" | "enemy", move: MoveInfo) {
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    addLog
  } = useBattleStore.getState();
  const isMultiHit = move.effects?.multiHit;
  const isDoubleHit = move.effects?.doubleHit;
  const isTripleHit = ["트리플킥", "트리플악셀"].includes(move.name);
  const attacker: BattlePokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const deffender: BattlePokemon = side === 'enemy' ? enemyTeam[activeEnemy] : myTeam[activeMy];
  const activeIndex = side === 'my' ? activeMy : activeEnemy;
  const opponentSide = side === 'my' ? 'enemy' : 'my'; // 상대 진영 계산 

  if (isTripleHit) {
    const hitCount = getHitCount(move);
    for (let i = 0; i < hitCount; i++) {
      const result = await calculateMoveDamage({ moveName: move.name, side });
      if (result?.success) {
        const recovered = decrementConfusionTurn(side, activeIndex);
        if (recovered) {
          addLog(`${attacker}는 혼란에서 회복했다!`);
        }
        // 트리플 기술은 데미지 누적 증가 (예시)
        move.power += (move.name === "트리플킥" ? 10 : 20); // 누적 증가
        await applyAfterDamage(side, attacker, deffender, move, result.damage);
      } else {
        break; // 빗나가면 반복 중단
      }
    }
  } else if (isDoubleHit || isMultiHit) {
    const result = await calculateMoveDamage({ moveName: move.name, side });
    if (result?.success) {
      const recovered = decrementConfusionTurn(side, activeIndex);
      if (recovered) {
        addLog(`${attacker}는 혼란에서 회복했다!`);
      }
      const hitCount = getHitCount(move);
      for (let i = 0; i < hitCount - 1; i++) {
        const result = await calculateMoveDamage({ moveName: move.name, side, isAlwaysHit: true });
        if (result?.success) {
          const recovered = decrementConfusionTurn(side, activeIndex);
          if (recovered) {
            addLog(`${attacker}는 혼란에서 회복했다!`);
          }
          await applyAfterDamage(side, attacker, deffender, move, result?.damage);
        }
      }
      console.log("총 " + hitCount + "번 맞았다!");
    }
  }
  else { // 그냥 다른 기술들
    const result = await calculateMoveDamage({ moveName: move.name, side });
    if (result?.success) {
      const recovered = decrementConfusionTurn(side, activeIndex);
      if (recovered) {
        addLog(`${attacker}는 혼란에서 회복했다!`);
      }
      await applyAfterDamage(side, attacker, deffender, move, result?.damage);
    }
  }
}

function removeFaintedPokemon(side: 'my' | 'enemy') {
  const {
    myTeam,
    enemyTeam,
  } = useBattleStore.getState();
  const team = side === "my" ? myTeam : enemyTeam;
  const nextIndex = team.findIndex(p => p.currentHp > 0);
  if (nextIndex !== -1) {
    switchPokemon(side, nextIndex);
  }
}

function getHitCount(move: MoveInfo): number {
  if (!move.effects?.multiHit) return 1;
  if (move.effects?.doubleHit) return 2;
  if (move.effects?.tripleHit) return 3;

  const rand = Math.random();
  if (move.name === "스킬링크") return 5;

  if (rand < 0.15) return 5;
  if (rand < 0.30) return 4;
  if (rand < 0.65) return 3;
  return 2;
}