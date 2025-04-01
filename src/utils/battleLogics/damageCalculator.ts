import { calculateTypeEffectiveness } from "../typeRalation";
import { MoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { AbilityInfo } from "../../models/Ability";
import { RankState } from "../../models/RankState";
import { calculateAccuracy, calculateCritical, calculateRankEffect } from "./rankEffect";
import { applyStatusEffectBefore } from "./statusEffect";
import { useBattleStore } from "../../Context/useBattleStore";
import { calculateTypeEffectivenessWithAbility, isTypeImmune } from "./calculateTypeEffectiveness";
import { hasAbility } from "./helpers";
import { applyDefensiveAbilityEffectBeforeDamage, applyOffensiveAbilityEffectBeforeDamage } from "./applyBeforeDamage";
import { changeHp, useMovePP } from "./updateBattlePokemon";
import { applyAfterDamage } from "./applyAfterDamage";
import { BattlePokemon } from "../../Context/BattlePokemon";

type ItemInfo = {
  id: number;
  name: string;
};

// 메인 데미지 계산 함수
export async function calculateMoveDamage({
  moveName,
  side,
  isAlwaysHit,
  additinalDamage
}: {
  moveName: string;
  side: string;
  isAlwaysHit?: boolean;
  additinalDamage?: number;
}) {
  // 데이터 가져오기
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    publicEnv
  } = useBattleStore.getState();
  // side에 따라 공격 시전자와 피격자가 달라짐. 
  const attacker: BattlePokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const deffender: BattlePokemon = side === 'enemy' ? enemyTeam[activeEnemy] : myTeam[activeMy];
  const myPokemon: PokemonInfo = side === 'my' ? myTeam[activeMy].base : enemyTeam[activeEnemy].base;
  const aiPokemon: PokemonInfo = side === 'enemy' ? enemyTeam[activeEnemy].base : myTeam[activeMy].base;
  const moveInfo: MoveInfo = getMoveInfo(myPokemon, moveName);
  const weatherEffect = publicEnv.weather;
  const filedEffect = publicEnv.field;
  const disasterEffect = publicEnv.disaster;

  // 초기 변수 설정
  let types = 1; // 타입 상성 배율
  let power = moveInfo.power + (additinalDamage ?? 0); // 기술 위력. 추가위력 있는 기술은 숫자 넣기. 
  let accRate = 1; // 기본 명중율 배율 (복안 1.3, 승리의별 1.1), 곱해서 적용
  let criRate = 0; // 급소율 배율 (대운 -> 1), 더해서 적용 
  let rate = 1; // 데미지 배율
  let isHit = false; // 공격 적중 여부
  let isCritical = false; // 공격 급소 여부
  let wasEffective = false; // 약점 효과 여부
  let message: string | null = null;
  let myPokeRank = myPokemon.rank;
  let opPokeRank = aiPokemon.rank;
  let myPokeStatus = myPokemon.status;
  // 공격, 방어 스탯 결정
  let attackStat = moveInfo.category === '물리' ? myPokemon.attack : myPokemon.spAttack;
  let defenseStat = moveInfo.category === '물리' ? aiPokemon.defense : aiPokemon.spDefense;

  // 1. 상대 포켓몬 타입 설정
  let opponentType = [...aiPokemon.types];

  // 2. 타입 무효 특성 처리
  if (myPokemon.ability && hasAbility(myPokemon.ability, ['배짱', '심안'])) {
    opponentType = opponentType.filter((type) => !isTypeImmune(type, moveInfo.type)); // 무효화하지 않는 타입만 남겨놓음 
  }

  // 3. 특성 무시 특성 처리
  if (myPokemon.ability && hasAbility(myPokemon.ability, ['틀깨기', '터보블레이즈', '테라볼티지'])) {
    aiPokemon.ability = null; // 상대 특성 무효 처리. 실제 특성 메모리엔 영향 x.
    // damage_nullification_abilities
  }

  // 4. 타입 상성 계산
  types = calculateTypeEffectivenessWithAbility(myPokemon, aiPokemon, moveInfo);
  // 상대가 타입 상성 무효화 특성 있을 경우 미리 적용 
  if (aiPokemon.ability?.defensive?.forEach((category: string) => {
    if (category === 'damage_nullification') {
      types = applyDefensiveAbilityEffectBeforeDamage(moveInfo);
    }
  }))
    if (types >= 2) { wasEffective = true };

  // 5-1. 날씨 효과 적용
  if (weatherEffect) { // 날씨 있을 때만 
    if (weatherEffect === '모래바람') {
      if (aiPokemon.types.includes('바위') && moveInfo.category === '특수') { // 날씨가 모래바람이고 상대가 바위타입일 경우
        rate *= 2 / 3;
      } else { rate *= 1 }
    } else if (weatherEffect === '싸라기눈') {
      if (aiPokemon.types.includes('얼음') && moveInfo.category === '물리') { // 날씨가 싸라기눈이고 상대가 얼음타입일 경우 
        rate *= 2 / 3;
      } else { rate *= 1 }
    }
  }

  // 5-2. 필드 효과 적용
  if (filedEffect && !myPokemon.types.some((v) => v === '비행') && !(myPokemon.ability?.name === '부유')) {
    // 필드가 깔려있고, 내 포켓몬이 땅에 있는 포켓몬일 때 
    if (filedEffect === '그래스필드') {
      if (moveInfo.type === '풀') {
        rate *= 1.3;
      } else if ((moveInfo.name === '지진') || (moveInfo.name === '땅고르기') || (moveInfo.name === '지진')) {
        rate *= 0.5;
      }
    } else if (filedEffect === '사이코필드') {
      if (moveInfo.type === '에스퍼') {
        rate *= 1.3;
      }
    } else if (filedEffect === '일렉트릭필드') {
      if (moveInfo.type === '전기') {
        rate *= 1.3;
      }
    }
  }

  // 5-3. 재앙 효과 적용
  if (disasterEffect) {
    if (disasterEffect.includes('재앙의검') && moveInfo.category === '물리') {
      defenseStat *= 0.75;
    } else if (disasterEffect.includes('재앙의구슬') && moveInfo.category === '특수') {
      defenseStat *= 0.75;
    } else if (disasterEffect.includes('재앙의그릇') && moveInfo.category === '특수') {
      attackStat *= 0.75;
    } else if (disasterEffect.includes('재앙의목간') && moveInfo.category === '물리') {
      attackStat *= 0.75;
    }
  }

  // 6. 공격 관련 특성 적용 (배율)
  rate *= applyOffensiveAbilityEffectBeforeDamage(moveInfo);

  // 7. 상대 방어 특성 적용 (배율)
  // 만약 위에서 이미 types가 0이더라도, 나중에 곱하면 어차피 0 돼서 상관없음.
  rate *= applyDefensiveAbilityEffectBeforeDamage(moveInfo);

  // 11. 상태이상 확인
  if (myPokeStatus) {
    const statusResult = applyStatusEffectBefore(myPokeStatus, rate, moveInfo);
    rate = statusResult.rate; // 화상 적용 
    isHit = statusResult.isHit; // 공격 성공 여부 (풀죽음, 마비, 헤롱헤롱, 얼음, 잠듦 등)
  }

  // 12. 명중률 계산
  if (isAlwaysHit) { // 연속기 사용 시 
    isHit = true;
  } else {
    const hitSuccess = calculateAccuracy(accRate, moveInfo.accuracy, myPokeRank?.accuracy ?? 0, opPokeRank?.dodge ?? 0);
    if (!hitSuccess) {
      isHit = false;
      return { success: false, message: '공격이 빗나갔다!' };
    } else {
      isHit = true;
    }
  }

  // 13. 급소 적용
  if (myPokemon.ability?.name == '무모한행동' && aiPokemon.status?.some((v) => v === '독' || v === '맹독')) {
    isCritical = true;
  }
  if (aiPokemon.ability?.name === '전투무장' || aiPokemon.ability?.name === '조가비갑옷') {
    criRate = 0;
    isCritical = false; // 무조건 급소 안 맞음 
  }
  isCritical = calculateCritical(moveInfo.criticalRate + criRate, myPokemon.ability, myPokeRank?.critical ?? 0);

  if (isCritical && myPokemon.ability?.name === '스나이퍼') {
    rate *= 2; // 스나이퍼는 급소 데미지 2배
  } else if (isCritical) {
    rate *= 1.5 // 그 외에는 1.5배 
  }

  // 13. 데미지 계산

  // 랭크 적용 
  if (myPokeRank) {
    attackStat *= calculateRankEffect(myPokeRank.attack);
  }
  if (opPokeRank) {
    defenseStat *= calculateRankEffect(opPokeRank.defense);
  }
  // 내구력 계산
  const durability = defenseStat * aiPokemon.hp * aiPokemon.level * 0.00822;

  // 결정력 계산
  const effectiveness = attackStat * power * rate * types;

  // 최종 데미지 계산 (내구력 비율 기반)
  const damage = Math.round((effectiveness * aiPokemon.hp) / durability); // 소수점 반올림 
  // •	상대 내구력: 20,000
  // •	결정력: 50,000
  // •	상대 체력: 100
  //   계산
  // •	effectiveness / durability = 50,000 / 20,000 = 2.5
  // •	최종 데미지 = 2.5 × 100 = 250

  // 14. 최종적으로 데미지 줬는지 여부 계산
  if (types === 0 || rate === 0) {
    isHit = false;
    return { success: false, message: '효과가 없었다!' }
  }

  if (!isHit) {
    return { success: false }
  }

  // 15. 데미지 적용 및 이후 함수 적용
  if (isHit) {
    // 데미지 적용
    changeHp(enemyTeam[activeEnemy], damage);
    // 데미지 적용 이후 함수 ㅣ
    applyAfterDamage(attacker, deffender, moveInfo, damage);
    useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔'); // pp 깎기 
    return { success: true, damage, wasEffective };
  }
}

function getMoveInfo(myPokemon: PokemonInfo, moveName: string): MoveInfo {
  let outputMove: MoveInfo | null = null;
  myPokemon.moves.forEach((v) => {
    if (moveName === v.name) {
      outputMove = v
    }
  })
  if (!outputMove) {
    throw new Error(`Move with name: ${moveName} not found.`);
  }
  return outputMove as MoveInfo;
}