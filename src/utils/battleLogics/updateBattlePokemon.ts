import { BattlePokemon } from "../../models/BattlePokemon";
import { AbilityInfo } from "../../models/Ability";
import { RankManager } from "../../models/RankState";
import { StatusManager, StatusState } from "../../models/Status";

// 체력 변화
export function changeHp(pokemon: BattlePokemon, amount: number): BattlePokemon {
  const newHp = Math.max(0, pokemon.currentHp + amount);
  // TODO: 체력 0 이하 되면 0으로 만들기. 이후 기절 처리 
  return { ...pokemon, currentHp: newHp };

}

// 랭크 변경
export function changeRank(
  pokemon: BattlePokemon,
  stat: keyof typeof pokemon.rank,
  amount: number
): BattlePokemon {
  const manager = new RankManager(pokemon.rank);
  if (amount > 0) manager.increaseState(stat, amount);
  else manager.decreaseState(stat, Math.abs(amount));
  return { ...pokemon, rank: manager.getState() };
}

// 랭크 초기화
export function resetRank(pokemon: BattlePokemon): BattlePokemon {
  const manager = new RankManager(pokemon.rank);
  manager.resetState();
  return { ...pokemon, rank: manager.getState() };
}

// 상태이상 추가
export function addStatus(pokemon: BattlePokemon, status: StatusState): BattlePokemon {
  const manager = new StatusManager(pokemon.status);
  manager.addStatus(status);
  return { ...pokemon, status: manager.getStatus() };
}

// 상태이상 제거
export function removeStatus(pokemon: BattlePokemon, status: StatusState): BattlePokemon {
  const manager = new StatusManager(pokemon.status);
  manager.removeStatus(status);
  return { ...pokemon, status: manager.getStatus() };
}

// 전체 상태이상 제거
export function clearAllStatus(pokemon: BattlePokemon): BattlePokemon {
  const manager = new StatusManager(pokemon.status);
  manager.clearStatus();
  return { ...pokemon, status: manager.getStatus() };
}

// 상태이상 확인
export function hasStatus(pokemon: BattlePokemon, status: StatusState): boolean {
  const manager = new StatusManager(pokemon.status);
  return manager.hasStatus(status);
}

// 기술 사용 시 PP 차감
export function useMovePP(pokemon: BattlePokemon, moveName: string, pressure?: boolean): BattlePokemon {
  let newPP = { ...pokemon.pp };
  if (newPP[moveName] > 0) {
    if (!pressure) {
      newPP[moveName] -= 1;
    } else {
      newPP[moveName] -= 2; // 프레셔 있을 경우 -2 
      // TODO: pp가 -1이 되면 0으로 클램핑. 
    }
  }
  if (newPP[moveName] < 0) {
    newPP[moveName] += 1;
  }
  return { ...pokemon, pp: newPP };
}

// 기술 고정 (구애스카프 등)
export function lockMove(pokemon: BattlePokemon, moveName: string): BattlePokemon {
  return { ...pokemon, lockedMove: moveName };
}

// 위치 변경 (구멍파기, 공중날기 등)
export function changePosition(
  pokemon: BattlePokemon,
  position: '땅' | '하늘' | '바다' | null
): BattlePokemon {
  return { ...pokemon, position };
}

// 전투 출전 여부 설정
export function setActive(pokemon: BattlePokemon, isActive: boolean): BattlePokemon {
  return { ...pokemon, isActive };
}

// 특성 강제 변경 함수
export function setAbility(pokemon: BattlePokemon, ability: AbilityInfo | null): BattlePokemon {
  return {
    ...pokemon,
    base: {
      ...pokemon.base,
      ability: ability, // null도 가능
    },
  };
}

// 타입 강제 변경 함수 
export function setTypes(pokemon: BattlePokemon, types: string[]): BattlePokemon {
  return {
    ...pokemon,
    base: {
      ...pokemon.base,
      types: types, // 빈 배열 넣으면 사실상 타입 사라지게 함.
    },
  };
}

// Example:
// const { myTeam, updatePokemon } = useBattleStore();
// const active = myTeam[0];

// // 체력 -30
// updatePokemon("my", 0, changeHp(active, -30));

// // 공격 랭크 +2
// updatePokemon("my", 0, changeRank(active, "attack", 2));

// // 마비 상태 추가
// updatePokemon("my", 0, addStatus(active, "마비"));

// // 펀치 기술 사용
// updatePokemon("my", 0, useMovePP(active, "불주먹"));