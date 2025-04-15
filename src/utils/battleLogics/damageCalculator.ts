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
import { addStatus, changeHp, changeRank, setAbility, setTypes, useMovePP } from "./updateBattlePokemon";
import { BattlePokemon } from "../../models/BattlePokemon";
import { addTrap, setField, setRoom, setWeather } from "./updateEnvironment";
import { WeatherType } from "../../models/Weather";

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
  side: 'my' | 'enemy';
  isAlwaysHit?: boolean;
  additinalDamage?: number;
}) {
  // 데이터 가져오기
  const {
    myTeam,
    enemyTeam,
    activeMy,
    activeEnemy,
    publicEnv,
    updatePokemon,
    addLog
  } = useBattleStore.getState();
  // side에 따라 공격 시전자와 피격자가 달라짐. 
  const attacker: BattlePokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const deffender: BattlePokemon = side === 'enemy' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const myPokemon: PokemonInfo = side === 'my' ? myTeam[activeMy].base : enemyTeam[activeEnemy].base;
  const opponentPokemon: PokemonInfo = side === 'enemy' ? myTeam[activeMy].base : enemyTeam[activeEnemy].base;
  const moveInfo: MoveInfo = getMoveInfo(myPokemon, moveName);
  const weatherEffect = publicEnv.weather;
  const filedEffect = publicEnv.field;
  const disasterEffect = publicEnv.disaster;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;

  // 초기 변수 설정
  let types = 1; // 타입 상성 배율
  let power = moveInfo.power + (additinalDamage ?? 0); // 기술 위력. 추가위력 있는 기술은 숫자 넣기. 
  let accRate = 1; // 기본 명중율 배율 (복안 1.3, 승리의별 1.1), 곱해서 적용
  let criRate = 0; // 급소율 배율 (대운 -> 1), 더해서 적용 
  let rate = 1; // 데미지 배율
  let isHit = false; // 공격 적중 여부
  let isCritical = false; // 공격 급소 여부
  let wasEffective = 0; // 약점 효과 여부, -1은 별로, 0은 평범, 1은 좋음 
  let wasNull = false; // 공격 무효 여부 
  let message: string | null = null;
  let myPokeRank = attacker.rank;
  let opPokeRank = deffender.rank;
  let myPokeStatus = attacker.status;
  // 공격, 방어 스탯 결정
  let attackStat = moveInfo.category === '물리' ? myPokemon.attack : myPokemon.spAttack;
  if (moveName === '바디프레스') {
    attackStat = myPokemon.defense;
  }
  let defenseStat = moveInfo.category === '물리' ? opponentPokemon.defense : opponentPokemon.spDefense;

  // 0-1. 상태이상 확인
  if (myPokeStatus) {
    const statusResult = applyStatusEffectBefore(myPokeStatus, rate, moveInfo, side);
    rate = statusResult.rate; // 화상 적용 
    if (!statusResult.isHit) {
      addLog(`🚫 ${attacker.base.name}의 기술은 실패했다!`);
      console.log(`${attacker.base.name}의 기술은 실패했다!`);

      return { success: false }; // 바로 함수 종료 
    }; // 공격 성공 여부 (풀죽음, 마비, 헤롱헤롱, 얼음, 잠듦 등)
  }

  // 0-2. 자신에게 거는 기술이나 필드 등에 적용하는 기술 효과 처리 
  if (moveInfo.target === 'self' || moveInfo.target === 'none') {
    console.log('자신에게 거는 기술')
    applyChangeEffect(moveInfo, side)
    isHit = true; // 무조건 적중 처리
    return { success: true }; // 바로 함수 종료
  }

  // 0-3. 차징 기술 차지상태 설정 
  if (moveInfo.chargeTurn) {
    updatePokemon(side, activeMine, (prev) => {
      return {
        ...prev,
        isCharging: true,
        chargingMove: moveInfo,
      };
    });
    addLog(`${attacker.base.name}은(는) 힘을 모으기 시작했다!`);
    return { success: true }; // 공격 안 하고 대기
  }

  // 1. 상대 포켓몬 타입 설정
  let opponentType = [...opponentPokemon.types];

  // 2. 타입 무효 특성 처리
  if (myPokemon.ability && hasAbility(myPokemon.ability, ['배짱', '심안'])) {
    opponentType = opponentType.filter((type) => !isTypeImmune(type, moveInfo.type)); // 무효화하지 않는 타입만 남겨놓음 
  }

  // 3. 특성 무시 특성 처리
  if (myPokemon.ability && hasAbility(myPokemon.ability, ['틀깨기', '터보블레이즈', '테라볼티지'])) {
    opponentPokemon.ability = null; // 상대 특성 무효 처리. 실제 특성 메모리엔 영향 x.
  }

  // 4. 명중률 계산
  if (isAlwaysHit) { // 연속기 사용 시 
    isHit = true;
  } else {
    if (attacker.base.ability?.name === '의욕' && moveInfo.category === '물리') {
      moveInfo.accuracy *= 0.8;
    }
    const hitSuccess = calculateAccuracy(accRate, moveInfo.accuracy, myPokeRank?.accuracy ?? 0, opPokeRank?.dodge ?? 0);
    if (!hitSuccess) {
      isHit = false;
      addLog(`🚫 ${attacker.base.name}의 공격은 빗나갔다!`)
      console.log(`${attacker.base.name}의 공격은 빗나갔다!`)
      // 무릎차기, 점프킥 등 빗나가면 반동.
      let dmg: number;
      moveInfo.demeritEffects?.forEach((d_effect) => {
        if (d_effect.fail) {
          dmg = d_effect.fail;
          updatePokemon(side, activeMine, (attacker) => changeHp(attacker, - (attacker.base.hp * dmg)));
          addLog(`🤕 ${attacker.base.name}은 반동으로 데미지를 입었다...`);
        }
      })
      updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔')); // pp 깎기 
      return; // 행동을 하긴 했으니까, success:false 로 하지는 않음. 
    } else {
      isHit = true;
    }
  }

  // 5-1. 타입 상성 계산

  if (moveInfo.target === 'opponent') { // 상대를 대상으로 하는 기술일 경우 
    // 상대가 타입 상성 무효화 특성 있을 경우 미리 적용 
    if (moveInfo.category === '변화') { // 상대를 때리는 변화기술일 경우 
      if (moveInfo.type === '풀' && opponentPokemon.types.includes('풀')) {
        types *= 0;
      } // 추가 가능 
    } else if (opponentPokemon.ability?.defensive) { // 상대 포켓몬이 방어적 특성 있을 경우 
      opponentPokemon.ability?.defensive?.forEach((category: string) => {
        if (category === 'damage_nullification' || category === 'type_nullification' || category === 'damage_reduction') {
          console.log(`${opponentPokemon.name}의 방어적 특성이 적용되었다!`)
          types *= applyDefensiveAbilityEffectBeforeDamage(moveInfo, side);
        }
      })
    }
    // 마지막에 또 곱해줘도 상관없음. 0이였으면 어차피 0이니까.
    types *= calculateTypeEffectivenessWithAbility(myPokemon, opponentPokemon, moveInfo);
  }

  if (moveInfo.category === '변화' && isHit) { // 변화기술일 경우
    if (types === 0) {
      wasNull = true; addLog(`🚫 ${attacker.base.name}의 공격은 효과가 없었다...`); console.log(`${attacker.base.name}의 공격은 효과가 없었다...`);
      updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔')) // pp 깎기
      return;
    }
    addLog(`🥊 ${side}는 ${moveInfo.name}을/를 사용했다!`);
    console.log(`${side}는 ${moveInfo.name}을/를 사용했다!`);
    updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔')); // pp 깎기 
    return { success: true }; // 변화기술은 성공으로 처리
  }

  addLog(`🥊 ${side}는 ${moveName}을/를 사용했다!`);
  console.log(`${side}는 ${moveName}을/를 사용했다!`);
  if (types >= 2) { wasEffective = 1; addLog(`👍 ${attacker.base.name}의 공격은 효과가 굉장했다!`); console.log(`${attacker.base.name}의 공격은 효과가 굉장했다!`); };
  if (types > 0 && types <= 0.5) {
    wasEffective = -1; addLog(`👎 ${attacker.base.name}의 공격은 효과가 별로였다...`);
    console.log(`${attacker.base.name}의 공격은 효과가 별로였다...`);
  };
  if (types === 0) {
    wasNull = true; addLog(`🚫 ${attacker.base.name}의 공격은 효과가 없었다...`); console.log(`${attacker.base.name}의 공격은 효과가 없었다...`);
    updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔')) // pp 깎기
    // 무릎차기, 점프킥 등 빗나가면 반동.
    let dmg: number;
    moveInfo.demeritEffects?.forEach((d_effect) => {
      if (d_effect.fail) {
        dmg = d_effect.fail;
        updatePokemon(side, activeMine, (attacker) => changeHp(attacker, - (attacker.base.hp * dmg)));
        addLog(`🤕 ${attacker.base.name}은 반동으로 데미지를 입었다...`);
      }
    })

    return;
  }

  // 4-2. 자속보정
  if (myPokemon.types.some((type) => type === moveInfo.type)) {
    if (myPokemon.ability?.name === '적응력') {
      types *= 2;
    } else {
      types *= 1.5;
    }
  }

  // 5-1. 날씨 효과 적용
  if (weatherEffect) { // 날씨 있을 때만 
    if (weatherEffect === '쾌청' && moveInfo.type === '물') {
      rate *= 0.5;
    }
    if (weatherEffect === '비' && moveInfo.type === '불') {
      rate *= 0.5;
    }
    if (weatherEffect === '모래바람') {
      if (opponentPokemon.types.includes('바위') && moveInfo.category === '특수') { // 날씨가 모래바람이고 상대가 바위타입일 경우
        rate *= 2 / 3;
      } else { rate *= 1 }
    } else if (weatherEffect === '싸라기눈') {
      if (opponentPokemon.types.includes('얼음') && moveInfo.category === '물리') { // 날씨가 싸라기눈이고 상대가 얼음타입일 경우 
        rate *= 2 / 3;
      } else { rate *= 1 }
    }
  }

  // 5-2. 필드 효과 적용
  if (filedEffect && !myPokemon.types.some((v) => v === '비행') && !(myPokemon.ability?.name === '부유')) {
    // 필드가 깔려있고, 내 포켓몬이 땅에 있는 포켓몬일 때 
    if (filedEffect === '그래스필드') {
      if (moveInfo.type === '풀') {
        console.log('그래스필드에서 기술이 강화됐다!')
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
  rate *= applyOffensiveAbilityEffectBeforeDamage(moveInfo, side);


  // 7. 상대 방어 특성 적용 (배율)
  // 만약 위에서 이미 types가 0이더라도, 나중에 곱하면 어차피 0 돼서 상관없음.
  rate *= applyDefensiveAbilityEffectBeforeDamage(moveInfo, side);


  // 13. 급소 적용
  if (myPokemon.ability?.name == '무모한행동' && myPokeStatus.some((v) => v === '독' || v === '맹독')) {
    isCritical = true;
  }
  if (opponentPokemon.ability?.name === '전투무장' || opponentPokemon.ability?.name === '조가비갑옷') {
    criRate = 0;
    isCritical = false; // 무조건 급소 안 맞음 
  }
  isCritical = calculateCritical(moveInfo.criticalRate + criRate, myPokemon.ability, myPokeRank?.critical ?? 0);

  if (isCritical && myPokemon.ability?.name === '스나이퍼') {
    rate *= 2.25; // 스나이퍼는 급소 데미지 2배
    myPokeRank.attack = Math.max(0, myPokeRank.attack);
    myPokeRank.spAttack = Math.max(0, myPokeRank.spAttack);
    // 급소 맞출 시에는 내 공격 랭크 다운 무효 
    addLog(`👍 ${moveName}은/는 급소에 맞았다!`);
    console.log(`${moveName}은/는 급소에 맞았다!`);
  } else if (isCritical) {
    rate *= 1.5 // 그 외에는 1.5배 
    myPokeRank.attack = Math.max(0, myPokeRank.attack);
    myPokeRank.spAttack = Math.max(0, myPokeRank.spAttack);
    addLog(`👍 ${moveName}은/는 급소에 맞았다!`);
    console.log(`${moveName}은/는 급소에 맞았다!`);
  }

  // 13. 데미지 계산
  // 공격자가 천진일 때: 상대 방어 랭크 무시, 
  // 피격자가 천진일 때; 공격자 공격 랭크 무시 
  // 랭크 적용 
  if (myPokeRank.attack && moveInfo.category === '물리') {
    if (!(deffender.base.ability?.name === '천진')) {
      if (moveName === '바디프레스') {
        attackStat *= calculateRankEffect(myPokeRank.defense);
        addLog(`${attacker.base.name}의 방어 랭크 변화가 적용되었다!`);
        console.log(`${attacker.base.name}의 방어 랭크 변화가 적용되었다!`);
      } else {
        attackStat *= calculateRankEffect(myPokeRank.attack);
        addLog(`${attacker.base.name}의 공격 랭크 변화가 적용되었다!`);
        console.log(`${attacker.base.name}의 공격 랭크 변화가 적용되었다!`);
      }
    }
  }
  if (myPokeRank.spAttack && moveInfo.category === '특수') {
    if (!(deffender.base.ability?.name === '천진')) {
      attackStat *= calculateRankEffect(myPokeRank.spAttack);
      addLog(`${attacker.base.name}의 특수공격 랭크 변화가 적용되었다!`);
      console.log(`${attacker.base.name}의 특수공격 랭크 변화가 적용되었다!`);
    }
  }
  if (opPokeRank.defense && moveInfo.category === '물리') {
    if (!(attacker.base.ability?.name === '천진') && !(moveInfo.effects?.some((effect) => effect.rank_nullification))) {
      // 공격자가 천진도 아니고, 기술이 랭크업 무시하는 기술도 아닐 경우에만 업데이트. (둘 중 하나라도 만족하면 안함)
      defenseStat *= calculateRankEffect(opPokeRank.defense);
      addLog(`${deffender.base.name}의 방어 랭크 변화가 적용되었다!`);
      console.log(`${deffender.base.name}의 방어 랭크 변화가 적용되었다!`);
    }
  }
  if (opPokeRank.spDefense && moveInfo.category === '특수') {
    if (!(attacker.base.ability?.name === '천진') && !(moveInfo.effects?.some((effect) => effect.rank_nullification))) {
      defenseStat *= calculateRankEffect(opPokeRank.spDefense);
      addLog(`${deffender.base.name}의 특수방어 랭크 변화가 적용되었다!`);
      console.log(`${deffender.base.name}의 특수방어 랭크 변화가 적용되었다!`);
    }
  }
  // 내구력 계산
  const durability = (defenseStat * (opponentPokemon.hp)) / 0.411;
  console.log(`${deffender.base.name}의 내구력: ${durability}`)


  // 결정력 계산
  const effectiveness = attackStat * power * rate * types;
  console.log(`${attacker.base.name}의 결정력: ${effectiveness}`)

  // 최종 데미지 계산 (내구력 비율 기반)
  const damage = Math.min(deffender.currentHp, Math.round((effectiveness / durability) * (opponentPokemon.hp))); // 소수점 반올림 

  if (wasNull) {
    if (moveInfo.effects?.some((effect) => effect.fail)) { // 무릎차기, 점프킥 등 빗나가면 반동.
      let dmg: number;
      moveInfo.effects.forEach((effect) => {
        if (effect.fail) {
          dmg = effect.fail;
        }
      })
      updatePokemon(side, activeMine, (attacker) => changeHp(attacker, - (attacker.base.hp * dmg)));
      addLog(`🤕 ${attacker.base.name}은 반동으로 데미지를 입었다...`);
      console.log(`${attacker.base.name}은 반동으로 데미지를 입었다...`);
    }
    updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔')); // pp 깎기 
    return;
  }

  // 15. 데미지 적용 및 이후 함수 적용
  if (isHit) {
    // 데미지 적용
    if (damage >= deffender.currentHp) { // 쓰러뜨렸을 경우 
      if (attacker.base.ability?.name === '자기과신' || attacker.base.ability?.name === '백의울음') {
        updatePokemon(side, activeMine, (attacker) => changeRank(attacker, 'attack', 1));
      } else if (attacker.base.ability?.name === '흑의울음') {
        updatePokemon(side, activeMine, (attacker) => changeRank(attacker, 'spAttack', 1));
      }
    }
    updatePokemon(opponentSide, activeOpponent, (deffender) => changeHp(deffender, -damage));
    updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveName, deffender.base.ability?.name === '프레셔')); // pp 깎기 
    return { success: true, damage, wasEffective };
  }

}
// 자신에게 거는 기술이나 필드에 거는 기술 등의 변화 기술 효과 처리 함수 
function applyChangeEffect(moveInfo: MoveInfo, side: 'my' | 'enemy', attacker?: PokemonInfo, deffender?: PokemonInfo) {
  const { updatePokemon, activeMy, activeEnemy, addLog, myTeam, enemyTeam } = useBattleStore.getState();
  const activeTeam = side === 'my' ? myTeam : enemyTeam;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  if (moveInfo.category === '변화') {
    if (moveInfo.target === 'self') { // 자신에게 거는 기술일 경우 
      addLog(`🥊 ${side}는 ${moveInfo.name}을/를 사용했다!`);
      console.log(`${side}는 ${moveInfo.name}을/를 사용했다!`);
      moveInfo.effects?.forEach((effect) => {
        if (effect.statChange) { // 랭크업 기술일 경우 
          effect.statChange.forEach((statChange) => {
            updatePokemon(side, activeMine, (attacker) => changeRank(attacker, statChange.stat, statChange.change));
            console.log(`${activeTeam[activeMine].base.name}의 ${statChange.stat}이/가 ${statChange.change}랭크 변했다!`);
            addLog(`🔃 ${activeTeam[activeMine].base.name}의 ${statChange.stat}이/가 ${statChange.change}랭크 변했다!`)
          })
        }
        if (effect.heal && effect.heal > 0) {
          const heal = effect.heal;
          updatePokemon(side, activeMine, (attacker) => changeHp(attacker, attacker.base.hp * heal));
        }
      })
    } else if (moveInfo.target === 'none') { // 필드에 거는 기술일 경우 
      if (moveInfo.trap) { // 독압정, 스텔스록 등 
        addTrap(opponentSide, moveInfo.trap);
        addLog(`🥊 ${side}는 ${moveInfo.name}을/를 사용했다!`);
        console.log(`${side}는 ${moveInfo.name}을/를 사용했다!`);
      }
      if (moveInfo.field) {
        setField(moveInfo.field);
        addLog(`⛰️ ${side}는 필드를 ${moveInfo.name}로 바꿨다!`);
        console.log(`${side}는 필드를 ${moveInfo.name}로 바꿨다!`);
      }
      if (moveInfo.weather) {
        setWeather(moveInfo.weather as WeatherType);
        console.log(`${side}는 날씨를 ${moveInfo.weather}로 바꿨다!`);
      }
      if (moveInfo.room) {
        setRoom(moveInfo.room);
        console.log(`${side}는 룸 상태를 ${moveInfo.room}으로 바꿨다!`);
      }
    }
  }
  updatePokemon(side, activeMine, (attacker) => useMovePP(attacker, moveInfo.name, deffender?.ability?.name === '프레셔')); // pp 깎기 
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