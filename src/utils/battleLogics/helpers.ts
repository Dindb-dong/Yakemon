import { AbilityInfo } from "../../models/Ability";

export function hasAbility(ability: AbilityInfo, targets: string[]): boolean {
  return targets.includes(ability.name);
}