import { BattlePokemon } from "../models/BattlePokemon";

export function resetBattlePokemon(pokemon: BattlePokemon): BattlePokemon {
  const base = pokemon.base;

  return {
    ...pokemon,
    base: {
      ...base,
      types: [...(base.originalTypes ?? base.types)],
      ability: base.originalAbility ?? base.ability,
    },
    currentHp: base.hp,
    status: [],
    rank: {
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
      critical: 0,
      accuracy: 0,
      dodge: 0,
    },
    pp: base.moves.reduce((acc, move) => {
      acc[move.name] = move.pp;
      return acc;
    }, {} as Record<string, number>),

    // 선택 속성 초기화
    lockedMove: undefined,
    lockedMoveTurn: undefined,
    usedMove: undefined,
    isCharging: false,
    chargingMove: undefined,
    hadMissed: false,
    hadRankUp: false,
    formNum: undefined,
    isProtecting: false,
    cannotMove: false,
    receivedDamage: 0,
    isFirstTurn: false,
  };
}