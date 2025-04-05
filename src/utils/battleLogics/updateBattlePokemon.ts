import { BattlePokemon } from "../../models/BattlePokemon";
import { AbilityInfo } from "../../models/Ability";
import { RankManager, RankState } from "../../models/RankState";
import { StatusManager, StatusState } from "../../models/Status";
import { useBattleStore } from "../../Context/useBattleStore";

// 체력 변화
export function changeHp(pokemon: BattlePokemon, amount: number): BattlePokemon {
  const { addLog } = useBattleStore.getState();
  const newHp = Math.round(Math.max(0, pokemon.currentHp + amount));
  const result = { ...pokemon, currentHp: Math.min(pokemon.base.hp, newHp) };

  if (result.currentHp <= 0) {
    addLog(`${pokemon.base.name}은/는 쓰러졌다!`);
    console.log(`${pokemon.base.name}은/는 쓰러졌다! (currentHp: ${result.currentHp})`);
  } else {
    console.log(`${pokemon.base.name}의 남은 (currentHp: ${result.currentHp})`);
  }

  return result;
}

// 랭크 변경
export function changeRank(
  pokemon: BattlePokemon,
  stat: keyof RankState,
  amount: number
): BattlePokemon {
  const manager = new RankManager(JSON.parse(JSON.stringify(pokemon.rank))); // 💡 깊은 복사
  if (pokemon.base.ability?.name === '심술꾸러기') {
    if (amount > 0) {
      manager.decreaseState(stat as keyof RankState, amount);
    } else {
      manager.increaseState(stat as keyof RankState, Math.abs(amount));
    }
  } else if (pokemon.base.ability?.name === '오기') {
    if (amount > 0) {
      manager.increaseState(stat as keyof RankState, amount);
    } else {
      manager.increaseState('spAttack', 2);
      manager.decreaseState(stat as keyof RankState, Math.abs(amount));
    }
  }
  else if (amount > 0) {
    manager.increaseState(stat as keyof RankState, amount);
  } else {
    manager.decreaseState(stat as keyof RankState, Math.abs(amount));
  }
  return { ...pokemon, rank: manager.getState() };
}

// 랭크 초기화
export function resetRank(pokemon: BattlePokemon): BattlePokemon {
  const manager = new RankManager(pokemon.rank);
  manager.resetState();
  return { ...pokemon, rank: manager.getState() };
}

// 상태이상 추가
export function addStatus(pokemon: BattlePokemon, status: StatusState): BattlePokemon {
  const mainStatusCondition = ['화상', '마비', '잠듦', '얼음', '독', '맹독']; // 주요 상태이상
  const unMainStatusCondition = ['도발', '트집', '사슬묶기', '회복봉인', '헤롱헤롱', '앵콜']
  const { publicEnv } = useBattleStore.getState();
  if (status === '독' || status === '맹독') {
    if (pokemon.base.ability?.name === '면역' || pokemon.base.types.includes('독') || pokemon.base.types.includes('강철')) {
      return { ...pokemon };
    }
  }

  if ((status === '도발' || status === '헤롱헤롱') &&
    pokemon.base.ability?.name === '둔감') {
    return { ...pokemon };
  }
  if (status === '마비' && (pokemon.base.ability?.name === '유연' || pokemon.base.types.includes('전기'))) { return { ...pokemon }; }
  if (status === '화상') {
    if (pokemon.base.ability?.name === '수의베일' || pokemon.base.ability?.name === '수포' || pokemon.base.types.includes('불')) {
      { return { ...pokemon }; }
    }
  }
  if (status === '잠듦') {
    if (pokemon.base.ability?.name === '불면' || pokemon.base.ability?.name === '의기양양' || pokemon.base.ability?.name === '스위트베일') {
      { return { ...pokemon }; }
    }
  }
  if (status === '얼음' && (pokemon.base.ability?.name === '마그마의무장' || pokemon.base.types.includes('얼음'))) {
    { return { ...pokemon }; }
  }
  if (unMainStatusCondition.some((s) => s === status) && pokemon.base.ability?.name === '아로마베일') {
    { return { ...pokemon }; }
  }
  if (publicEnv.weather === '쾌청' && pokemon.base.ability?.name === '리프가드') {
    if (mainStatusCondition.some((s) => s === status)) { return { ...pokemon }; }
  }

  const manager = new StatusManager(pokemon.status);
  manager.addStatus(status);
  return { ...pokemon, status: manager.getStatus() };
}

// 상태이상 제거
export function removeStatus(pokemon: BattlePokemon, status: StatusState): BattlePokemon {
  const manager = new StatusManager(pokemon.status);
  manager.removeStatus(status);
  return { ...pokemon, status: manager.getStatus() };
}

// 전체 상태이상 제거
export function clearAllStatus(pokemon: BattlePokemon): BattlePokemon {
  const manager = new StatusManager(pokemon.status);
  manager.clearStatus();
  return { ...pokemon, status: manager.getStatus() };
}

// 상태이상 확인
export function hasStatus(pokemon: BattlePokemon, status: StatusState): boolean {
  const manager = new StatusManager(pokemon.status);
  return manager.hasStatus(status);
}

// 기술 사용 시 PP 차감
export function useMovePP(pokemon: BattlePokemon, moveName: string, pressure?: boolean): BattlePokemon {
  let newPP = { ...pokemon.pp };
  if (newPP[moveName] > 0) {
    if (!pressure) {
      newPP[moveName] -= 1;
    } else {
      newPP[moveName] -= 2; // 프레셔 있을 경우 -2 
      // TODO: pp가 -1이 되면 0으로 클램핑. 
    }
  }
  if (newPP[moveName] < 0) {
    newPP[moveName] += 1;
  }
  return { ...pokemon, pp: newPP };
}

// 기술 고정 (구애스카프 등)
export function lockMove(pokemon: BattlePokemon, moveName: string): BattlePokemon {
  return { ...pokemon, lockedMove: moveName };
}

// 위치 변경 (구멍파기, 공중날기 등)
export function changePosition(
  pokemon: BattlePokemon,
  position: '땅' | '하늘' | '바다' | null
): BattlePokemon {
  return { ...pokemon, position };
}

// 전투 출전 여부 설정
export function setActive(pokemon: BattlePokemon, isActive: boolean): BattlePokemon {
  return { ...pokemon, isActive };
}

// 특성 강제 변경 함수
export function setAbility(pokemon: BattlePokemon, ability: AbilityInfo | null): BattlePokemon {
  return {
    ...pokemon,
    base: {
      ...pokemon.base,
      ability: ability, // null도 가능
    },
  };
}

// 타입 강제 변경 함수 
export function setTypes(pokemon: BattlePokemon, types: string[]): BattlePokemon {
  return {
    ...pokemon,
    base: {
      ...pokemon.base,
      types: types, // 빈 배열 넣으면 사실상 타입 사라지게 함.
    },
  };
}
