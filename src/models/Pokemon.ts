import { AbilityInfo } from "./Ability";
import { MoveInfo } from "./Move";
import { RankState } from "./RankState";
import { StatusState } from "./Status";

// 포켓몬 클래스를 만들어서 메서드 구현해야 하나? 

export type PokemonInfo = {
  id: number; // 도감번호 
  name: string; // 이름
  types: string[]; // ['불','물']
  moves: MoveInfo[]; // 기술
  sex: 'male' | 'female' | null;
  ability: AbilityInfo | null; // 특성
  // 종족값 
  hp: number;
  attack: number;
  spAttack: number;
  defense: number;
  spDefense: number;
  speed: number;
  // 랭크
  rank?: RankState;
  // 상태이상
  status?: StatusState[];
  // 포켓몬 위치 (구멍파기, 다이빙, 프리폴, 공중날기 등)
  position?: '땅' | '바다' | '하늘' | null;
  level: number; // 레벨에 따라 동료 포획률 조정
};