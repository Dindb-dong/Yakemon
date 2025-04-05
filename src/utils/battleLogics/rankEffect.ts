import { AbilityInfo } from "../../models/Ability";

export function calculateRankEffect(rank: number): number {
  // 공,방,특공,특방,스피드 랭크 효과 계산
  if (rank > 0 && rank <= 6) {
    // 상승 랭크 계산
    return (rank * 1 + 2) / 2;
  } else if (rank > 6) {
    return 4; // 최대 상승 랭크
  } else if (rank < -6) {
    return 1 / 4; // 최대 하락 랭크
  } else {
    // 하락 랭크 계산 (rank는 음수)
    return (2 / (Math.abs(rank * 1) + 2));
  }
}

export function calculateAccuracy(accRate: number, moveAccuracy: number, accRank: number, dodgeRank: number): boolean {
  // 명중률 계산\
  let hitProb = 1;
  hitProb *= accRate // 복안 등 명중률 올리는 특성이나 눈숨기 등 낮추는 특성 적용된 배율.

  const rankDiff = accRank - dodgeRank;
  // 랭크 차이 계산 
  if (rankDiff > 6) { // 6보다 크게 차이가 날 때 
    hitProb *= 3;
  } else if (rankDiff >= 0 && rankDiff <= 6) { // 6보다 같거나 작은 양수 
    hitProb *= ((rankDiff + 3) / 3) // 1이면 4/3이 곱해짐
  } else if (rankDiff >= -6 && rankDiff < 0) { // -6보다 같거나 큰 음수 
    hitProb *= (3 / Math.abs(rankDiff) + 3) // -1이면 3/4가, -6이면 3/9가 곱해짐
  } else { // -6보다 작은 음수 
    hitProb *= 1 / 3;
  }

  hitProb *= (moveAccuracy / 100); // 기술 명중률 적용 

  hitProb = Math.min(1, hitProb); // 최대 명중률을 1로 제한 
  return Math.random() < hitProb;

}

export function calculateCritical(baseCritical: number, ability: AbilityInfo | null, criRank: number): boolean {
  // 기술 기본 급소율, 포켓몬 특성, 랭크업 상태 
  let criProb = 0;
  let criRate: number;
  if (ability?.name === '대운') {
    criProb += 1; // 대운 적용
  }
  criProb += baseCritical; // 기술의 기본 급소율 적용 
  criProb += criRank; // 급소율 랭크 적용 
  if (criProb === 0) {
    criRate = 1 / 24;
  } else {
    criRate = ((criProb ** 2) * 2) / 16; // 1랭크에는 1/8, 2랭크에는 1/2, 3랭크에는 19/16으로 제대로 작동.
  }

  return Math.random() < criRate;
}