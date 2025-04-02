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
  level: number; // 레벨에 따라 동료 포획률 조정
};