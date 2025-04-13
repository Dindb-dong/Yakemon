import { PokemonInfo } from "../models/Pokemon";
import { moveData } from "./moveData";

export function createMockPokemon(): PokemonInfo[] {
  return [
    {
      id: 3,
      name: '이상해꽃',
      types: ['풀', '독'],
      moves: moveData(['기가드레인', '오물폭탄', '수면가루', '맹독', '대지의힘', '씨뿌리기', '광합성', '쾌청',
        '에너지볼', '리프스톰'
      ], ['풀', '독']),
      sex: 'male',
      ability:
      {
        id: 1,
        name: '엽록소',
        util: ['rank_buff'],
      },
      hp: 80,
      attack: 82,
      spAttack: 100,
      defense: 83,
      spDefense: 100,
      speed: 80,
      level: 50,
    },
    {
      id: 6,
      name: '리자몽',
      types: ['불', '비행'],
      moves:
        moveData(['에어슬래시', '불대문자', '오버히트', '지진', '니트로차지', '화염방사', '폭풍', '용의파동', '원시의힘'], ['불', '비행'])
      ,
      sex: 'male',
      ability:
      {
        id: 2,
        name: '선파워',
        offensive: ['rank_buff'],
      },

      hp: 78,
      attack: 84,
      spAttack: 109,
      defense: 78,
      spDefense: 85,
      speed: 100,
      level: 50,
    },
    {
      id: 9,
      name: '거북왕',
      types: ['물'],
      moves: moveData(['껍질깨기', '하이드로펌프', '냉동빔', '악의파동', '아쿠아제트', '퀵턴', '파동탄', '러스터캐논',
        '지진'
      ], ['물']),
      sex: 'male',
      ability:
      {
        id: 3,
        name: '급류',
        offensive: ['damage_buff'],
      },
      hp: 79,
      attack: 83,
      spAttack: 85,
      defense: 100,
      spDefense: 105,
      speed: 78,
      level: 50,
    }, {
      id: 157,
      name: '블레이범',
      types: ['불'],
      moves: moveData(['니트로차지', '오버히트', '불대문자', '와일드볼트', '지진', '치근거리기', '암석봉인', '섀도볼', '화염방사'],
        ['불']
      ),
      sex: 'male',
      ability: { id: 101, name: '맹화', offensive: ['damage_buff'] },
      hp: 76, attack: 104, defense: 71, spAttack: 104, spDefense: 71, speed: 108, level: 50,
    },
    {
      id: 154,
      name: '메가니움',
      types: ['풀'],
      moves: moveData(['씨뿌리기', '기가드레인', '광합성', '맹독', '리프스톰', '에너지볼', '원시의힘', '지진', '바디프레스', '드래곤테일'],
        ['풀']
      ),
      sex: 'female',
      ability: { id: 102, name: '심록', offensive: ['damage_buff'] },
      hp: 80, attack: 82, defense: 100, spAttack: 83, spDefense: 100, speed: 80, level: 50,
    },
    {
      id: 160,
      name: '장크로다일',
      types: ['물'],
      moves: moveData(['용의춤', '아쿠아브레이크', '냉동펀치', '엄청난힘', '스톤샤워', '아쿠아제트', '깨물어부수기', '개척하기', '눈사태'],
        ['물']
      ),
      sex: 'male',
      ability: { id: 103, name: '우격다짐', offensive: ['damage_buff'] },
      hp: 85, attack: 105, defense: 100, spAttack: 79, spDefense: 83, speed: 78, level: 50,
    },
    {
      id: 257,
      name: '번치코',
      types: ['불', '격투'],
      moves: moveData(['칼춤', '플레어드라이브', '스톤에지', '인파이트', '블레이즈킥', '번개펀치', '유턴', '화염방사', '파동탄', '지진',
        '브레이브버드', '진공파', '깜짝베기'
      ], ['불', '격투']),
      sex: 'male',
      ability: { id: 104, name: '가속', util: ['rank_change'] },
      hp: 80, attack: 120, defense: 70, spAttack: 110, spDefense: 70, speed: 80, level: 50,
    },
    {
      id: 254,
      name: '나무킹',
      types: ['풀'],
      moves: moveData(['기가드레인', '용의파동', '씨뿌리기', '진공파', '에너지볼', '리프스톰', '암석봉인', '드래곤테일', '스톤샤워', '애크러뱃'],
        ['풀']
      ),
      sex: 'male',
      ability: { id: 105, name: '심록', offensive: ['damage_buff'] },
      hp: 70, attack: 85, defense: 65, spAttack: 105, spDefense: 85, speed: 120, level: 50,
    },
    {
      id: 260,
      name: '대짱이',
      types: ['물', '땅'],
      moves: moveData(['퀵턴', '아쿠아브레이크', '지진', '눈사태', '스톤샤워', '암석봉인', '독찌르기', '벌크업', '냉동펀치', '스텔스록'],
        ['물', '땅']
      ),
      sex: 'male',
      ability: { id: 106, name: '급류', offensive: ['damage_buff'] },
      hp: 100, attack: 110, defense: 90, spAttack: 85, spDefense: 90, speed: 60, level: 50,
    },
    {
      id: 392,
      name: '초염몽',
      types: ['불', '격투'],
      moves: moveData(['플레어드라이브', '번개펀치', '드레인펀치', '지진', '마하펀치', '인파이트', '애크러뱃', '니트로차지', '유턴', '오버히트',
        '풀묶기', '더스트슈트', '화염방사'
      ], ['불', '격투']),
      sex: 'male',
      ability: { id: 107, name: '철주먹', offensive: ['damage_buff'] },
      hp: 76, attack: 104, defense: 71, spAttack: 104, spDefense: 71, speed: 108, level: 50,
    },
    {
      id: 389,
      name: '토대부기',
      types: ['풀', '땅'],
      moves: moveData(['껍질깨기', '지진', '우드해머', '기가드레인', '아이언헤드', '스톤샤워', '들이받기', '스톤에지', '스텔스록',
        '깨물어부수기'
      ], ['풀', '땅']),
      sex: 'male',
      ability: { id: 108, name: '조가비갑옷', defensive: ['critical_nullification'] },
      hp: 95, attack: 109, defense: 105, spAttack: 75, spDefense: 85, speed: 56, level: 50,
    },
    {
      id: 395,
      name: '엠페르트',
      types: ['물', '강철'],
      moves: moveData(['퀵턴', '하이드로펌프', '냉동빔', '풀묶기', '아쿠아제트', '러스터캐논', '에어슬래시', '암석봉인', '날개쉬기'],
        ['물', '강철']
      ),
      sex: 'male',
      ability: { id: 109, name: '오기', util: ['rank_change'] },
      hp: 84, attack: 86, defense: 88, spAttack: 111, spDefense: 101, speed: 60, level: 50,
    },
    {
      id: 500,
      name: '염무왕',
      types: ['불', '격투'],
      moves: moveData(['니트로차지', '플레어드라이브', '양날박치기', '와일드볼트', '개척하기', '독찌르기', '인파이트', '지진', '풀묶기',
        '드레인펀치'], ['불', '격투']),
      sex: 'male',
      ability: { id: 110, name: '이판사판', offensive: ['damage_buff'] },
      hp: 110, attack: 123, defense: 65, spAttack: 100, spDefense: 65, speed: 65, level: 50,
    },
    {
      id: 497,
      name: '샤로다',
      types: ['풀'],
      moves: moveData(['리프스톰', '기가드레인', '뱀눈초리', '용의파동', '드래곤테일', '에너지볼', '아쿠아테일'],
        ['풀']
      ),
      sex: 'female',
      ability: { id: 111, name: '심술꾸러기', util: ['etc'] },
      hp: 75, attack: 75, defense: 95, spAttack: 75, spDefense: 95, speed: 113, level: 50,
    },
    {
      id: 503,
      name: '대검귀',
      types: ['물'],
      moves: moveData(['눈사태', '아쿠아브레이크', '퀵턴', '아쿠아제트', '풀묶기', '메가혼', '하이드로펌프', '에어슬래시', '땅고르기',
        '깜짝베기', '성스러운칼'
      ], ['물']),
      sex: 'male',
      ability: { id: 112, name: '급류', offensive: ['damage_buff'] },
      hp: 95, attack: 100, defense: 85, spAttack: 108, spDefense: 70, speed: 70, level: 50,
    },
    {
      id: 655,
      name: '마폭시',
      types: ['불', '에스퍼'],
      moves: moveData(['매지컬플레임', '사이코키네시스', '에너지볼', '명상', '섀도볼', '불대문자', '이상한빛', '화염방사', '매지컬샤인'],
        ['불', '에스퍼']
      ),
      sex: 'female',
      ability: { id: 113, name: '맹화', offensive: ['damage_buff'] },
      hp: 75, attack: 69, defense: 72, spAttack: 114, spDefense: 100, speed: 104, level: 50,
    },
    {
      id: 652,
      name: '브리가론',
      types: ['풀', '격투'],
      moves: moveData(['씨기관총', '바디프레스', '광합성', '철벽', '맹독', '씨뿌리기', '바늘미사일', '암석봉인', '드레인펀치', '스톤샤워'],
        ['풀', '격투']
      ),
      sex: 'male',
      ability: { id: 114, name: '방탄', defensive: ['damage_nullification'] },
      hp: 88, attack: 107, defense: 122, spAttack: 74, spDefense: 75, speed: 64, level: 50,
    },
    {
      id: 658,
      name: '개굴닌자',
      types: ['물', '악'],
      moves: moveData(['풀묶기', '하이드로펌프', '물수리검', '악의파동', '냉동빔', '독압정', '깜짝베기', '더스트슈트', '애크러뱃',
        '유턴'
      ], ['물', '악']),
      sex: 'male',
      ability: { id: 115, name: '변환자재', offensive: ['type_change'] }, // 발동하고 나면 특성 삭제시킬 것.
      hp: 72, attack: 95, defense: 67, spAttack: 103, spDefense: 71, speed: 122, level: 50,
    },
    {
      id: 727,
      name: '어흥염',
      types: ['불', '악'],
      moves: moveData(['플레어드라이브', '도깨비불', '막말내뱉기', 'DD래리어트', '지진', '인파이트', '개척하기', '번개펀치', '불꽃번치',
        '크로스촙'], ['불', '악']),
      sex: 'male',
      ability: { id: 116, name: '위협', appear: ['rank_change'] },
      hp: 95, attack: 115, defense: 90, spAttack: 80, spDefense: 90, speed: 60, level: 50,
    },
    {
      id: 724,
      name: '모크나이퍼',
      types: ['풀', '고스트'],
      moves: moveData(['리프블레이드', '칼춤', '폴터가이스트', '더블윙', '야습', '브레이브버드', '애크러뱃', '이상한빛', '개척하기',
        '섀도클로'
      ], ['풀', '고스트']),
      sex: 'male',
      ability: { id: 117, name: '심록', offensive: ['damage_buff'] },
      hp: 78, attack: 107, defense: 75, spAttack: 100, spDefense: 100, speed: 70, level: 50,
    },
    {
      id: 730,
      name: '누리레느',
      types: ['물', '페어리'],
      moves: moveData(['물거품아리아', '문포스', '퀵턴', '아쿠아제트', '에너지볼', '냉동빔', '섀도볼', '사이코키네시스', '드레인키스'],
        ['물', '페어리']
      ),
      sex: 'female',
      ability: { id: 118, name: '급류', offensive: ['damage_buff'] },
      hp: 80, attack: 74, defense: 74, spAttack: 126, spDefense: 116, speed: 60, level: 50,
    },
    {
      id: 815,
      name: '에이스번',
      types: ['불'],
      moves: moveData(['화염볼', '무릎차기', '칼춤', '유턴', '애크러뱃', '개척하기', '아이언헤드', '더스트슈트', '니트로차지'],
        ['불']
      ),
      sex: 'female',
      ability: { id: 119, name: '리베로', offensive: ['type_change'] },
      hp: 80, attack: 116, defense: 75, spAttack: 65, spDefense: 75, speed: 119, level: 50,
    },
    {
      id: 812,
      name: '고릴타',
      types: ['풀'],
      moves: moveData(['그래스슬라이더', '10만마력', '칼춤', '우드해머', '드럼어택', '애크러뱃', '개척하기', '드레인펀치', '로킥'],
        ['풀']
      ),
      sex: 'male',
      ability: { id: 120, name: '그래스메이커', appear: ['field_change'] },
      hp: 100, attack: 125, defense: 90, spAttack: 60, spDefense: 70, speed: 85, level: 50,
    },
    {
      id: 818,
      name: '인텔리레온',
      types: ['물'],
      moves: moveData(['기충전', '노려맞히기', '냉동빔', '섀도볼', '에어커터', '하이드로펌프', '아쿠아제트', '악의파동'],
        ['물']
      ),
      sex: 'male',
      ability: { id: 121, name: '스나이퍼', offensive: ['damage_buff'] },
      hp: 70, attack: 85, defense: 65, spAttack: 125, spDefense: 65, speed: 120, level: 50,
    },
    {
      id: 911,
      name: '라우드본',
      types: ['불', '고스트'],
      moves: moveData(['플레어송', '게으름피우기', '섀도볼', '도깨비불', '오버히트', '대지의힘', '씨폭탄'], ['불', '고스트']),
      sex: 'male',
      ability: { id: 122, name: '천진', util: ['rank_nullification'] },
      hp: 104, attack: 75, defense: 100, spAttack: 110, spDefense: 75, speed: 66, level: 50,
    },
    {
      id: 908,
      name: '마스카나',
      types: ['풀', '악'],
      moves: moveData(['트릭플라워', '유턴', '깜짝베기', '치근거리기', '애크러뱃', '개척하기', '로킥', '트리플악셀', '찬물끼얹기'],
        ['풀', '악']
      ),
      sex: 'female',
      ability: { id: 123, name: '변환자재', offensive: ['type_change'] },
      hp: 76, attack: 110, defense: 70, spAttack: 81, spDefense: 70, speed: 123, level: 50,
    },
    {
      id: 914,
      name: '웨이니발',
      types: ['물', '격투'],
      moves: moveData(['아쿠아스텝', '웨이브태클', '인파이트', '브레이브버드', '아쿠아브레이크', '트리플악셀', '로킥', '유턴', '칼춤'],
        ['물', '격투']
      ),
      sex: 'male',
      ability: { id: 124, name: '자기과신', offensive: ['rank_change'] },
      hp: 85, attack: 120, defense: 80, spAttack: 85, spDefense: 75, speed: 85, level: 50,
    }
  ]
}