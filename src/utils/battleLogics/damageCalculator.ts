import { getWeatherEffect, WeatherEffect } from "./weatherEffects";
import { calculateTypeEffectiveness } from "../typeRalation";
import { MoveInfo } from "../../models/Move";
import { applyDefensiveAbilityEffect, applyOffensiveAbilityEffect } from "./abilityEffect";
import { PokemonInfo } from "../../models/Pokemon";
import { AbilityInfo } from "../../models/Ability";
import { RankState } from "../../models/RankState";
import { getMoveInfo } from "../../models/Move";
import { calculateAccuracy, calculateCritical, calculateRankEffect } from "./rankEffect";
import { applyStatusEffect } from "./statusEffect";

type ItemInfo = {
  id: number;
  name: string;
};

// 메인 데미지 계산 함수
async function calculateMoveDamage({
  myEntityID,
  opponentEntityID,
  myMoveName,
  myItemNum,
  weather,
}: {
  myEntityID: string;
  opponentEntityID: string;
  myMoveName: string;
  myItemNum?: number;
  weather?: string;
}) {
  // 데이터 가져오기
  const myPokemon: PokemonInfo = await getMyPokemonInfo(myEntityID);
  const opponentPokemon: PokemonInfo = await getOpponentPokemonInfo(opponentEntityID);
  const moveInfo: MoveInfo = await getMoveInfo(myMoveName);
  const itemInfo: ItemInfo | null = myItemNum ? await getItemInfo(myItemNum) : null;
  const weatherEffect: WeatherEffect | null = weather ? await getWeatherEffect(weather, moveInfo.type, opponentPokemon.types) : null;

  // 초기 변수 설정
  let types = 1; // 타입 상성 배율
  let power = moveInfo.power; // 기술 위력
  let accRate = 1; // 명중율 배율 (복안 등)
  let dodgeRate = 1; // 회피율 배율 (모래숨기, 눈숨기 등)
  let criRate = 1; // 급소율 배율 (대운 등)
  let rate = 1; // 데미지 배율
  let isHit = false; // 공격 적중 여부
  let isCritical = false; // 공격 급소 여부
  let wasEffective = false; // 약점 효과 여부
  let message: string | null = null;
  let myPokeRank = myPokemon.rank;
  let opPokeRank = opponentPokemon.rank;
  let myPokeStatus = myPokemon.status

  // 1. 상대 포켓몬 타입 설정
  let opponentType = [...opponentPokemon.types];

  // 2. 타입 무효 특성 처리
  if (myPokemon.ability && hasAbility(myPokemon.ability, ['배짱', '심안'])) {
    opponentType = opponentType.filter((type) => !isImmune(type, moveInfo.type)); // 무효화하지 않는 타입만 남겨놓음 
  }

  // 3. 타입 상성 계산
  types = calculateTypeEffectiveness(moveInfo.type, opponentType);
  if (types >= 1.4) { wasEffective = true };

  // 4. 특성 무시 특성 처리
  if (myPokemon.ability && hasAbility(myPokemon.ability, ['틀깨기', '터보블레이즈', '테라볼티지'])) {
    opponentPokemon.ability = null; // 상대 특성 무효 처리 
    // damage_nullification_abilities
  }

  // 5. 상대 포켓몬의 방어적 타입 관련 특성 확인 (부유, 건조피부, 두꺼운지방 등) 
  types *= applyDefensiveAbilityEffect(opponentPokemon, moveInfo);

  // 10. 날씨 효과 적용
  if (weatherEffect) { // 날씨 있을 때만 
    if (weatherEffect.type === '바위') {
      if (opponentPokemon.types.includes('바위') && moveInfo.category === '특수') { // 날씨가 모래바람이고 상대가 바위타입일 경우
        rate *= weatherEffect.multiplier;
      } else { rate *= 1 }
    } else if (weatherEffect.type === '얼음') {
      if (opponentPokemon.types.includes('얼음') && moveInfo.category === '물리') { // 날씨가 싸라기눈이고 상대가 얼음타입일 경우 
        rate *= weatherEffect.multiplier;
      } else { rate }
    }
    rate *= weatherEffect.multiplier;
  }

  // 7. 공격 관련 특성 적용 (배율)
  rate *= applyOffensiveAbilityEffect(myPokemon, moveInfo);
  /// 7-1. 공격 관련 특성 적용 (배율)
  rate *= applyOffensiveAbilityEffect(myPokemon, moveInfo);

  // 8. 상대 방어 특성 적용
  rate *= applyDefensiveAbilityEffect(opponentPokemon, moveInfo);

  // 9. 아이템 효과 적용
  if (itemInfo) {
    rate *= applyItemEffect(myPokemon, itemInfo, moveInfo);
  }

  // 11. 상태이상 확인
  const statusResult = applyStatusEffect(myPokeStatus, rate);
  rate = statusResult.rate; // 화상 등 적용 
  message = statusResult.message;

  // 공격 실패 처리
  if (!isHit) {
    return { success: false, message };
  }

  // 12. 명중률 계산
  const hitSuccess = calculateAccuracy(accRate, dodgeRate, moveInfo.accuracy, myPokeRank?.accuracy ?? 0, opPokeRank?.dodge ?? 0);
  if (!hitSuccess) {
    return { success: false, message: '공격이 빗나갔다!' };
  }

  // 13. 급소 적용
  if (myPokemon.ability?.name == '무모한행동' && opponentPokemon.status?.forEach(v => v.name === '독')) {
    isCritical = true;
  }
  isCritical = calculateCritical(moveInfo.criticalRate, myPokemon.ability, myPokeRank?.critical ?? 0);

  if (opponentPokemon.ability?.name === '전투무장' || opponentPokemon.ability?.name === '조가비갑옷') {
    isCritical = false; // 무조건 급소 안 맞음 
  }

  if (isCritical && myPokemon.ability?.name === '스나이퍼') {
    rate *= 2; // 스나이퍼는 급소 데미지 2배
  } else if (isCritical) {
    rate *= 1.5 // 그 외에는 1.5배 
  }

  // 13. 데미지 계산
  // 공격, 방어 스탯 결정
  let attackStat = moveInfo.category === '물리' ? myPokemon.attack : myPokemon.spAttack;
  let defenseStat = moveInfo.category === '물리' ? opponentPokemon.defense : opponentPokemon.spDefense;

  // 랭크 적용 
  if (myPokeRank) {
    attackStat *= calculateRankEffect(myPokeRank.attack);
  }
  if (opPokeRank) {
    defenseStat *= calculateRankEffect(opPokeRank.defense);
  }
  // 내구력 계산
  const durability = defenseStat * opponentPokemon.hp * opponentPokemon.level * 0.00822;

  // 결정력 계산
  const effectiveness = attackStat * power * rate * types;

  // 최종 데미지 계산 (내구력 비율 기반)
  const damage = Math.round((effectiveness / durability) * opponentPokemon.hp); // 소수점 반올림 
  // •	상대 내구력: 20,000
  // •	결정력: 50,000
  // •	상대 체력: 100
  //   계산
  // •	effectiveness / durability = 50,000 / 20,000 = 2.5
  // •	최종 데미지 = 2.5 × 100 = 250

  // 부유, 타오르는불꽃, 방탄 등의 특성이 적용됐을 경우 
  if (types === 0) {
    return { success: false, message: '효과가 없었다!' }
  }

  return { success: true, damage, wasEffective };
}

// 유틸리티 함수들 (간략화된 예제)
async function getMyPokemonInfo(entityID: string): Promise<PokemonInfo> {
  // 포켓몬 정보 가져오는 로직
  return {} as PokemonInfo;
}

async function getOpponentPokemonInfo(entityID: string): Promise<PokemonInfo> {
  // 상대 포켓몬 정보 가져오는 로직
  return {} as PokemonInfo;
}

async function getItemInfo(itemNum: number): Promise<ItemInfo> {
  // 아이템 정보 가져오는 로직
  return {} as ItemInfo;
}

function hasAbility(ability: AbilityInfo, target: string[]): boolean {
  return target.some(item => ability.name === item);
}

function isImmune(targetType: string, moveType: string): boolean {
  // 타입 무효 확인 로직
  if (moveType === '노말' && targetType === '고스트') {
    return true;
  } else if (moveType === '고스트' && targetType === '노말') {
    return true;
  } else if (moveType === '전기' && targetType === '땅') {
    return true;
  } else if (moveType === '독' && targetType === '강철') {
    return true;
  } else if (moveType === '격투' && targetType === '고스트') {
    return true;
  } else if (moveType === '땅' && targetType === '비행') {
    return true;
  } else if (moveType === '드래곤' && targetType === '페어리') {
    return true;
  } else return false;
}

function applyItemEffect(pokemon: PokemonInfo, item: ItemInfo, move: MoveInfo): number {
  // 아이템 효과 계산
  return 1;
}

async function calculateThrowingDamage({
  myEntityID,
  opponentEntityID,
  myItemNum,
  //weather,
  myPokeRank,
  opPokeRank,
  myPokeStatus,
}: {
  myEntityID: string;
  opponentEntityID: string;
  myMoveName: number;
  myItemNum?: number;
  weather?: string;
  myPokeRank?: RankState;
  opPokeRank?: RankState;
  myPokeStatus?: string;
}) {

}