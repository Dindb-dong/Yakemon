import { BattlePokemon } from "../../Context/BattlePokemon";
import { RankManager } from "../../models/RankState";
import { StatusState } from "../../models/Status";

// 체력 변화
export function changeHp(pokemon: BattlePokemon, amount: number): BattlePokemon {
  const newHp = Math.max(0, pokemon.currentHp + amount);
  return { ...pokemon, currentHp: newHp };
  // TODO: 체력 0 이하 되면 0으로 만들기. 이후 기절 처리 
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

// 상태이상 추가
export function addStatus(pokemon: BattlePokemon, status: StatusState): BattlePokemon {
  const has = pokemon.status.includes(status);
  if (!has && status !== null) { // 중복된 상태이상 아닐 경우 추가 
    // TODO: 마비, 독, 얼음, 화상, 잠듦은 중복되지 않음. 
    return { ...pokemon, status: [...pokemon.status, status] };
  }
  return pokemon;
}

// 상태이상 제거
export function removeStatus(pokemon: BattlePokemon, status: StatusState): BattlePokemon {
  return {
    ...pokemon,
    status: pokemon.status.filter((s) => s !== status),
  };
}

// 기술 사용 시 PP 차감
export function useMovePP(pokemon: BattlePokemon, moveName: string, pressure?: boolean): BattlePokemon {
  const newPP = { ...pokemon.pp };
  if (newPP[moveName] > 0) {
    if (!pressure) {
      newPP[moveName] -= 1;
    } else {
      newPP[moveName] -= 2; // 프레셔 있을 경우 -2 
      // TODO: pp가 -1이 되면 0으로 클램핑. 
    }
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