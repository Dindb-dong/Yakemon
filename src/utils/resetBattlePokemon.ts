// utils/resetBattlePokemon.ts
import { BattlePokemon } from "../models/BattlePokemon";

export function resetBattlePokemon(pokemon: BattlePokemon): BattlePokemon {
  const base = pokemon.base;
  return {
    ...pokemon,
    base: { ...base, types: [...(base.originalTypes || [])], ability: base.originalAbility ?? null },
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
      dodge: 0
    },
    pp: base.moves.reduce((acc, move) => {
      acc[move.name] = move.pp;
      return acc;
    }, {} as { [key: string]: number }),
  };
}