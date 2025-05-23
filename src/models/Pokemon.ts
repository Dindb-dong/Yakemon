import { AbilityInfo } from "./Ability";
import { MoveInfo } from "./Move";

// 포켓몬 클래스를 만들어서 메서드 구현해야 하나? 

export type PokemonInfo = {
  id: number; // 도감번호 
  name: string; // 이름
  types: string[]; // ['불','물']
  originalTypes?: string[];
  moves: MoveInfo[]; // 기술
  sex: 'male' | 'female' | null;
  ability: AbilityInfo | null; // 특성
  originalAbility?: AbilityInfo | null;
  // 종족값 
  hp: number;
  attack: number;
  spAttack: number;
  defense: number;
  spDefense: number;
  speed: number;
  level: number; // 레벨에 따라 동료 포획률 조정
  hasFormChange?: boolean; // 폼체인지 여부 
  formChange?: PokemonInfo; // 폼체인지 포켓몬의 정보.
  memorizedBase?: PokemonInfo; // 폼체인지용 포켓몬의 기본 정보 (배틀 승리 후 교체시 초기화용)
};