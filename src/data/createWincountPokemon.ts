import { PokemonInfo } from "../models/Pokemon";
import { abilityData } from "./abilityData";
import { moveData } from "./moveData";

export function createWin10Pokemon(): PokemonInfo[] {
  return [
    {
      id: 59,
      name: '윈디',
      types: ['불'],
      moves: moveData(['플레어드라이브', '신속', '치근거리기', '와일드볼트', '인파이트', '깨물어부수기', '니트로차지', '땅고르기', '도깨비불'],
        ['불']),
      sex: 'male',
      ability: abilityData(['위협', '타오르는불꽃', '정의의마음']),
      hp: 90, attack: 110, defense: 80, spAttack: 100, spDefense: 80, speed: 95,
      level: 50
    },
    {
      id: 130,
      name: '갸라도스',
      types: ['물', '비행'],
      moves: moveData(['폭포오르기', '깨물어부수기', '용의춤', '지진', '스톤에지', '열불내기', '눈사태', '아이언헤드', '전기자석파'], ['물', '비행']),
      sex: 'male',
      ability: abilityData(['위협', '자기과신']),
      hp: 95, attack: 125, defense: 79, spAttack: 60, spDefense: 100, speed: 81,
      level: 50
    },
    {
      id: 103,
      name: '나시',
      types: ['풀', '에스퍼'],
      moves: moveData(['에너지볼', '씨뿌리기', '사이코키네시스', '오물폭탄', '쾌청', '기가드레인', '땅고르기', '리프스톰', '광합성'], ['풀', '에스퍼']),
      sex: 'male',
      ability: abilityData(['엽록소']),
      hp: 95, attack: 95, defense: 85, spAttack: 125, spDefense: 65, speed: 55,
      level: 50
    },
    {
      id: 229,
      name: '헬가',
      types: ['악', '불'],
      moves: moveData(['불대문자', '악의파동', '도깨비불', '개척하기', '섀도볼', '오버히트', '맹독', '화염방사', '오물폭탄', '기습'], ['악', '불']),
      sex: 'male',
      ability: abilityData(['타오르는불꽃']),
      hp: 75, attack: 90, defense: 50, spAttack: 110, spDefense: 80, speed: 95,
      level: 50
    },
    {
      id: 199,
      name: '야도킹',
      types: ['물', '에스퍼'],
      moves: moveData(['사이코키네시스', '하이드로펌프', '냉동빔', '기합구슬', '풀묶기', '트릭룸', '불대문자', '열탕'], ['물', '에스퍼']),
      sex: 'male',
      ability: abilityData(['재생력', '마이페이스', '둔감']),
      hp: 95, attack: 75, defense: 80, spAttack: 100, spDefense: 110, speed: 30,
      level: 50
    },
    {
      id: 182,
      name: '아르코',
      types: ['풀'],
      moves: moveData(['나비춤', '수면가루', '문포스', '기가드레인', '오물폭탄', '힘흡수', '쾌청', '에너지볼'], ['풀']),
      sex: 'male',
      ability: abilityData(['엽록소']),
      hp: 75, attack: 80, defense: 95, spAttack: 90, spDefense: 100, speed: 50,
      level: 50
    },
    {
      id: 324,
      name: '코터스',
      types: ['불'],
      moves: moveData(['분연', '화염방사', '오버히트', '스텔스록', '대지의힘', '오물폭탄', '솔라빔', '땅가르기'], ['불']),
      sex: 'male',
      ability: abilityData(['가뭄', '하얀연기', '조가비갑옷']),
      hp: 70, attack: 85, defense: 140, spAttack: 85, spDefense: 70, speed: 20,
      level: 50
    },
    {
      id: 350,
      name: '밀로틱',
      types: ['물'],
      moves: moveData(['하이드로펌프', '냉동빔', '드래곤테일', 'HP회복', '매혹의보이스', '드레인키스', '얼어붙은바람', '이상한빛', '열탕'], ['물']),
      sex: 'female',
      ability: abilityData(['승기', '이상한비늘']),
      hp: 95, attack: 60, defense: 79, spAttack: 100, spDefense: 125, speed: 81,
      level: 50
    },
    {
      id: 286,
      name: '버섯모',
      types: ['풀', '격투'],
      moves: moveData(['씨기관총', '마하펀치', '버섯포자', '드레인펀치', '독찌르기', '번개펀치', '발경', '암석봉인', '더스트슈트'], ['풀', '격투']),
      sex: 'male',
      ability: abilityData(['포자', '테크니션']),
      hp: 60, attack: 130, defense: 80, spAttack: 60, spDefense: 60, speed: 70,
      level: 50
    },
    {
      id: 467,
      name: '마그마번',
      types: ['불'],
      moves: moveData(['불대문자', '화염방사', '10만볼트', '기합구슬', '사이코키네시스', '암석봉인', '이상한빛', '애시드봄'], ['불']),
      sex: 'male',
      ability: abilityData(['불꽃몸', '의기양양']),
      hp: 75, attack: 95, defense: 67, spAttack: 125, spDefense: 95, speed: 83,
      level: 50
    },
    {
      id: 419,
      name: '플로젤',
      types: ['물'],
      moves: moveData(['웨이브태클', '아쿠아제트', '아이언테일', '깨물어부수기', '퀵턴', '벌크업', '냉동펀치', '암석봉인'], ['물']),
      sex: 'male',
      ability: abilityData(['쓱쓱', '수의베일']),
      hp: 85, attack: 105, defense: 55, spAttack: 85, spDefense: 50, speed: 115,
      level: 50
    },
    {
      id: 407,
      name: '로즈레이드',
      types: ['풀', '독'],
      moves: moveData(['에너지볼', '오물폭탄', '맹독', '매지컬샤인', '기가드레인', '압정뿌리기', '섀도볼', '씨뿌리기'], ['풀', '독']),
      sex: 'female',
      ability: abilityData(['독가시', '자연회복']),
      hp: 60, attack: 70, defense: 65, spAttack: 125, spDefense: 105, speed: 90,
      level: 50
    },
    {
      id: 637,
      name: '불카모스',
      types: ['벌레', '불'],
      moves: moveData(['불대문자', '폭풍', '불꽃춤', '벌레의야단법석', '기가드레인', '개척하기', '사이코키네시스', '에어슬래시', '나비춤', '아침햇살'], ['벌레', '불']),
      sex: 'female',
      ability: abilityData(['벌레의알림', '불꽃몸']),
      hp: 85, attack: 60, defense: 65, spAttack: 135, spDefense: 105, speed: 100,
      level: 50
    },
    {
      id: 537,
      name: '두빅굴',
      types: ['물', '땅'],
      moves: moveData(['하이드로펌프', '지진', '아쿠아브레이크', '냉동펀치', '독찌르기', '스톤에지', '파워휩', '스텔스록'], ['물', '땅']),
      sex: 'male',
      ability: abilityData(['저수', '독수']),
      hp: 105,
      attack: 95,
      defense: 75,
      spAttack: 85,
      spDefense: 75,
      speed: 74,
      level: 50
    },
    {
      id: 542,
      name: '모아머',
      types: ['벌레', '풀'],
      moves: moveData(['마지막일침', '리프블레이드', '덤벼들기', '개척하기', '섀도클로', '독찌르기', '트리플악셀', '칼춤'], ['벌레', '풀']),
      sex: 'female',
      ability: abilityData(['벌레의알림', '엽록소']),
      hp: 75,
      attack: 103,
      defense: 80,
      spAttack: 70,
      spDefense: 80,
      speed: 92,
      level: 50
    },
    {
      id: 663,
      name: '파이어로',
      types: ['불', '비행'],
      moves: moveData(['브레이브버드', '플레어드라이브', '애크러뱃', '유턴', '칼춤', '전광석화', '날개쉬기', '도깨비불', '열불내기'], ['불', '비행']),
      sex: 'male',
      ability: abilityData(['불꽃몸', '질풍날개']),
      hp: 78, attack: 81, defense: 71, spAttack: 74, spDefense: 69, speed: 126,
      level: 50
    },
    {
      id: 693,
      name: '블로스터',
      types: ['물'],
      moves: moveData(['물의파동', '러스터캐논', '악의파동', '용의파동', '파동탄', '냉동빔', '퀵턴', '얼어붙은바람'], ['물']),
      sex: 'male',
      ability: abilityData(['메가런처']),
      hp: 71, attack: 73, defense: 88, spAttack: 120, spDefense: 89, speed: 59,
      level: 50
    },
    {
      id: 711,
      name: '펌킨인',
      types: ['고스트', '풀'],
      moves: moveData(['고스트다이브', '씨폭탄', '스톤샤워', '야습', '도깨비불', '파워휩', '트릭룸', '폴터가이스트', '불대문자'], ['고스트', '풀']),
      sex: 'female',
      ability: abilityData(['불면']),
      hp: 65, attack: 90, defense: 122, spAttack: 58, spDefense: 75, speed: 84,
      level: 50
    },
    {
      id: 758,
      name: '염뉴트',
      types: ['불', '독'],
      moves: moveData(['화염방사', '맹독', '도깨비불', '애시드봄', '섀도볼', '오물폭탄', '전기자석파', '개척하기', '불대문자'], ['불', '독']),
      sex: 'female',
      ability: abilityData(['부식', '둔감']),
      hp: 68, attack: 64, defense: 60, spAttack: 111, spDefense: 60, speed: 117,
      level: 50
    },
    {
      id: 752,
      name: '깨비물거미',
      types: ['물', '벌레'],
      moves: moveData(['아쿠아브레이크', '흡혈', '덤벼들기', '독찌르기', '개척하기', '기가드레인', '폭포오르기'], ['물', '벌레']),
      sex: 'male',
      ability: abilityData(['수포', '저수']),
      hp: 68, attack: 70, defense: 92, spAttack: 50, spDefense: 132, speed: 42,
      level: 50
    },
    {
      id: 763,
      name: '달코퀸',
      types: ['풀'],
      moves: moveData(['트로피컬킥', '유턴', '씨폭탄', '무릎차기', '기가드레인', '개척하기', '애크러뱃', '로킥', '트리플악셀'], ['풀']),
      sex: 'female',
      ability: abilityData(['여왕의위엄', '리프가드']),
      hp: 72, attack: 120, defense: 98, spAttack: 50, spDefense: 98, speed: 72,
      level: 50
    },
    {
      id: 839,
      name: '석탄산',
      types: ['바위', '불'],
      moves: moveData(['스톤에지', '화염방사', '암석봉인', '열탕', '대폭발', '스텔스록', '지진', '플레어드라이브'], ['바위', '불']),
      sex: 'male',
      ability: abilityData(['불꽃몸', '증기기관']),
      hp: 110, attack: 80, defense: 120, spAttack: 80, spDefense: 90, speed: 30,
      level: 50
    },
    {
      id: 902,
      name: '대쓰여너',
      types: ['물', '고스트'],
      moves: moveData(['웨이크태클', '아쿠아브레이크', '깨물어부수기', '아쿠아제트', '성묘', '고속이동', '양날박치기'], ['물', '고스트']),
      sex: 'male',
      ability: abilityData(['적응력', '틀깨기']),
      hp: 120, attack: 112, defense: 65, spAttack: 80, spDefense: 75, speed: 78,
      level: 50
    },
    {
      id: 841,
      name: '애프룡',
      types: ['풀', '드래곤'],
      moves: moveData(['개척하기', '드래곤클로', 'G의힘', '용의춤', '애크러뱃', '기습', '유턴', '제비반환'], ['풀', '드래곤']),
      sex: 'female',
      ability: abilityData(['의욕']),
      hp: 70, attack: 110, defense: 80, spAttack: 95, spDefense: 60, speed: 70,
      level: 50
    },
    {
      id: 937,
      name: '파라블레이즈',
      types: ['불꽃', '고스트'],
      moves: moveData(
        ['원념의칼', '야습', '니트로차지', '폴터가이스트', '아이언헤드', '이상한빛', '인파이트', '독찌르기'],
        ['불꽃', '고스트']
      ),
      sex: 'male',
      ability: abilityData(['깨어진갑옷']),
      hp: 75,
      attack: 125,
      defense: 80,
      spAttack: 60,
      spDefense: 100,
      speed: 85,
      level: 50
    },
    {
      id: 977,
      name: '어써러셔',
      types: ['물'],
      moves: moveData(
        ['웨이브태클', '아쿠아브레이크', '헤비봄버', '눈사태', '땅가르기', '바디프레스', '스톤샤워', '지진'],
        ['물']
      ),
      sex: 'male',
      ability: abilityData(['천진', '수의베일']),
      hp: 150,
      attack: 100,
      defense: 115,
      spAttack: 65,
      spDefense: 65,
      speed: 35,
      level: 50
    },
    {
      id: 952,
      name: '스코빌런',
      types: ['풀', '불'],
      moves: moveData(['기가드레인', '불대문자', '개척하기', '오버히트', '깨물어부수기', '분함의발구르기', '방어'], ['풀', '불']),
      sex: 'male',
      ability: abilityData(['변덕쟁이', '엽록소']),
      hp: 65, attack: 108, defense: 65, spAttack: 108, spDefense: 65, speed: 75,
      level: 50
    },
  ]
}