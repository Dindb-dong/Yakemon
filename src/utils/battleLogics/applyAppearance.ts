import { BattleEnvironment } from "../../Context/BattleEnvironment";
import { BattlePokemon } from "../../Context/BattlePokemon";

export function applyAppearance(
  pokemon: BattlePokemon,
  env: BattleEnvironment
): { updatedEnv: BattleEnvironment; log?: string } {
  const ability = pokemon.base.ability;
  const updatedEnv = { ...env };
  let log: string | undefined;

  if (!ability?.appear) return { updatedEnv };

  for (const effect of ability.appear) {
    switch (effect) {
      case "weather_change":
        updatedEnv.weather = "쾌청"; // 가뭄 기준 예시
        log = `${pokemon.base.name}의 특성으로 날씨가 바뀌었다!`;
        break;
      case "field_change":
        updatedEnv.field = "일렉트릭필드";
        log = `${pokemon.base.name}의 특성으로 필드가 바뀌었다!`;
        break;
      case "aura_change":
        updatedEnv.aura = "다크오라";
        log = `${pokemon.base.name}의 특성으로 오라가 활성화되었다!`;
        break;
      // TODO: 랭크 변화, 회복 등 추가 가능
    }
  }

  return { updatedEnv, log };
}