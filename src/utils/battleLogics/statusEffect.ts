import { useBattleStore } from "../../Context/useBattleStore";
import { decrementConfusionTurn, useDurationStore } from "../../Context/useDurationContext";
import { MoveInfo } from "../../models/Move";
import { StatusState } from "../../models/Status";
import { changeHp, removeStatus } from "./updateBattlePokemon";

export function applyStatusEffectBefore(
  status: StatusState[],
  currentRate: number,
  move: MoveInfo,
  side: "my" | "enemy",
): { rate: number, isHit: boolean } {
  const durationState = useDurationStore.getState();
  const { activeMy, activeEnemy, addLog, updatePokemon, myTeam, enemyTeam } = useBattleStore.getState();
  const activeTeam = side === 'my' ? myTeam : enemyTeam;
  const activeIndex = side === "my" ? activeMy : activeEnemy;
  let canAct = true;

  for (const s of status) {
    switch (s) {
      case "풀죽음":
        if (!canAct) break;
        addLog(`${activeTeam[activeIndex].base.name}은/는 풀이 죽어서 기술 사용에 실패했다!`);
        console.log(`${activeTeam[activeIndex].base.name}은/는 풀이 죽어서 기술 사용에 실패했다!`);
        canAct = false;
        break;
      case "잠듦":
        const sleepList = side === "my" ? durationState.myEffects : durationState.enemyEffects;
        const sleepEffect = sleepList.find(e => e.name === "잠듦");
        if (!sleepEffect?.remainingTurn) {
          durationState.removeEffect(side, "잠듦");
          updatePokemon(side, activeIndex, (prev) => removeStatus(prev, "잠듦"));
          addLog(`🏋️‍♂️ ${activeTeam[activeIndex].base.name}은/는 잠에서 깼다!`);
          console.log(`${activeTeam[activeIndex].base.name}은/는 잠에서 깼다!`);
        } else {
          console.log('잠든 상태다!', '남은 턴: ', sleepEffect?.remainingTurn);
        }
        if (sleepEffect) {
          const remaining = sleepEffect.remainingTurn;
          let recoveryChance = 0;

          if (remaining === 2) recoveryChance = 1 / 300;
          else if (remaining === 1) recoveryChance = 1 / 200;
          else if (remaining <= 0) recoveryChance = 1;
          const roll1 = Math.random();
          if (roll1 < recoveryChance) {
            // ✅ 잠듦 해제
            durationState.removeEffect(side, "잠듦");
            updatePokemon(side, activeIndex, (prev) => removeStatus(prev, "잠듦"));
            addLog(`🏋️‍♂️ ${activeTeam[activeIndex].base.name}은/는 잠에서 깼다!`);
            console.log(`${activeTeam[activeIndex].base.name}은/는 잠에서 깼다!`);
          } else {
            canAct = false;
            durationState.addEffect(side, {
              name: "잠듦",
              remainingTurn: sleepEffect.remainingTurn - 1,
              ownerIndex: sleepEffect.ownerIndex,
            });
            console.log(`${activeTeam[activeIndex].base.name}은/는 여전히 잠들어 있다 (남은 턴: ${remaining - 1})`);
          }
          // (잠듦 해제 or 잠듦 유지 여부 판단)
          // 잠들어있으면 canAct = false;
        }
        break;

      case "마비":
        const roll2 = Math.random();
        console.log('마비 상태에 빠져있다!', roll2)
        // 마비 확률적 적용
        if (!canAct) break;
        if (roll2 < 0.25) {
          canAct = false;
          addLog(`${activeTeam[activeIndex].base.name}은/는 몸이 저렸다!`);
          console.log(`${activeTeam[activeIndex].base.name}은/는 몸이 저렸다!`);
        } else canAct = true;
        break;
      case '얼음':
        const roll3 = Math.random();
        if (roll3 < 0.2 || move.type === '불') {
          updatePokemon(side, activeIndex, (prev) => removeStatus(prev, '얼음'));
          addLog(`🏋️‍♂️ ${activeTeam[activeIndex].base.name}의 얼음이 녹았다!`);
          console.log(`${activeTeam[activeIndex].base.name}의 얼음이 녹았다!`);
          canAct = true;
        } else {
          addLog(`☃️ ${activeTeam[activeIndex].base.name}은/는 얼어있다!`);
          console.log(`${activeTeam[activeIndex].base.name}은/는 얼어있다!`);
          canAct = false;
        }
      case "혼란":
        const roll4 = Math.random();
        console.log('혼란 상태에 빠져있다!', roll4)
        const recovered = decrementConfusionTurn(side, activeIndex);
        if (recovered) {
          canAct = true;
          addLog(`🏋️‍♂️ ${activeTeam[activeIndex].base.name}은/는 혼란에서 깼다!`);
          console.log(`${activeTeam[activeIndex].base.name}은/는 혼란에서 깼다!`);
        } else {

          addLog(`😵‍💫 ${activeTeam[activeIndex].base.name}은/는 혼란에 빠져있다!`);
          console.log(`${activeTeam[activeIndex].base.name}은/는 혼란에 빠져있다!`);
          if (roll4 < 0.33) {
            canAct = false;
            const selfDamage = 40 * activeTeam[activeIndex].base.attack;
            const durability = (activeTeam[activeIndex].base.defense * activeTeam[activeIndex].base.hp) / 0.411
            const finalDamage = Math.min(activeTeam[activeIndex].currentHp, Math.round((selfDamage / durability) * activeTeam[activeIndex].base.hp));
            updatePokemon(side, activeIndex, (prev) => changeHp(prev, -finalDamage));
            addLog(`😵‍💫 ${activeTeam[activeIndex].base.name}은/는 스스로를 공격했다!`);
            console.log(`${activeTeam[activeIndex].base.name}은/는 스스로를 공격했다!`);
          } else canAct = true;
        }
        break;
      case '화상':
        if (!canAct) break;
        if (move.category === "물리") {
          currentRate *= 0.5;
        }
        break;
      case '소리기술사용불가':
        addLog(`${activeTeam[activeIndex].base.name}은/는 소리기술 사용에 실패했다!`);
        console.log(`${activeTeam[activeIndex].base.name}은/는 소리기술 사용에 실패했다!`);
        canAct = false;
        break;
    }
  }
  // 💥 잠듦 처리
  // if (status.includes("잠듦")) {
  //   const sleepList = side === "my" ? durationState.myEffects : durationState.enemyEffects;
  //   const sleepEffect = sleepList.find(e => e.name === "잠듦");

  //   if (sleepEffect) {
  //     const remaining = sleepEffect.remainingTurn;
  //     let recoveryChance = 0;

  //     if (remaining === 2) recoveryChance = 1 / 3;
  //     else if (remaining === 1) recoveryChance = 1 / 2;
  //     else if (remaining <= 0) recoveryChance = 1;

  //     if (roll < recoveryChance) {
  //       // ✅ 잠듦 해제
  //       durationState.removeEffect(side, "잠듦");
  //       updatePokemon(side, activeIndex, (prev) => removeStatus(prev, "잠듦"));
  //       addLog(`${activeTeam[activeIndex].base.name}은/는 잠에서 깼다!`)
  //       console.log(`${activeTeam[activeIndex].base.name}은/는 잠에서 깼다!`)
  //       return { rate: currentRate, isHit: true };
  //     } else {
  //       return { rate: currentRate, isHit: false };
  //     }
  //   }
  // }

  // if (status.includes("화상") && move.category === "물리") {
  //   return { rate: currentRate * 0.5, isHit: true };
  // } else if (status.includes('마비')) {
  //   if (roll > 0.25) {
  //     return { rate: currentRate, isHit: true };
  //   } else {
  //     addLog(`${activeTeam[activeIndex].base.name}은/는 몸이 저렸다!`);
  //     console.log(`${activeTeam[activeIndex].base.name}은/는 몸이 저렸다!`);
  //     return { rate: currentRate, isHit: false };
  //   }
  // } else if (status.includes('풀죽음')) {
  //   addLog(`${activeTeam[activeIndex].base.name}은/는 풀이 죽어서 기술 사용에 실패했다!`);
  //   console.log(`${activeTeam[activeIndex].base.name}은/는 풀이 죽어서 기술 사용에 실패했다!`);
  //   return { rate: currentRate, isHit: false }
  // } else if (status.includes('소리기술사용불가') && move.affiliation === '소리') {
  //   addLog(`${activeTeam[activeIndex].base.name}은/는 소리기술 사용에 실패했다!`);
  //   console.log(`${activeTeam[activeIndex].base.name}은/는 소리기술 사용에 실패했다!`);
  //   return { rate: currentRate, isHit: false };
  // } else if (status.includes('얼음')) {
  //   console.log('확률: ', roll);
  //   if (roll < 0.2 || move.type === '불') {
  //     updatePokemon(side, activeIndex, (prev) => removeStatus(prev, '얼음'));
  //     addLog(`🏋️‍♂️ ${activeTeam[activeIndex].base.name}의 얼음이 녹았다!`);
  //     console.log(`${activeTeam[activeIndex].base.name}의 얼음이 녹았다!`);
  //     return { rate: currentRate, isHit: true };
  //   } else {
  //     addLog(`☃️ ${activeTeam[activeIndex].base.name}은/는 얼어있다!`);
  //     console.log(`${activeTeam[activeIndex].base.name}은/는 얼어있다!`);
  //     return { rate: currentRate, isHit: false };
  //   }
  // } else if (status.includes('헤롱헤롱')) {
  //   if (roll > 0.5) {
  //     return { rate: currentRate, isHit: true };
  //   } else {
  //     addLog(`😍 ${activeTeam[activeIndex].base.name}은/는 헤롱헤롱해있다!`);
  //     console.log(`${activeTeam[activeIndex].base.name}은/는 헤롱헤롱해있다!`);
  //     return { rate: currentRate, isHit: false };
  //   }
  // } else if (status.includes('혼란')) {
  //   const recovered = decrementConfusionTurn(side, activeIndex);
  //   if (recovered) {
  //     addLog(`🏋️‍♂️ ${activeTeam[activeIndex].base.name}는 혼란에서 회복했다!`);
  //     console.log(`${activeTeam[activeIndex].base.name}는 혼란에서 회복했다!`);
  //     return { rate: currentRate, isHit: true };
  //   } else {
  //     addLog(`😵‍💫 ${activeTeam[activeIndex].base.name}은/는 혼란에 빠져있다!`);
  //     console.log(`${activeTeam[activeIndex].base.name}은/는 혼란에 빠져있다!`);
  //     if (roll < 0.33) {
  //       const selfDamage = 40 * activeTeam[activeIndex].base.attack;
  //       const durability = (activeTeam[activeIndex].base.defense * activeTeam[activeIndex].base.hp) / 0.411
  //       const finalDamage = Math.min(activeTeam[activeIndex].currentHp, Math.round((selfDamage / durability) * activeTeam[activeIndex].base.hp));
  //       updatePokemon(side, activeIndex, (prev) => changeHp(prev, -finalDamage));
  //       addLog(`😵‍💫 ${activeTeam[activeIndex].base.name}은/는 스스로를 공격했다!`);
  //       console.log(`${activeTeam[activeIndex].base.name}은/는 스스로를 공격했다!`);
  //       return { rate: currentRate, isHit: false };
  //     }
  //   }
  // }
  return { rate: currentRate, isHit: canAct };
}