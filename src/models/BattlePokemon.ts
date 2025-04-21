import { PokemonInfo } from "./Pokemon";
import { RankState } from "./RankState";
import { StatusState } from "./Status";
import { MoveInfo } from "./Move";

export type BattlePokemon = {
  base: PokemonInfo;               // 기본 정보 (정적인 데이터)
  currentHp: number;               // 남은 체력
  pp: Record<string, number>;      // 기술 이름 기준으로 남은 PP
  rank: RankState;                 // 랭크 상태
  status: StatusState[];           // 상태이상
  position: '땅' | '하늘' | '바다' | '공허' | null; // 구멍파기 등 위치
  isActive: boolean;               // 현재 전투에 나와있는가?
  lockedMove?: MoveInfo;      // 고정된 기술 (구애스카프 등)
  isProtecting?: boolean;          // 방어, 니들가드 등을 쓰고 있는가?
  usedMove?: MoveInfo;             // 가장 마지막에 사용한 기술
  hadMissed?: boolean;             // 전 턴에 기술 빗나갔는지 
  hadRankUp?: boolean;             // 이번 턴에 랭크업했는지
  isCharging?: boolean;            // 솔라빔처럼 1턴 기다리는 기술인지
  chargingMove?: MoveInfo;         // 차징중인 기술 이름
  receivedDamage?: number;         // 이번 턴에 받은 데미지
  isFirstTurn?: boolean;         // 이번 턴에 등장했는지
  cannotMove?: boolean;           // 아무 행동도 못하는 상태인지 (예: 파괴광선, 기가임팩트, 시간의포효 등)
};