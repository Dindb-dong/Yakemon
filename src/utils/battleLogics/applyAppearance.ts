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
  const myPokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const enemyPokemon = side === 'my' ? enemyTeam[activeEnemy] : myTeam[activeMy];
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;

  for (const effect of ability.appear) {
    switch (effect) {
      case "weather_change":
        if (ability.name === '가뭄') {
          setWeather("쾌청");
          addLog(`☀️ ${pokemon.base.name}의 특성으로 날씨가 쾌청이 되었다!`);
        }
        if (ability.name === '잔비') {
          setWeather("비");
          addLog(`🌧️ ${pokemon.base.name}의 특성으로 날씨가 비가 되었다!`);
        }
        if (ability.name === '눈퍼뜨리기') {
          setWeather("싸라기눈");
          addLog(`☃️ ${pokemon.base.name}의 특성으로 날씨가 싸라기눈이 되었다!`);
        }
        if (ability.name === '모래날림') {
          setWeather("모래바람");
          addLog(`🏜️ ${pokemon.base.name}의 특성으로 날씨가 모래바람이 되었다!`);
        }
        break;
      case "field_change":
        if (ability.name === '일렉트릭메이커') {
          setField("일렉트릭필드");
          addLog(`⚡️ ${pokemon.base.name}의 특성으로 필드가 일렉트릭필드로 바뀌었다!`);
        }
        if (ability.name === '그래스메이커') {
          setField("그래스필드");
          addLog(`🌱 ${pokemon.base.name}의 특성으로 필드가 그래스필드로 바뀌었다!`);
        }
        if (ability.name === '미스트메이커') {
          setField("미스트필드");
          addLog(`😶‍🌫️ ${pokemon.base.name}의 특성으로 필드가 미스트필드로 바뀌었다!`);
        }
        if (ability.name === '사이코메이커') {
          setField("사이코필드");
          addLog(`🔮 ${pokemon.base.name}의 특성으로 필드가 사이코필드로 바뀌었다!`);
        }
        break;

      case "aura_change":
        if (ability.name === '페어리오라') {
          setAura("페어리오라");
          addLog(`😇 ${pokemon.base.name}의 특성으로 페어리오라가 생겼다!`);
        } else {
          setAura("다크오라");
          addLog(`😈 ${pokemon.base.name}의 특성으로 다크오라가 생겼다!`);
        }
        break;

      case "disaster":
        if (ability.name === '재앙의구슬') {
          addDisaster("재앙의구슬");
          addLog(`🌋 ${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        if (ability.name === '재앙의그릇') {
          addDisaster("재앙의그릇");
          addLog(`🌋 ${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        if (ability.name === '재앙의검') {
          addDisaster("재앙의검");
          addLog(`🌋 ${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        if (ability.name === '재앙의목간') {
          addDisaster("재앙의목간");
          addLog(`🌋 ${pokemon.base.name}의 특성으로 ${ability.name} 효과가 발동했다!`);
        }
        break;

      // 아래 항목은 필요 시 확장
      case "form_change":
        if (ability.name === 'AR시스템') {
          const allTypes = [
            '노말', '불', '물', '풀', '전기', '얼음', '격투',
            '독', '땅', '비행', '에스퍼', '벌레', '바위', '고스트',
            '드래곤', '악', '강철', '페어리'
          ];

          // 타입 무작위 선택
          const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];

          // 타입 변경 + 멀티어택 타입 동기화
          updatePokemon(side, activeMine, (prev) => {
            const updatedMoves = prev.base.moves.map((move) => {
              if (move.name === '멀티어택') {
                return {
                  ...move,
                  type: randomType
                };
              }
              return move;
            });

            return {
              ...prev,
              base: {
                ...prev.base,
                types: [randomType],
                moves: updatedMoves
              }
            };
          })
        }
        addLog(`🔃 ${pokemon.base.name}의 폼이 변화했다!`);
        break;

      case "rank_change":
        if (ability.name === '위협' && !enemyPokemon.base.ability?.util?.includes('intimidate_nullification')) {
          const updatedOpponent = (enemyPokemon: BattlePokemon) => changeRank(enemyPokemon, "attack", -1);
          updatePokemon(opponentSide, activeOpponent, (enemyPokemon) => updatedOpponent(enemyPokemon));
          addLog(`🔃 ${pokemon.base.name}의 등장으로 ${enemyPokemon.base.name}의 공격력이 떨어졌다!`);
        }
        else if (ability.name === '다운로드') {
          console.log(`상대 방어: ${enemyPokemon.base.defense}, 상대 특수방어: ${enemyPokemon.base.spDefense}`);
          if (enemyPokemon.base.defense > enemyPokemon.base.spDefense) {
            const updatedMy = (myPokemon) => changeRank(myPokemon, 'spAttack', 1);
            updatePokemon(side, activeMine, updatedMy);
            addLog(`🔃 상대의 특수방어가 낮아서 ${pokemon.base.name}의 특수공격이 상승했다!`);
          } else if (enemyPokemon.base.defense < enemyPokemon.base.spDefense) {
            const updatedMy = (myPokemon) => changeRank(myPokemon, 'attack', 1);
            updatePokemon(side, activeMine, updatedMy);
            addLog(`🔃 상대의 방어가 낮아서 ${pokemon.base.name}의 공격이 상승했다!`);
          } else {
            const updatedMy = (myPokemon) => changeRank(myPokemon, 'spAttack', 1);
            updatePokemon(side, activeMine, updatedMy);
            addLog(`🔃 상대의 방어와 특수방어가 같아서 ${pokemon.base.name}의 특수공격이 상승했다!`);
          }
        }
        else if (ability.name === "고대활성" && publicEnv.weather === "쾌청") {
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
          addLog(`🔃 ${pokemon.base.name}의 ${bestStat} 능력이 상승했다!`);
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
          addLog(`🔃 ${pokemon.base.name}의 ${bestStat} 능력이 상승했다!`);
        }
        // TODO: 더 추가 
        break;

      case "heal":
        addLog(`➕ ${pokemon.base.name}이 회복 효과를 발동했다!`);
        break;

      case "ability_change":
        // 트레이스
        updatePokemon(side, activeMine, (prev) => ({
          ...prev,
          base: {
            ...prev.base,
            ability: {
              ...enemyPokemon.base.ability,
              name: enemyPokemon.base.ability?.name ?? "Unknown Ability", // Provide a default name
              id: enemyPokemon.base.ability?.id ?? 0, // Ensure 'id' is always defined
            }
          }
        }));
        addLog(`➕ ${pokemon.base.name}의 특성이 ${enemyPokemon.base.ability?.name}으로 변화했다!`);
        if (enemyPokemon.base.ability?.appear) {
          applyAppearance(myPokemon, side)
        }
        break;
    }
  }
  updatePokemon(side, activeMine, (prev) => ({
    ...prev, isFirstTurn: true
  }));
  return logs;
}