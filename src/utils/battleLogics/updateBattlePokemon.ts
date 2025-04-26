import { BattlePokemon } from "../../models/BattlePokemon";
import { AbilityInfo } from "../../models/Ability";
import { RankManager, RankState } from "../../models/RankState";
import { StatusManager, StatusState } from "../../models/Status";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { mainStatusCondition, unMainStatusConditionWithDuration } from "./switchPokemon";
import { useDurationStore } from "../../Context/useDurationContext";

// 체력 변화
export function changeHp(pokemon: BattlePokemon, amount: number): BattlePokemon {
  const { addLog } = useBattleStore.getState();
  const newHp = Math.round(Math.max(0, pokemon.currentHp + amount));
  const result = { ...pokemon, currentHp: Math.min(pokemon.base.hp, newHp) };

  if (result.currentHp <= 0) {
    addLog(`😭 ${pokemon.base.name}은/는 쓰러졌다!`);
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
  if (pokemon.base.ability?.name === '하얀연기' || pokemon.base.ability?.name === '클리어바디' || pokemon.base.ability?.name === '메탈프로텍트') {
    return { ...pokemon };
  }
  if (pokemon.base.ability?.name === '하얀연기' && (stat === 'defense' || stat === 'spDefense')) {
    return { ...pokemon };
  }
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
      manager.increaseState('attack', 2);
      manager.decreaseState(stat as keyof RankState, Math.abs(amount));
    }
  }
  else if (pokemon.base.ability?.name === '승기') {
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
type UnMainStatus = typeof unMainStatusConditionWithDuration[number];
type DurationStatus = UnMainStatus | '잠듦';

// 지속 시간 맵
const durationMap: Record<DurationStatus, number> = {
  도발: 3,
  트집: 3,
  풀죽음: 1,
  사슬묶기: 4,
  회복봉인: 5,
  앵콜: 3,
  소리기술사용불가: 2,
  하품: 2,
  혼란: Math.floor((Math.random() * 3) + 2), // 2~4턴
  교체불가: 4,
  조이기: 4,
  멸망의노래: 3,
  잠듦: 3,
};

export function addStatus(
  pokemon: BattlePokemon,
  status: StatusState,
  side: 'my' | 'enemy',
  nullification?: boolean
): BattlePokemon {
  const { publicEnv, addLog } = useBattleStore.getState();
  const { addEffect } = useDurationStore.getState();

  const mentalStatusCondition = ['도발', '트집', '사슬묶기', '회복봉인', '헤롱헤롱', '앵콜'];

  // 면역 특성, 타입, 날씨 등에 따른 무효화 체크
  if (
    (status === '독' || status === '맹독') &&
    (!nullification && (pokemon.base.ability?.name === '면역' || pokemon.base.types.includes('독') || pokemon.base.types.includes('강철')))
  ) return { ...pokemon };

  if (status === '교체불가' && pokemon.base.types.includes('고스트')) return { ...pokemon };
  if ((status === '도발' || status === '헤롱헤롱') && pokemon.base.ability?.name === '둔감') return { ...pokemon };
  if (status === '마비' && (pokemon.base.ability?.name === '유연' || pokemon.base.types.includes('전기'))) return { ...pokemon };
  if (status === '화상' && (pokemon.base.ability?.name === '수의베일' || pokemon.base.ability?.name === '수포' || pokemon.base.types.includes('불'))) return { ...pokemon };
  if (status === '잠듦' && (pokemon.base.ability?.name === '불면' || pokemon.base.ability?.name === '의기양양' || pokemon.base.ability?.name === '스위트베일')) return { ...pokemon };
  if (status === '얼음' && (pokemon.base.ability?.name === '마그마의무장' || pokemon.base.types.includes('얼음'))) return { ...pokemon };
  if (mentalStatusCondition.includes(status) && pokemon.base.ability?.name === '아로마베일') return { ...pokemon };
  if (publicEnv.weather === '쾌청' && pokemon.base.ability?.name === '리프가드' && mainStatusCondition.includes(status)) return { ...pokemon };
  if (pokemon.base.ability?.name === '플라워베일' && pokemon.base.types.includes('풀') && mainStatusCondition.includes(status)) return { ...pokemon };

  // ✅ 정상적으로 상태이상 부여
  const manager = new StatusManager(pokemon.status);
  manager.addStatus(status);
  console.log(`${pokemon.base.name}은 ${status} 상태에 빠졌다!`);
  addLog(`🍄 ${pokemon.base.name}은 ${status} 상태에 빠졌다!`);

  // ✅ duration이 필요한 상태라면 지속 효과도 추가
  if (isDurationStatus(status)) {
    const activeIndex = side === 'my' ? useBattleStore.getState().activeMy : useBattleStore.getState().activeEnemy;
    addEffect(side, {
      name: status as DurationStatus,
      remainingTurn: durationMap[status as DurationStatus],
      ownerIndex: activeIndex,
    });
  }

  // ✅ 싱크로 특성 발동
  if (pokemon.base.ability?.name === '싱크로') {
    const { myTeam, enemyTeam, activeMy, activeEnemy, updatePokemon } = useBattleStore.getState();
    const opponentSide = side === 'my' ? 'enemy' : 'my';
    const activeOpponent = side === 'my' ? activeEnemy : activeMy;
    const opponentPokemon = opponentSide === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
    if (opponentPokemon.base.ability?.name !== '싱크로') {
      console.log(`${pokemon.base.name}의 싱크로 발동!`);
      addLog(`${pokemon.base.name}의 싱크로 발동!`);
      updatePokemon(opponentSide, activeOpponent, (opponentPokemon) => addStatus(opponentPokemon, status, opponentSide));
    }
  }

  return { ...pokemon, status: manager.getStatus() };
}

// 🔥 추가: 어떤 상태가 지속 상태인지 체크하는 헬퍼 함수
function isDurationStatus(status: StatusState): status is DurationStatus {
  return (unMainStatusConditionWithDuration as readonly string[]).includes(status) || status === '잠듦';
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
export function setLockedMove(pokemon: BattlePokemon, moveInfo: MoveInfo | null): BattlePokemon {
  return { ...pokemon, lockedMove: moveInfo ?? undefined };
}

// 위치 변경 (구멍파기, 공중날기 등)
export function changePosition(
  pokemon: BattlePokemon,
  position: '땅' | '하늘' | '바다' | '공허' | null
): BattlePokemon {
  return { ...pokemon, position };
}

// 보호 상태 설정
export function setProtecting(pokemon: BattlePokemon, isProtecting: boolean): BattlePokemon {
  return { ...pokemon, isProtecting };
}

// 사용한 기술 기록
export function setUsedMove(pokemon: BattlePokemon, move: MoveInfo | null): BattlePokemon {
  return { ...pokemon, usedMove: move ?? undefined };
}

// 빗나감 여부 설정
export function setHadMissed(pokemon: BattlePokemon, hadMissed: boolean): BattlePokemon {
  return { ...pokemon, hadMissed };
}

// 랭크업 여부 설정
export function setHadRankUp(pokemon: BattlePokemon, hadRankUp: boolean): BattlePokemon {
  return { ...pokemon, hadRankUp };
}

// 차징 여부 설정
export function setCharging(pokemon: BattlePokemon, isCharging: boolean, move?: MoveInfo): BattlePokemon {
  return {
    ...pokemon,
    isCharging,
    chargingMove: isCharging ? move ?? undefined : undefined,
  };
}

// 받은 데미지 기록
export function setReceivedDamage(pokemon: BattlePokemon, damage: number): BattlePokemon {
  return { ...pokemon, receivedDamage: damage };
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
    tempType: pokemon.base.types, // 임시 타입 저장
    base: {
      ...pokemon.base,
      types: types, // 빈 배열 넣으면 사실상 타입 사라지게 함.
    },
  };
}

// 타입 강제 삭제 함수 
export function removeTypes(pokemon: BattlePokemon, type: string, isNormal?: boolean): BattlePokemon {
  // 날개쉬기는 isNormal이 true여야 함.
  return {
    ...pokemon,
    tempType: pokemon.base.types, // 임시 타입 저장
    base: {
      ...pokemon.base,
      types: isNormal ? (['노말', ...pokemon.base.types.filter((t) => t != type)]) : (pokemon.base.types.filter((t) => t != type) ?? [])
    }
  }
}

// 전투 관련 일시적 상태값 리셋
export function resetState(pokemon: BattlePokemon, isSwitch?: boolean): BattlePokemon {
  const baseReset = { // 매 턴 끝날 때마다 리셋되는 것 
    ...pokemon,
    isProtecting: false,
    hadRankUp: false,
    receivedDamage: 0,
    isFirstTurn: false,
  };

  if (isSwitch) {
    return {
      ...baseReset,
      base: {
        ...pokemon.base,
        types: pokemon.tempType && pokemon.tempType.length > 0 ? pokemon.tempType : pokemon.base.types // 타입 사라진 상태였으면 리셋.
      },
      usedMove: undefined,
      isCharging: false,
      chargingMove: undefined,
      lockedMove: undefined,
      hadMissed: false,
      lockedMoveTurn: 0,
      tempType: [],
    };
  }

  return baseReset;
}