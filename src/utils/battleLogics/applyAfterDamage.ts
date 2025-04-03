// 데미지 계산 후의 함수. 
// 예를 들어, 기술의 부가 효과/특성의 부가효과/방어적 특성 효과/아이템의 부가효과 등을 적용시킴. 

import { BattlePokemon } from "../../models/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { StatusState } from "../../models/Status";
import { addStatus, changeHp, changeRank } from "./updateBattlePokemon";
import { RankState } from "../../models/RankState";
import { applyStatusWithDuration } from "./applyStatusWithDuration";
import { applyConfusionStatus } from "./applyConfusionStatus";
import { switchPokemon } from "./switchPokemon";


// 사용 주체, 내 포켓몬, 상대 포켓몬, 기술, 내 포켓몬의 남은 체력
export async function applyAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number) {
  applyMoveEffectAfterDamage(side, attacker, deffender, usedMove, appliedDameage);
}

function applyDefensiveAbilityEffectAfterDamage() {

}

function applyOffensiveAbilityEffectAfrerDamage() {

}

function applyMoveEffectAfterDamage(side: "my" | "enemy", attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number) {
  const { updatePokemon, addLog, activeEnemy, activeMy, myTeam, enemyTeam } = useBattleStore.getState();
  const effect = usedMove.effects;
  const opponentSide = side === 'my' ? 'enemy' : 'my';
  const activeOpponent = side === 'my' ? activeEnemy : activeMy;
  const activeMine = side === 'my' ? activeMy : activeEnemy;
  const opponentTeam = side === 'my' ? enemyTeam : myTeam;

  if (effect?.recoil && appliedDameage) {
    // 반동 데미지 적용
    const recoilDamage = appliedDameage * effect.recoil;
    updatePokemon(side, activeMine, (attacker) => changeHp(attacker, - recoilDamage));
    addLog(`${attacker.base.name}은/는 반동 데미지를 입었다!`);
  }
  if (effect && Math.random() < effect.chance) {
    console.log(`${usedMove.name}의 부가효과 발동!`)
    if (effect.statChange) {
      effect.statChange.forEach((statChange) => {
        const target = statChange.target === 'opponent' ? deffender : attacker; // 상대에게 적용할지, 자신에게 적용할지 결정
        let targetSide: 'my' | 'enemy' = 'enemy'; // 누구의 랭크를 변화시킬건지 정함. 
        if (side === 'my' && statChange.target === 'opponent') {
          targetSide = 'enemy';
        } else if (side === 'my' && statChange.target === 'self') {
          targetSide = 'my';
        } else if (side === 'enemy' && statChange.target === 'opponent') {
          targetSide = 'my';
        } else if (side === 'enemy' && statChange.target === 'self') {
          targetSide = 'enemy';
        }
        const stat = statChange.stat;
        const change = statChange.change;
        const activeIndex = targetSide === 'my' ? activeMy : activeEnemy;
        updatePokemon(targetSide, activeIndex, (target) => changeRank(target, stat as keyof RankState, change))
        console.log(`${target.base.name}의 ${stat}이/가 ${change}랭크 변했다!`);
        addLog(`${target.base.name}의 ${stat}이/가 ${change}랭크 변했다!`)
      });
    }
    if (effect.status) {
      // 상태이상 적용
      // 아니 여기 원래 attacker가 아니라 deffender여야 하는데 이거 왜이러냐 이거?
      const status = effect.status;
      if (status === '화상' && deffender.base.types.includes('불')) { };
      if (status === '마비' && deffender.base.types.includes('전기')) { };
      if (status === '얼음' && deffender.base.types.includes('얼음')) { };
      if (status === '독' && deffender.base.types.includes('독')) { };
      if (status === '맹독' && deffender.base.types.includes('독')) { };
      if (status === '풀죽음' || status === '도발' || status === '앵콜' || status === '잠듦') {
        applyStatusWithDuration(opponentSide, activeOpponent, status);
      } else if (status === '혼란' && !(deffender.base.ability?.name === '마이페이스')) {
        applyConfusionStatus(opponentSide, activeOpponent);
      } else {
        updatePokemon(opponentSide, activeOpponent, (prev) => addStatus(prev, status));
      }
      addLog(`${opponentTeam[activeOpponent].base.name}은/는 ${status}상태가 되었다!`)
      console.log(`${opponentTeam[activeOpponent].base.name}은/는 ${status}상태가 되었다!`)
    }
    if (effect.heal && appliedDameage && appliedDameage > 0) {
      const deal = appliedDameage;
      const healRate = effect.heal;
      updatePokemon(side, activeMine, (attacker) => changeHp(attacker, deal * healRate));
      addLog(`${attacker.base.name}은/는 체력을 회복했다!`)
    }
    if (effect.heal && !appliedDameage) {
      // 반피 회복 로직 
      const healRate = effect.heal;
      updatePokemon(side, activeMine, (attacker) => changeHp(attacker, attacker.base.hp * healRate));
      addLog(`${attacker.base.name}은/는 체력을 회복했다!`)
    }
    if (effect?.uTurn) {
      const { setSwitchRequest } = useBattleStore.getState();
      setSwitchRequest({
        side,
        reason: "uTurn",
        onSwitch: (index: number) => {
          switchPokemon(side, index);
          setSwitchRequest(null);
        },
      });
      addLog(`${attacker.base.name}은/는 교체하려 하고 있다!`);
    }
  }
}