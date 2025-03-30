import { BattlePokemon } from "../../Context/BattlePokemon";
import { calculateTypeEffectiveness } from "../typeRalation";

// 스텔스락 = 바위타입 기술과 동일하게 상성 적용
export function applyTrapDamage(
  pokemon: BattlePokemon,
  trap: string[]
): { updated: BattlePokemon; log?: string } {
  let damage = 0;
  let log: string | undefined;

  const types = pokemon.base.types;

  for (const item of trap) {
    if (item === "스텔스락") {
      const multiplier = calculateTypeEffectiveness("바위", types);
      damage += Math.floor(pokemon.base.hp * 0.125 * multiplier);
      log = `스텔스락의 피해를 입었다! (${damage} 데미지)`;
    }

    if (item === "독압정") {
      if (types.includes("비행") || types.includes("고스트")) {
        log = "독압정은 영향을 주지 않았다!";
        continue;
      }
      log = `독압정이 ${pokemon.base.name}에게 상태이상을 유발했다!`;
      // 상태이상은 별도 처리에서 넣는 게 안전
    }
  }

  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };

  return { updated, log };
}