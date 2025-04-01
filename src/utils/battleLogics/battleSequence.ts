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

import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { applyAfterDamage } from "./applyAfterDamage";
import { calculateOrder } from "./calculateOrder";
import { calculateMoveDamage } from "./damageCalculator";
import { calculateRankEffect } from "./rankEffect";
import { switchPokemon } from "./switchPokemon";


export function battleSequence(myAction: MoveInfo | void, aiAction: MoveInfo | void) {
  const {
    myTeam, enemyTeam, activeMy, activeEnemy, publicEnv, myEnv, enemyEnv, turn, logs,
    setMyTeam, setEnemyTeam, setActiveMy, setActiveEnemy, setPublicEnv, setMyEnv, setEnemyEnv, updatePokemon, addLog
  } = useBattleStore.getState();

  const myPokemon = myTeam[activeMy];
  const aiPokemon = enemyTeam[activeEnemy];

  // action은 기술 혹은 교체(void함수).
  const whoIsFirst = calculateOrder(myAction, aiAction)
  // 서로 기술 사용했을 때에만 calculateOrder 실행.
  if ((typeof myAction === void) && (typeof aiAction === void)) { // 서로 교체했을 경우
    if (whoIsFirst === 'my') {
      myAction(); // void 함수 작동 (switchPokemon)
      aiAction();
    } else {
      aiAction();
      myAction();
    }
  } else if (myAction && aiAction && 'power' in myAction && 'power' in aiAction) { // 서로 기술 눌렀을 경우 
    if (whoIsFirst === 'my') { // 내가 먼저 행동할 경우 
      if (myAction.effects?.multiHit) { // 여러번 때리는 기술일 경우 
        const prob = Math.random();
        let hitTime: number;
        if (prob < 0.15 || myPokemon.base.ability?.name === '스킬링크') { // 5회 타격 가능 여부 
          const isHit = calculateMoveDamage({ moveName: myAction.name, side: "my" })
          if (isHit.success) { // 맞았을 경우 
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
          }
        } else if (prob >= 0.15 && prob < 0.3) { // 4회 타격 
          const isHit = calculateMoveDamage({ moveName: myAction.name, side: "my" })
          if (isHit.success) { // 맞았을 경우 
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
          }
        } else if (prob >= 0.3 && prob < 0.65) { // 3회 타격
          const isHit = calculateMoveDamage({ moveName: myAction.name, side: "my" })
          if (isHit.success) { // 맞았을 경우 
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
          }
        } else if (prob >= 0.65) {
          const isHit = calculateMoveDamage({ moveName: myAction.name, side: "my" })
          if (isHit.success) { // 맞았을 경우 
            calculateMoveDamage({ moveName: myAction.name, side: "my", isAlwaysHit: true });
          }
        }
      } else if (myAction.name === '트리플악셀') {
        // TODO: 이전 공격이 맞을때마다 additionalDamage에 20 넣어서 calculateMoveDamage 호출하고, 
        // applyAfterDamage도 매번 호출. 
      } else if (myAction.name === '트리플킥') {
        // TODO: 이전 공격이 맞을때마다 additionalDamage에 10 넣어서 calculateMoveDamage 호출하고, 
        // applyAfterDamage도 매번 호출. 
      }
      /// TODO: 내 기술 사용 및 데미지 이후 함수 실행 끝나면, side에 enemy 넣어서 상대의 기술 발동 및 데미지 이후 함수 발동. 
      // TODO: 상대도 마찬가지로 위와 동일하게.
      ///TODO:  매 턴 발동하는 함수 발동하고 끝. 
    } else if (whoIsFirst === 'enemy') {
      //TODO:  whoIsFirst가 my였을 경우와 기본적으로 같되, myPokemon 들어갈 자리에 enemyPokemon 들어가고 my 대신에 enemy 들어감. 
    }
  }
}