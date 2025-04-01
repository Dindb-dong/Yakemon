// 데미지 계산 후의 함수. 
// 예를 들어, 기술의 부가 효과/특성의 부가효과/방어적 특성 효과/아이템의 부가효과 등을 적용시킴. 

import { BattlePokemon } from "../../Context/BattlePokemon";
import { useBattleStore } from "../../Context/useBattleStore";
import { MoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { StatusState } from "../../models/Status";
import { addStatus } from "./updateBattlePokemon";

const { publicEnv } = useBattleStore.getState();

// 내 포켓몬, 상대 포켓몬, 기술, 내 포켓몬의 남은 체력
export async function applyAfterDamage(attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number) {
  // TODO: 사용한 기술 pp 깎기 -> 
  applyMoveEffectAfterDamage(attacker, deffender, usedMove, appliedDameage);
}

function applyDefensiveAbilityEffectAfterDamage() {

}

function applyOffensiveAbilityEffectAfrerDamage() {

}

function applyMoveEffectAfterDamage(attacker: BattlePokemon, deffender: BattlePokemon, usedMove: MoveInfo, appliedDameage?: number) {
  const effect = usedMove.effects;
  if (effect) {
    if (effect.statChange && Math.random() < effect.chance) {
      effect.statChange.forEach((statChange) => {
        const target = statChange.target === 'opponent' ? deffender : attacker; // 상대에게 적용할지, 자신에게 적용할지 결정
        const stat = statChange.stat;
        const change = statChange.change;
        target[stat] += change;
      });
    }
    if (effect.status && Math.random() < effect.chance) {
      // 상태이상 적용
      const status = effect.status;
      addStatus(deffender, status);
    }
    if (effect.recoil && appliedDameage) {
      // 반동 데미지 적용
      const recoilDamage = appliedDameage * effect.recoil;
      // TODO: 반동데미지 적용 로직 추가하기 
    }
    if (effect.heal && appliedDameage) {
      // TODO: 흡혈 로직 추가하기 
    }
  }
}