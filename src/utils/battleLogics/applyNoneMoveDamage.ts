import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { calculateTypeEffectiveness } from "../typeRalation";
import { removeTrap } from "./updateEnvironment";

// 스텔스락 = 바위타입 기술과 동일하게 상성 적용
export function applyTrapDamage(
  pokemon: BattlePokemon,
  trap: string[]
): { updated: BattlePokemon; log?: string, status_condition?: string } {
  let damage = 0;
  let log: string | undefined;

  let status_condition: string;

  const types = pokemon.base.types;
  if (pokemon.base.ability?.name !== '매직가드') {
    for (const item of trap) {
      if (item === "스텔스락") {
        const multiplier = calculateTypeEffectiveness("바위", types);
        damage += Math.floor(pokemon.base.hp * 0.125 * multiplier);
        if (damage) log = `${pokemon.base.name} 은 ${item}의 피해를 입었다!`;
      }
      if (item === "독압정") {
        if (types.includes("비행") || types.includes("고스트") || types.includes("강철") || types.includes("독")) {
          log = "독압정은 영향을 주지 않았다!";
          continue;
        } else if (pokemon.status.includes('독') || pokemon.status.includes('맹독')) {
          status_condition = '독압정 제거'
        } else {
          status_condition = '독'
          log = `${item}이 ${pokemon.base.name}에게 ${status_condition}을 유발했다!`;
        }
      }
      if (item === "맹독압정") {
        if (types.includes("비행") || types.includes("고스트") || types.includes("강철")) {
          log = "맹독압정은 영향을 주지 않았다!";
          continue;
        } else if (pokemon.status.includes('독') || pokemon.status.includes('맹독') || types.includes("독")) {
          status_condition = '맹독압정 제거'
        } else {
          status_condition = '맹독'
          if (status_condition) log = `${item}이 ${pokemon.base.name}에게 ${status_condition}을 유발했다!`;
        }
      }
    }
  }

  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };

  return { updated, log };
}