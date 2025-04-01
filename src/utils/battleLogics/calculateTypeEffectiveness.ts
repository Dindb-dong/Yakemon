import { PokemonInfo } from "../../models/Pokemon";
import { MoveInfo } from "../../models/Move";
import { calculateTypeEffectiveness as baseTypeEffect } from "../typeRalation"; // 기존 상성 계산 함수
import { hasAbility } from "./helpers";

// 타입 무효 특성을 무시하는 특성
const ignoreImmunityAbilities = ['배짱', '심안'];

export function calculateTypeEffectivenessWithAbility(
  attacker: PokemonInfo,
  defender: PokemonInfo,
  move: MoveInfo
): number {
  const moveType = move.type;
  let defenderTypes = [...defender.types];

  // 배짱/심안 특성이 있을 경우: 고스트 면역 무시
  if (attacker.ability && hasAbility(attacker.ability, ignoreImmunityAbilities)) {
    defenderTypes = defenderTypes.filter(
      (type) => !isTypeImmune(type, moveType)
    );
  }

  return baseTypeEffect(moveType, defenderTypes);
}

// 무효화되는 타입 조합 정의 (예시)
export function isTypeImmune(targetType: string, moveType: string): boolean {
  const immunityMap: Record<string, string[]> = {
    '노말': ['고스트'],
    '격투': ['고스트'],
    '독': ['강철'],
    '전기': ['땅'],
    '땅': ['비행'],
    '고스트': ['노말'],
    '드래곤': ['페어리'],
  };

  return immunityMap[moveType]?.includes(targetType) ?? false;
}