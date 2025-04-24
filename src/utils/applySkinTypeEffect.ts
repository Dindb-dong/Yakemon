import { MoveInfo } from "../models/Move";

type SkinType = '프리즈스킨' | '스카이스킨' | '페어리스킨' | '일렉트릭스킨' | '노말스킨';

const skinTypeMap: Record<SkinType, string> = {
  '프리즈스킨': '얼음',
  '스카이스킨': '비행',
  '페어리스킨': '페어리',
  '일렉트릭스킨': '전기',
  '노말스킨': '노말',
};

export function applySkinTypeEffect(
  move: MoveInfo,
  abilityName: string | null
): MoveInfo {
  const skinAbilities: SkinType[] = ['프리즈스킨', '스카이스킨', '페어리스킨', '일렉트릭스킨', '노말스킨'];

  // 특성이 해당 스킨 특성 중 하나가 아니면 그대로 반환
  if (!skinAbilities.includes(abilityName as SkinType)) return move;

  const skinType = skinTypeMap[abilityName as SkinType];

  // 복사본 만들어서 반환
  const newMove = { ...move };

  if (abilityName === '노말스킨') {
    // 노말스킨은 모든 기술 타입을 '노말'로 바꿈
    newMove.type = '노말';
    newMove.power = Math.floor(newMove.power * 1.2);
  } else if (move.type === '노말') {
    // 프리즈/스카이/페어리/일렉트릭 스킨은 노말 기술만 해당 타입으로 변환
    newMove.type = skinType;
    newMove.power = Math.floor(newMove.power * 1.2);
  }

  return newMove;
}