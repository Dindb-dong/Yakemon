import { BattlePokemon } from "../../models/BattlePokemon";
import { PokemonInfo } from "../../models/Pokemon";
import { RankState } from "../../models/RankState";
import { StatusState } from "../../models/Status";

// 기본 랭크 상태
const defaultRank: RankState = {
  attack: 0,
  spAttack: 0,
  defense: 0,
  spDefense: 0,
  speed: 0,
  accuracy: 0,
  dodge: 0,
  critical: 0,
};

// BattlePokemon 생성 함수
export function createBattlePokemon(base: PokemonInfo, exchange?: boolean): BattlePokemon {
  if (!base || !base.moves) {
    throw new Error(`createBattlePokemon: 유효하지 않은 포켓몬 데이터: ${JSON.stringify(base)}`);
  }

  const pp: Record<string, number> = {};
  base.moves.forEach((move) => {
    const movePP = move.pp ?? 10; // pp 없으면 기본값 10
    pp[move.name] = movePP;
  });

  return {
    base: !exchange ?
      {
        ...base,
        hp: base.hp + 75,
        attack: base.attack + 20,
        spAttack: base.spAttack + 20,
        defense: base.defense + 20,
        spDefense: base.spDefense + 20,
        speed: base.speed + 20,
        originalAbility: base.ability,
        originalTypes: base.types
      } : {
        ...base,
        originalAbility: base.ability,
        originalTypes: base.types
      },
    currentHp: !exchange ? base.hp + 75 : base.hp,
    pp,
    rank: defaultRank,
    status: [],
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