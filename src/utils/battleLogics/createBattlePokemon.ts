import { BattlePokemon } from "../../models/BattlePokemon";
import { PokemonInfo } from "../../models/Pokemon";
import { RankState } from "../../models/RankState";

type EffortStatBonus = {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};

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

// 도감번호 → formCondition 매핑
export const formConditionMap: Record<number, (self: BattlePokemon) => boolean> = {
  746: (self) => self.currentHp / self.base.hp < 0.25, // 약어리: 체력 25% 미만
  // 필요 시 더 추가
};

// BattlePokemon 생성 함수
export function createBattlePokemon(base: PokemonInfo, exchange?: boolean, effortBonus?: Partial<EffortStatBonus>): BattlePokemon {
  if (!base || !base.moves) {
    throw new Error(`createBattlePokemon: 유효하지 않은 포켓몬 데이터: ${JSON.stringify(base)}`);
  }

  const appliedBonus: EffortStatBonus = {
    hp: effortBonus?.hp ?? 0,
    attack: effortBonus?.attack ?? 0,
    defense: effortBonus?.defense ?? 0,
    spAttack: effortBonus?.spAttack ?? 0,
    spDefense: effortBonus?.spDefense ?? 0,
    speed: effortBonus?.speed ?? 0,
  };

  const pp: Record<string, number> = {};
  base.moves.forEach((move) => {
    const movePP = move.pp ?? 10; // pp 없으면 기본값 10
    pp[move.name] = movePP;
  });

  return {
    base: !exchange ?
      {
        ...base,
        hp: base.hp + 75 + appliedBonus.hp,
        attack: base.attack + 20 + appliedBonus.attack,
        spAttack: base.spAttack + 20 + appliedBonus.spAttack,
        defense: base.defense + 20 + appliedBonus.defense,
        spDefense: base.spDefense + 20 + appliedBonus.spDefense,
        speed: base.speed + 20 + appliedBonus.speed,
        originalAbility: base.ability ?? null, // 원본 특성 복사
        originalTypes: base.types // 원본 타입 복사, 기본값 빈 배열
      } : base.memorizedBase ? {
        ...base.memorizedBase,
        ability: base.memorizedBase.ability ?? base.ability ?? null,
        types: base.memorizedBase.types ?? base.types ?? []// 원본 타입 복사, 기본값 빈 배열
      } : {
        ...base,
        ability: base.originalAbility ?? base.ability ?? null,
        types: base.originalTypes ?? base.types ?? [] // 원본 타입 복사, 기본값 빈 배열
      },
    currentHp: !exchange ? base.hp + 75 + appliedBonus.hp : base.hp,
    pp,
    rank: defaultRank,
    status: [],
    position: null,
    lockedMove: undefined,
    isActive: false,
    unUsableMove: undefined,
    formCondition: formConditionMap[base.id] ?? undefined,
  };
}
// Example:
// import { createBattlePokemon } from "../utils/battleLogic/createBattlePokemon";

// // 초기화 시 팀 설정
// const myRawTeam: PokemonInfo[] = [...]; // 원본 팀
// const battleReadyTeam = myRawTeam.map((p) => createBattlePokemon(p));

// setMyTeam(battleReadyTeam);
