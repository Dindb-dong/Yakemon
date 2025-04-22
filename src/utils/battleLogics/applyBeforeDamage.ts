// 데미지 계산 전 함수.
// 데미지 계산 전의 공격적 특성/상대 방어적 특성 적용          

import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { StatusState } from "../../models/Status";
import { changeHp, changeRank, setTypes } from "./updateBattlePokemon";

// 내 포켓몬, 상대 포켓몬, 기술, 받은 데미지, 날씨, 필드
export function applyDefensiveAbilityEffectBeforeDamage(
  usedMove: MoveInfo, side: 'my' | 'enemy', wasEffective?: number): number {

  const { enemyTeam, activeEnemy, myTeam, activeMy, updatePokemon, addLog } = useBattleStore.getState();
  const attacker: BattlePokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const deffender: BattlePokemon = side === 'my' ? enemyTeam[activeEnemy] : myTeam[activeMy];
  const ability = deffender.base.ability; // 상대 포켓몬의 특성
  const currentHp = deffender.currentHp; // 상대 포켓몬 남은 체력 (멀티스케일, 스펙터가드)
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  let rate = 1;
  ability?.defensive?.forEach(
    (category: string) => {
      switch (category) {
        case 'type_nullification':
          if (ability.name === '저수' && usedMove.type === '물') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeHp(deffender, Math.round(deffender.base.hp / 4)));
          } else if (ability.name === '흙먹기' && usedMove.type === '땅') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeHp(deffender, Math.round(deffender.base.hp / 4)));
          } else if (ability.name === '축전' && usedMove.type === '전기') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeHp(deffender, Math.round(deffender.base.hp / 4)));
          } else if (ability.name === '건조피부') {
            if (usedMove.type === '물') {
              rate = 0;
              console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
              updatePokemon(opponentSide, activeOpponent, (deffender) => changeHp(deffender, Math.round(deffender.base.hp / 4)));
            } else if (usedMove.type === '불') {
              console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
              rate *= 1.25;
            }
          } else if (ability.name === '타오르는불꽃' && usedMove.type === '불') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'spAttack', 1));
          } else if (ability.name === '피뢰침' && usedMove.type === '전기') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'spAttack', 1));
          } else if (ability.name === '마중물' && usedMove.type === '물') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'spAttack', 1));
          } else if (ability.name === '부유' && usedMove.type === '땅') {
            rate = 0;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
          } else if (ability.name === '초식' && usedMove.type === '풀') {
            rate = 0;
            updatePokemon(opponentSide, activeOpponent, (deffender) => changeRank(deffender, 'attack', 1));
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
          }
          // TODO: 마중물, 노릇노릇바디, 전기엔진 등은 rate 0으로 만들고 각각 특수공격 1랭크, 방어 2랭크, 특수공격 1랭크, 스피드 2랭크 올리기. 
          // updatePokemon("my", 0, changeRank(active, "spAttack", 1)); 같은거 이용해서.
          break;
        case 'damage_nullification':
          if (ability.name === '방진' && usedMove.affiliation === '가루') {
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            addLog(`🤪 ${deffender.base.name}의 ${ability?.name} 발동!`);
            rate = 0;
          } else if (ability.name === '방탄' && usedMove.affiliation === '폭탄') {
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            rate = 0;
          } else if (ability.name === '여왕의위엄' && (usedMove.priority ?? 0) > 0) {
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            rate = 0;
          } else if (ability.name === '방음' && usedMove.affiliation === '소리') {
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            rate = 0;
          }
          else if (ability.name === '방진' && usedMove.affiliation === '가루') {
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
            rate = 0;
          }
          break;
        case 'damage_reduction':
          if (ability.name === '이상한비늘' && deffender.status.length > 0 && usedMove.category === '물리') {
            rate = 2 / 3;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
          } else if (ability.name === '두꺼운지방' && (usedMove.type === '얼음' || usedMove.type === '불')) {
            rate = 1 / 2;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
          } else if (ability.name === '내열' && usedMove.type === '불') {
            rate = 1 / 2;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
          } else if ((ability.name === '하드록' || ability.name === '필터') && (wasEffective ?? 0) > 0) {
            rate = 3 / 4;
            console.log(`${deffender.base.name}의 ${ability?.name} 발동!`);
          }
          // TODO: 퍼코트, 복슬복슬, 필터, 하드록, 내열, 수포, 멀티스케일, 스펙터가드 등 추가하기 
          break;
        default:
          rate = 1;
          break;
      }
    }
  )
  if (rate < 1) { console.log('방어적 특성이 적용되었다!') }
  return rate;
}

export function applyOffensiveAbilityEffectBeforeDamage(
  usedMove: MoveInfo, side: 'my' | 'enemy', wasEffective?: number
): number {
  const { enemyTeam, activeEnemy, myTeam, activeMy, publicEnv, updatePokemon } = useBattleStore.getState();
  const attacker: BattlePokemon = side === 'my' ? myTeam[activeMy] : enemyTeam[activeEnemy];
  const deffender: BattlePokemon = side === 'enemy' ? enemyTeam[activeEnemy] : myTeam[activeMy];
  const ability = attacker.base.ability; // 내 포켓몬의 특성
  const currentHp = myTeam[activeMy]; // 내 포켓몬 남은 체력 (멀티스케일, 스펙터가드)
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  let rate = 1;

  ability?.offensive?.forEach(
    (category: string) => {
      switch (category) {
        // TODO: 아래에 전부 추가하기 
        case "damage_buff":
          if (ability.name === '우격다짐' && usedMove.effects) {
            rate *= 1.3; // 우격다짐은 1.3배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '이판사판' && usedMove.demeritEffects?.some(demerit => (demerit.recoil || demerit.fail))) {
            rate *= 1.2; // 이판사판은 1.2배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '철주먹' && usedMove.affiliation === '펀치') {
            rate *= 1.2; // 철주먹은 1.2배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '단단한발톱' && usedMove.isTouch) {
            rate *= 1.3; // 단단한발톱은 1.3배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '맹화' && usedMove.type === '불' && attacker.currentHp <= attacker.base.hp / 3) {
            rate *= 1.5; // 맹화는 1.5배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '급류' && usedMove.type === '물' && attacker.currentHp <= attacker.base.hp / 3) {
            rate *= 1.5; // 급류는 1.5배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '심록' && usedMove.type === '풀' && attacker.currentHp <= attacker.base.hp / 3) {
            rate *= 1.5; // 심록은 1.5배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '벌레의알림' && usedMove.type === '벌레' && attacker.currentHp <= attacker.base.hp / 3) {
            rate *= 1.5; // 벌레의알림은 1.5배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '의욕' && usedMove.category === '물리') {
            rate *= 1.5;
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '적응력' && attacker.base.types.includes(usedMove.type)) {
            rate *= 4 / 3; // 적응력은 자속 보정 1.5배 아니라 2배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '메가런처' && usedMove.affiliation === '파동') {
            rate *= 1.5;
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '수포' && usedMove.type === '물') {
            rate *= 2; // 수포는 2배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '색안경' && (wasEffective ?? 0) < 0) {
            rate *= 2;
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '예리함' && usedMove.affiliation === '베기') {
            rate *= 1.5;
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          if (ability.name === '옹골찬턱' && usedMove.affiliation === '물기') {
            rate *= 1.5;
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          break;
        case "demerit":
          break;
        case "type_nullification":
          break;
        case "type_change":
          break;
        case "rank_buff":
          if (ability.name === '선파워' && publicEnv.weather === '쾌청' && usedMove.category === '특수') {
            rate *= 1.5; // 선파워는 1.5배
            console.log(`${attacker.base.name}의 ${ability?.name} 발동!`);
          }
          break;
        case "crack":
          break;
        default:
          break;
      }
    }
  )
  if (rate > 1) { console.log('공격적 특성이 적용되었다!') }
  return rate;
}