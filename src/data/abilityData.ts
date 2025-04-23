import { AbilityInfo } from "../models/Ability";
import { shuffleArray } from "../utils/shuffle";

const availableAbilities: AbilityInfo[] = [
  {
    id: 0,
    name: '없음'
  },
  {
    id: 1,
    name: '엽록소',
    util: ['rank_buff'],
  },
  {
    id: 2,
    name: '선파워',
    offensive: ['rank_buff'],
  },
  {
    id: 3,
    name: '급류',
    offensive: ['damage_buff'],
  },
  { id: 4, name: '맹화', offensive: ['damage_buff'] },
  { id: 5, name: '심록', offensive: ['damage_buff'] },
  { id: 6, name: '우격다짐', offensive: ['damage_buff'] },
  { id: 7, name: '가속', util: ['rank_change'] },
  { id: 8, name: '철주먹', offensive: ['damage_buff'] },
  { id: 9, name: '조가비갑옷', defensive: ['critical_nullification'] },
  { id: 10, name: '오기', util: ['rank_change'] },
  { id: 11, name: '이판사판', offensive: ['damage_buff'] },
  { id: 12, name: '심술꾸러기', util: ['etc'] },
  { id: 13, name: '방탄', defensive: ['damage_nullification'] },
  { id: 14, name: '변환자재', offensive: ['type_change'] },
  { id: 15, name: '위협', appear: ['rank_change'] },
  { id: 16, name: '리베로', offensive: ['type_change'] },
  { id: 17, name: '그래스메이커', appear: ['field_change'] },
  { id: 18, name: '스나이퍼', offensive: ['damage_buff'] },
  { id: 19, name: '천진', util: ['rank_nullification'] },
  { id: 20, name: '변환자재', offensive: ['type_change'] },
  { id: 21, name: '자기과신', offensive: ['rank_change'] },
  {
    id: 22, name: '타오르는불꽃', // TODO: 불꽃 기술만 강화하도록 바꿔야되긴 함 
    defensive: ['type_nullification']
  },
  { id: 23, name: '재생력', util: ['change_trigger'] },
  { id: 24, name: '가뭄', appear: ['weather_change'] },
  { id: 25, name: '승기', defensive: ['rank_change'] },
  { id: 26, name: '테크니션', offensive: ['damage_buff'] },
  {
    id: 27,
    name: '불꽃몸',
    defensive: ['status_change']
  },
  {
    id: 28,
    name: '쓱쓱',
    util: ['rank_buff']
  },
  {
    id: 29,
    name: '독가시',
    defensive: ['status_change']
  },
  {
    id: 30,
    name: '저수',
    defensive: ['type_nullification']
  },
  {
    id: 31,
    name: '벌레의알림',
    offensive: ['damage_buff']
  },
  {
    id: 32,
    name: '메가런처',
    offensive: ['damage_buff']
  },
  {
    id: 33,
    name: '불면',
    util: ['status_nullification']
  },
  {
    id: 34,
    name: '부식',
    util: ['etc']
  },
  {
    id: 35,
    name: '수포',
    offensive: ['damage_buff'],
    util: ['status_nullification']
  },
  {
    id: 36,
    name: '여왕의위엄',
    defensive: ['damage_nullification']
  },
  {
    id: 37,
    name: '증기기관',
    defensive: ['rank_change']
  },
  {
    id: 38,
    name: '적응력',
    offensive: ['damage_buff'],
  },
  {
    id: 39,
    name: '의욕',
    offensive: ['damage_buff'],
  },
  {
    id: 40,
    name: '깨어진갑옷',
    defensive: ['rank_change']
  },
  {
    id: 41,
    name: '변덕쟁이',
    util: ['rank_change']
  },
  { id: 42, name: '리프가드', util: ['status_nullification'] },
  { id: 43, name: '정의의마음', defensive: ['rank_change'] },
  { id: 44, name: '마이페이스', util: ['status_nullification', 'intimidate_nullification'] },
  { id: 45, name: '둔감', util: ['status_nullification', 'intimidate_nullification'] },
  { id: 46, name: '하얀연기', util: ['rank_nullification'] },
  { id: 47, name: '클리어바디', util: ['rank_nullification'] },
  { id: 48, name: '메탈프로텍트', util: ['rank_nullification'] },
  { id: 49, name: '이상한비늘', defensive: ['damage_reduction'] },
  { id: 50, name: '포자', defensive: ['status_change'] },
  { id: 51, name: '의기양양', util: ['status_nullification'] },
  { id: 52, name: '수의베일', util: ['status_nullification'] },
  { id: 53, name: '자연회복', util: ['etc'] },
  { id: 54, name: '독수', offensive: ['status_change'] },
  { id: 55, name: '질풍날개', util: ['etc'] },
  { id: 56, name: '틀깨기', offensive: ['ability_nullification'] },
  { id: 57, name: '테라볼티지', offensive: ['ability_nullification'] },
  { id: 58, name: '터보블레이즈', offensive: ['ability_nullification'] },
  { id: 59, name: '균사의힘', offensive: ['ability_nullification'] },
  { id: 60, name: '곡예', util: ['rank_buff'] },
  { id: 61, name: '정전기', defensive: ['status_change'] },
  { id: 62, name: '피뢰침', defensive: ['type_nullification'] },
  { id: 63, name: '매직가드', util: ['tickDamage_nullification'] },
  { id: 64, name: '싱크로', defensive: ['status_change'] },
  { id: 65, name: '전투무장', defensive: ['critical_nullification'] },
  { id: 66, name: '프레셔', util: ['etc'] },
  { id: 67, name: '면역', util: ['status_nullification'] },
  { id: 68, name: '두꺼운지방', defensive: ['damage_reduction'] },
  { id: 69, name: '정신력', util: ['intimidate_nullification', 'status_nullification'] },
  { id: 70, name: '매직미러', util: ['statusMove_nullification'] },
  { id: 71, name: '트레이스', appear: ['ability_change'] },
  { id: 72, name: '옹골참', util: ['etc'] },
  { id: 73, name: '부유', defensive: ['type_nullification'] },
  { id: 74, name: '방음', defensive: ['damage_nullification'] },
  { id: 75, name: '대운', util: ['rank_buff'] },
  { id: 76, name: '내열', defensive: ['damage_reduction'] },
  { id: 77, name: '마중물', defensive: ['type_nullification'] },
  { id: 78, name: '모래날림', appear: ['weather_change'] },
  { id: 79, name: '모래숨기', util: ['rank_buff'] },
  { id: 80, name: '눈퍼뜨리기', appear: ['weather_change'] },
  { id: 81, name: '돌머리', offensive: ['remove_demerit'] },
  { id: 82, name: '건조피부', defensive: ['type_nullification'], util: ['heal'] },
  { id: 83, name: '애널라이즈', offensive: ['damage_buff'] },
  { id: 84, name: '하드록', defensive: ['damage_reduction'] },
  { id: 85, name: '하늘의은총', util: ['etc'] },
  { id: 86, name: '전기엔진', defensive: ['type_nullification'], util: ['rank_change'] },
  { id: 87, name: '색안경', offensive: ['damage_buff'] },
  { id: 88, name: '눈숨기', util: ['rank_buff'] },
  { id: 89, name: '아이스바디', util: ['heal'] },
  { id: 90, name: '포이즌힐', util: ['heal'] },
  { id: 91, name: '다운로드', appear: ['rank_change'] },
  { id: 92, name: '예리함', offensive: ['damage_buff'] }, //
  { id: 93, name: '배짱', offensive: ['type_nullification'], util: ['intimidate_nullification'] },
  { id: 94, name: '초식', defensive: ['type_nullification'] },
  { id: 95, name: '모래헤치기', util: ['rank_buff'] },
  { id: 96, name: '미라클스킨', defensive: ['status_change'], util: ['statusMove_nullification'] },
  { id: 97, name: '무기력', offensive: ['demerit'], util: ['demerit'] },
  { id: 98, name: '복안', util: ['rank_buff'] },
  { id: 99, name: '눈치우기', util: ['rank_buff'] },
  { id: 100, name: '노가드', util: ['certainly'] },
  { id: 101, name: '방진', defensive: ['damage_nullification'], util: ['status_nullification'] },
  { id: 102, name: '부풀린가슴', offensive: ['rank_buff'] },
  { id: 103, name: '플라워베일', util: ['status_nullification'] }, // 아군 풀타입의 상태이상 방지
  { id: 104, name: '짓궂은마음', util: ['etc'] }, // 변화기술의 우선도 +1
  { id: 105, name: '옹골찬턱', offensive: ['damage_buff'] },
  { id: 106, name: '프리즈스킨', offensive: ['damage_buff'] }, // 노말 → 얼음, 위력 1.2배
  { id: 107, name: '페어리스킨', offensive: ['damage_buff'] }, // 노말 → 페어리, 위력 1.2배
  { id: 108, name: '틈새포착', util: ['etc'] },
  { id: 109, name: '단단한발톱', offensive: ['damage_buff'] },
  { id: 110, name: '어군', util: ['form_change'] },
]

export function abilityData(abilities: string[]) {
  let selected = abilities
    .map(name => availableAbilities.find(m => m.name === name))
    .filter((m): m is AbilityInfo => !!m);

  // ❗ 유효하지 않은 이름만 추출
  const invalidNames = abilities.filter(name => !availableAbilities.some(m => m.name === name));

  if (invalidNames.length > 0) {
    console.warn(`[abilityData] 유효하지 않은 특성 이름${invalidNames.length > 1 ? '들' : ''} 감지됨:\n- ${invalidNames.join('\n- ')}`);
    return availableAbilities[0]; // fallback (또는 필요시 throw 등 처리 가능)
  }

  return shuffleArray(selected)[0];
}