import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { calculateTypeEffectiveness } from "../typeRalation";
import { removeTrap } from "./updateEnvironment";
import { StatusState } from "../../models/Status";
import { WeatherType } from "../../models/Weather";

// 스텔스록 = 바위타입 기술과 동일하게 상성 적용
export async function applyTrapDamage(
  pokemon: BattlePokemon,
  trap: string[]
): Promise<{ updated: BattlePokemon; log?: string; status_condition?: string; }> {
  let damage = 0;
  let log: string | undefined;

  let status_condition: string = "";

  const types = pokemon.base.types;
  if (pokemon.base.ability?.name !== '매직가드') {
    for (const item of trap) {
      if (item === "스텔스록") {
        const multiplier = calculateTypeEffectiveness("바위", types);
        damage += Math.floor(pokemon.base.hp * 0.125 * multiplier);
        if (damage) {
          log = `${pokemon.base.name} 은 ${item}의 피해를 입었다!`;
          console.log(`${pokemon.base.name} 은 ${item}의 피해를 입었다!`)
        }
      }
      if (item === "독압정") {
        if (types.includes("비행") || types.includes("고스트") || types.includes("강철") || types.includes("독")) {
          log = "독압정은 영향을 주지 않았다!";
          continue;
        } else if (pokemon.base.types.includes('독')) {
          status_condition = '독압정 제거'
          log = "독압정은 제거됐다!";
        } else {
          status_condition = '독'
          log = `${item}이 ${pokemon.base.name}에게 ${status_condition}을 유발했다!`;
        }
      }
      if (item === "맹독압정") {
        if (types.includes("비행") || types.includes("고스트") || types.includes("강철")) {
          log = "맹독압정은 영향을 주지 않았다!";
          continue;
        } else if (pokemon.base.types.includes('독')) {
          status_condition = '맹독압정 제거'
          log = "맹독압정은 제거됐다!";
        } else {
          status_condition = '맹독'
          if (status_condition) log = `${item}이 ${pokemon.base.name}에게 ${status_condition}을 유발했다!`;
        }
      }
    }
  }

  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };

  return { updated, log, status_condition };
}

export async function applyWeatherDamage(
  pokemon: BattlePokemon,
  weather: WeatherType
): Promise<{ updated: BattlePokemon; }> {
  const { addLog } = useBattleStore.getState();
  let damage = 0;
  if (pokemon.base.ability?.name !== '매직가드') {
    if (weather === "모래바람" && !(pokemon.base.types.includes("바위") || pokemon.base.types.includes("강철") || pokemon.base.types.includes("땅"))
      && !((pokemon.base.ability?.name === '모래헤치기') || (pokemon.base.ability?.name === '모래숨기') || (pokemon.base.ability?.name === '모래의힘'))) {
      damage = Math.floor(pokemon.base.hp * 0.125);
      addLog(`${pokemon.base.name}은 모래바람에 의해 피해를 입었다!`);
    }
  }
  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };
  return { updated };
}

export async function applyRecoilDamage(
  pokemon: BattlePokemon,
  recoil: number,
  appliedDameage: number
): Promise<{ updated: BattlePokemon; log?: string; }> {
  let damage: number = 0;
  const { addLog } = useBattleStore.getState();
  if (pokemon.base.ability?.name !== '매직가드') {
    damage = Math.floor(appliedDameage * recoil);
    addLog(`${pokemon.base.name}은 반동으로 피해를 입었다!`);
  }
  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };
  return { updated };
}

export async function applyThornDamage(
  pokemon: BattlePokemon,
): Promise<{ updated: BattlePokemon; log?: string; }> {
  let damage = 0;
  const { addLog } = useBattleStore.getState();
  if (pokemon.base.ability?.name !== '매직가드') {
    damage = Math.floor(pokemon.base.hp * 0.125);
    addLog(`${pokemon.base.name}은 가시에 의해 피해를 입었다!`);
  }
  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };
  return { updated };
}

export async function applyStatusConditionDamage(
  pokemon: BattlePokemon,
  status: string
): Promise<{ updated: BattlePokemon; log?: string; }> {
  let damage = 0;
  const { addLog } = useBattleStore.getState();
  if (pokemon.base.ability?.name !== '매직가드') {
    if (status === "화상") {
      damage = Math.floor(pokemon.base.hp * 0.0625);
      addLog(`🔥 ${pokemon.base.name}은 화상으로 피해를 입었다!`);
    }
    if (status === "독") {
      damage = Math.floor(pokemon.base.hp * 0.125);
      addLog(`🍄 ${pokemon.base.name}은 독으로 피해를 입었다!`);
    }
    if (status === "맹독") {
      damage = Math.floor(pokemon.base.hp * (1 / 6));
      addLog(`🍄 ${pokemon.base.name}은 맹독으로 피해를 입었다!`);
    }
  }
  const updated = { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) };
  return { updated };
}