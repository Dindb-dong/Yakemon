// 데미지 계산 후의 함수. 
// 예를 들어, 기술의 부가 효과/특성의 부가효과/방어적 특성 효과/아이템의 부가효과 등을 적용시킴. 

import { MoveInfo } from "../../models/Move";
import { PokemonInfo } from "../../models/Pokemon";
import { StatusState } from "../../models/Status";

export async function applyAfterDamage(attacker: PokemonInfo, deffender: PokemonInfo, usedMove: MoveInfo, appliedDameage?: number) {
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
      if (status === '화상') {
        deffender.status = deffender.status || [];
        deffender.status.push('화상' as StatusState);
      } else if (status === '마비') {
        deffender.status = deffender.status || [];
        deffender.status.push('마비' as StatusState);
      } else if (status === '독') {
        deffender.status = deffender.status || [];
        deffender.status.push('독' as StatusState);
      } else if (status === '맹독') {
        deffender.status = deffender.status || [];
        deffender.status.push('맹독' as StatusState);
      } else if (status === '얼음') {
        deffender.status = deffender.status || [];
        deffender.status.push('얼음' as StatusState);
      } else if (status === '잠듦') {
        deffender.status = deffender.status || [];
        deffender.status.push('잠듦' as StatusState);
      } else if (status === '혼란') {
        deffender.status = deffender.status || [];
        deffender.status.push('혼란' as StatusState);
      } else if (status === '풀죽음') {
        deffender.status = deffender.status || [];
        deffender.status.push('풀죽음' as StatusState);
      } else if (status === '앵콜') {
        deffender.status = deffender.status || [];
        deffender.status.push('앵콜' as StatusState);
      } else if (status === '트집') {
        deffender.status = deffender.status || [];
        deffender.status.push('트집' as StatusState);
      } else if (status === '도발') {
        deffender.status = deffender.status || [];
        deffender.status.push('도발' as StatusState);
      }
    }
    if (effect.recoil && appliedDameage) {
      // 반동 데미지 적용
      const recoilDamage = appliedDameage * effect.recoil;
      attacker.hp -= recoilDamage;
    }
    if (effect.heal && appliedDameage) {
      attacker.hp += appliedDameage * effect.heal;
    }
  }
}