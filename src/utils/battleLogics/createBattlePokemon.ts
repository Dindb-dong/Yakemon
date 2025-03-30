import { BattlePokemon } from "../../Context/BattlePokemon";
import { PokemonInfo } from "../../models/Pokemon";
import { RankState } from "../../models/RankState";
import { StatusState } from "../../models/Status";

// 기본 랭크 상태
const defaultRank: RankState = {
  attack: 0,
  spAttack: 0,
  defense: 0,
  spDefense: 0,
  accuracy: 0,
  dodge: 0,
  critical: 0,
};

// BattlePokemon 생성 함수
export function createBattlePokemon(base: PokemonInfo): BattlePokemon {
  const pp: Record<string, number> = {};
  base.moves.forEach((move) => {
    const movePP = move.pp ?? 10; // pp 없으면 기본값 10
    pp[move.name] = movePP;
  });

  return {
    base,
    currentHp: base.hp,
    pp,
    rank: base.rank ?? { ...defaultRank },
    status: base.status ?? [],
    position: null,
    lockedMove: null,
    isActive: false,
  };
}
// Example:
// import { createBattlePokemon } from "../utils/battleLogic/createBattlePokemon";

// // 초기화 시 팀 설정
// const myRawTeam: PokemonInfo[] = [...]; // 원본 팀
// const battleReadyTeam = myRawTeam.map((p) => createBattlePokemon(p));

// setMyTeam(battleReadyTeam);