import { PokemonInfo } from "../models/Pokemon";
import { RankState } from "../models/RankState";
import { StatusState } from "../models/Status";
import { MoveInfo } from "../models/Move";

export type BattlePokemon = {
  base: PokemonInfo;               // 기본 정보 (정적인 데이터)
  currentHp: number;               // 남은 체력
  pp: Record<string, number>;      // 기술 이름 기준으로 남은 PP
  rank: RankState;                 // 랭크 상태
  status: StatusState[];           // 상태이상
  position: '땅' | '하늘' | '바다' | null; // 구멍파기 등 위치
  lockedMove?: string | null;      // 고정된 기술 (구애스카프 등)
  isActive: boolean;               // 현재 전투에 나와있는가?
};