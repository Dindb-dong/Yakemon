import { BattlePokemon } from "../../models/BattlePokemon";
import { FieldType } from "../../models/Field";
import { useBattleStore } from "../../Context/useBattleStore";
import { StatusState } from "../../models/Status";
import { useDurationStore } from "../../Context/useDurationContext";

export function getState(forOpponent = false): number[] {
  // forOpponent는 상대가 ai인지. 유저가 사용할 때에는 true 고정임 
  const state: number[] = [];
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    publicEnv,
    turn,
  } = useBattleStore.getState();

  const { publicEffects } = useDurationStore.getState()

  const playerTeam = forOpponent ? enemyTeam : myTeam;
  const opponentTeam = forOpponent ? myTeam : enemyTeam;
  const player = playerTeam[forOpponent ? activeEnemy : activeMy];
  const opponent = opponentTeam[forOpponent ? activeMy : activeEnemy];

  // 1. 내 포켓몬의 HP 비율
  state.push(player.currentHp / player.base.hp);

  // 2. 타입 (18개 one-hot)
  const allTypes = [
    "노말", "불", "물", "풀", "전기", "얼음", "격투", "독", "땅",
    "비행", "에스퍼", "벌레", "바위", "고스트", "드래곤", "악", "강철", "페어리"
  ];
  allTypes.forEach((type) => {
    state.push(player.base.types.includes(type) ? 1 : 0);
  });

  // 3. 종족값 (hp 제외) - 5개
  state.push(player.base.attack / 255);
  state.push(player.base.defense / 255);
  state.push(player.base.spAttack / 255);
  state.push(player.base.spDefense / 255);
  state.push(player.base.speed / 255);

  // 4. 상태이상 (7개)
  const statusList = ['독', '마비', '화상', '잠듦', '얼음', '혼란', '없음'];
  statusList.forEach((s) => {
    state.push(player.status.includes(s as StatusState) ? 1 : 0);
  });

  // 5. 랭크 변화 (7개, -6 ~ +6 정규화)
  const ranks = ['attack', 'defense', 'spAttack', 'spDefense', 'speed', 'accuracy', 'dodge'];
  ranks.forEach((stat) => {
    const rank = player.rank?.[stat] ?? 0;
    state.push((rank + 6) / 12);
  });

  // 6. 기술 PP 비율 (최대 4개 기술)
  for (let i = 0; i < 4; i++) {
    const move = player.base.moves[i];
    if (move) {
      const pp = player.pp[move.name] ?? 0;
      state.push(pp / move.pp);
    } else {
      state.push(0);
    }
  }
  // 지금까지 42 

  // 7. 상대 포켓몬의 정보 (HP, 타입, 종족값, 상태이상, 랭크)
  state.push(opponent.currentHp / opponent.base.hp);

  allTypes.forEach((type) => {
    state.push(opponent.base.types.includes(type) ? 1 : 0);
  });

  state.push(opponent.base.attack / 255);
  state.push(opponent.base.defense / 255);
  state.push(opponent.base.spAttack / 255);
  state.push(opponent.base.spDefense / 255);
  state.push(opponent.base.speed / 255);

  statusList.forEach((s) => {
    state.push(opponent.status.includes(s as StatusState) ? 1 : 0);
  });

  ranks.forEach((stat) => {
    const rank = opponent.rank?.[stat] ?? 0;
    state.push((rank + 6) / 12);
  });
  // 지금까지 80

  // 8. 팀 구성 정보 (HP 비율 + 상태이상 여부, 3마리 기준)
  [playerTeam, opponentTeam].forEach((team) => {
    for (let i = 0; i < 3; i++) {
      const poke = team[i];
      if (poke) {
        state.push(poke.currentHp / poke.base.hp);
        state.push(poke.status.length > 0 ? 1 : 0);
      } else {
        state.push(0);
        state.push(0);
      }
    }
  });
  // 지금까지 92

  // 9. 턴 수 (최대 30으로 정규화)
  state.push(Math.min(1, turn / 30));
  // 지금까지 93

  // 10. 지형 효과 (4개) + 남은 턴 (최대 5)
  const terrains: FieldType[] = ['그래스필드', '사이코필드', '미스트필드', '일렉트릭필드'];
  terrains.forEach((terrain) => {
    state.push(publicEnv.field === terrain ? 1 : 0);
  });
  const activeEffect = publicEffects.find((p) => p.name === publicEnv.field);
  state.push(activeEffect ? activeEffect.remainingTurn / 5 : 0);
  // 지금까지 98개 
  console.log("✅ 상태 벡터 길이:", state.length);
  return state;
}