import { AbilityInfo } from "../../models/Ability";

export function calculateRankEffect(rank: number): number {
  // 공,방,특공,특방 랭크 효과 계산
  if (rank > 0 && rank <= 6) {
    // 상승 랭크 계산
    return (rank * 1 + 2) / 2;
  } else if (rank > 6) {
    return 4; // 최대 상승 랭크
  } else if (rank < -6) {
    return 1 / 4; // 최대 하락 랭크
  } else {
    // 하락 랭크 계산 (rank는 음수)
    const absRank = Math.abs(rank);
    return 2 / (absRank * 1 + 2);
  }
}

export function calculateAccuracy(accRate: number, dodgeRate: number, moveAccuracy: number, accRank: number, dodgeRank: number): boolean {
  // 명중률 계산\
  let hitProb = 1;
  hitProb *= accRate / 100
  // TODO:명중률, 회피율 계산 필요 
  hitProb = Math.min(1, Math.max(0, hitProb));
  return Math.random() < hitProb;

}

export function calculateCritical(baseCritical: number, ability: AbilityInfo | null, criRank: number): boolean {
  // 기술 기본 명중률, 포켓몬 특성, 랭크업 상태 
  let criProb = 0;
  let criRate: number;
  if (ability?.name === '대운') {
    criProb += 1; // 대운 적용
  }
  criProb += baseCritical; // 기술의 기본 급소율 적용 
  criProb += criRank; // 급소율 랭크 적용 
  if (criProb > 4) {
    criProb = 4;
  }

  if (criProb === 0) {
    criRate = 1 / 16;
  } else {
    criRate = (criProb * 2) / 16;
  }

  return Math.random() < criRate;
}