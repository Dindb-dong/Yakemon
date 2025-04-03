
import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { RankState } from "../../models/RankState";
import { changeRank } from "./updateBattlePokemon";
import {
  setAura,
  setWeather,
  setField,
  addDisaster,
} from "./updateEnvironment";
import { useDurationStore } from "../../Context/useDurationContext";

export function applyAppearance(
  pokemon: BattlePokemon,
  side: "my" | "enemy"
): string[] {
  const logs: string[] = [];
  const ability = pokemon.base.ability;
  if (!ability?.appear) return logs;

  const {
    updatePokemon,
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    publicEnv,
    addLog
  } = useBattleStore.getState();
  const { addEffect } = useDurationStore.getState()
  const myPokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const enemyPokemon = side === 'enemy' ? enemyTeam[activeEnemy] : myTeam[activeMy];
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;

  for (const effect of ability.appear) {
    switch (effect) {
      case "weather_change":
        if (ability.name === '가뭄') {
          setWeather("쾌청");
          addEffect("public", { name: '쾌청', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 날씨가 쾌청이 되었다!`);
        }
        if (ability.name === '잔비') {
          setWeather("비");
          addEffect("public", { name: '비', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 날씨가 비가 되었다!`);
        }
        if (ability.name === '눈퍼뜨리기') {
          setWeather("싸라기눈");
          addEffect("public", { name: '싸라기눈', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 날씨가 싸라기눈이 되었다!`);
        }
        if (ability.name === '모래날림') {
          setWeather("모래바람");
          addEffect("public", { name: '모래바람', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 날씨가 모래바람이 되었다!`);
        }
        break;
      case "field_change":
        if (ability.name === '일렉트릭메이커') {
          setField("일렉트릭필드");
          addEffect("public", { name: '일렉트릭필드', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 필드가 일렉트릭필드로 바뀌었다!`);
        }
        if (ability.name === '그래스메이커') {
          setField("그래스필드");
          addEffect("public", { name: '그래스필드', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 필드가 그래스필드로 바뀌었다!`);
        }
        if (ability.name === '미스트메이커') {
          setField("미스트필드");
          addEffect("public", { name: '미스트필드', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 필드가 미스트필드로 바뀌었다!`);
        }
        if (ability.name === '사이코메이커') {
          setField("사이코필드");
          addEffect("public", { name: '사이코필드', remainingTurn: 5 });
          addLog(`${pokemon.base.name}의 특성으로 필드가 사이코필드로 바뀌었다!`);
        }
        break;

      case "aura_change":
        if (ability.name === '페어리오라') {
          setAura("페어리오라");
          addLog(`${pokemon.base.name}의 특성으로 페어리오라가 생겼다!`);
        } else {
          setAura("다크오라");
          addLog(`${pokemon.base.name}의 특성으로 다크오라가 생겼다!`);
        }
        break;

      case "disaster":
        if (ability.name === '재앙의구슬') {
          addDisaster("재앙의구슬");
          addLog(`${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        if (ability.name === '재앙의그릇') {
          addDisaster("재앙의그릇");
          addLog(`${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        if (ability.name === '재앙의검') {
          addDisaster("재앙의검");
          addLog(`${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        if (ability.name === '재앙의목간') {
          addDisaster("재앙의목간");
          addLog(`${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        break;

      // 아래 항목은 필요 시 확장
      case "form_change":
        addLog(`${pokemon.base.name}의 폼이 변화했다!`);
        break;

      case "rank_change":
        if (ability.name === '위협') {
          const updatedOpponent = (enemyPokemon) => changeRank(enemyPokemon, "attack", -1);
          updatePokemon(opponentSide, activeOpponent, updatedOpponent);
          addLog(`${pokemon.base.name}의 등장으로 상대 ${enemyPokemon.base.name}의 공격력이 떨어졌다!`);

        } else if (ability.name === "고대활성" && publicEnv.weather === "쾌청") {
          const stats = myPokemon.base;
          const statEntries: [keyof RankState, number][] = [
            ["attack", stats.attack],
            ["defense", stats.defense],
            ["spAttack", stats.spAttack],
            ["spDefense", stats.spDefense],
            ["speed", stats.speed],
          ];

          const [bestStat] = statEntries.reduce((prev, curr) => {
            return curr[1] > prev[1] ? curr : prev;
          });

          const updatedMy = (myPokemon) => changeRank(myPokemon, bestStat, 1);
          updatePokemon(side, activeMine, updatedMy);
          addLog(`${pokemon.base.name}의 ${bestStat} 능력이 상승했다!`);
        } else if (ability.name === "쿼크차지" && publicEnv.field === "일렉트릭필드") {
          const stats = myPokemon.base;
          const statEntries: [keyof RankState, number][] = [
            ["attack", stats.attack],
            ["defense", stats.defense],
            ["spAttack", stats.spAttack],
            ["spDefense", stats.spDefense],
            ["speed", stats.speed],
          ];

          const [bestStat] = statEntries.reduce((prev, curr) => {
            return curr[1] > prev[1] ? curr : prev;
          });

          const updatedMy = (myPokemon) => changeRank(myPokemon, bestStat, 1);
          updatePokemon(side, activeMine, updatedMy);
          addLog(`${pokemon.base.name}의 ${bestStat} 능력이 상승했다!`);
        }
        // TODO: 더 추가 
        break;

      case "heal":
        addLog(`${pokemon.base.name}이 회복 효과를 발동했다!`);
        break;

      case "ability_change":
        addLog(`${pokemon.base.name}의 특성이 변화했다!`);
        break;
    }
  }

  return logs;
}