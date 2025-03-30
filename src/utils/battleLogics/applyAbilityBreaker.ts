import { PokemonInfo } from "../../models/Pokemon";
import { hasAbility } from "./helpers";

// 틀깨기, 터보블레이즈, 테라볼티지 등 특성 무시 특성 적용
export function applyAbilityBreaker(attacker: PokemonInfo, defender: PokemonInfo): PokemonInfo {
  const breakerAbilities = ['틀깨기', '터보블레이즈', '테라볼티지', '균사의힘'];

  if (attacker.ability && hasAbility(attacker.ability, breakerAbilities)) {
    return {
      ...defender,
      ability: null, // 특성 무시
    };
  }

  return defender;
}