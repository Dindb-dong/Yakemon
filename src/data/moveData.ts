import { useBattleStore } from "../Context/useBattleStore";
import { MoveInfo } from "../models/Move";
import { shuffleArray } from "../utils/shuffle";

const moveDatas: MoveInfo[] = [
  {
    name: '기가드레인',
    type: '풀',
    category: '특수',
    power: 75,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1, heal: 0.5 }],
    target: 'opponent',
  },
  {
    name: '오물폭탄',
    type: '독',
    category: '특수',
    power: 90,
    pp: 10,
    isTouch: false,
    affiliation: '폭탄',
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.1, status: '독' }],
    target: 'opponent',
  },
  {
    name: '대지의힘',
    type: '땅',
    category: '특수',
    power: 90,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.1,
      statChange: [{
        target: 'opponent',
        stat: 'spDefense',
        change: -1
      }],
    }],
    target: 'opponent',
  },
  {
    name: '수면가루',
    type: '풀',
    category: '변화',
    power: 0,
    pp: 15,
    isTouch: false,
    affiliation: '가루',
    accuracy: 75,
    criticalRate: 0,
    effects: [{ chance: 1, status: '잠듦' }],
    target: 'opponent'
  },
  {
    name: "맹독",
    type: "독",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    target: "opponent",
    effects: [{ chance: 1, status: "맹독" }]
  },
  {
    name: "광합성",
    type: "풀",
    category: "변화",
    power: 0,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1, heal: 0.5 }],
    target: "self"
  },
  {
    name: "씨뿌리기",
    type: "풀",
    category: "변화",
    power: 0,
    pp: 10,
    isTouch: false,
    accuracy: 90,
    criticalRate: 0,
    effects: [{ chance: 1, status: "씨뿌리기" }],
    target: "opponent"
  },
  {
    name: '쾌청',
    type: '불',
    category: '변화',
    power: 0,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    weather: '쾌청',
    target: 'none',
  },// 이상해꽃
  {
    name: '에어슬래시',
    type: '비행',
    category: '특수',
    power: 75,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.3, status: '풀죽음' }],
    target: 'opponent',
  },
  {
    name: '불대문자',
    type: '불',
    category: '특수',
    power: 110,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 85,
    criticalRate: 0,
    effects: [{ chance: 0.1, status: '화상' }],
    target: 'opponent',
  },
  {
    name: '지진',
    type: '땅',
    category: '물리',
    power: 100,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '오버히트',
    type: '불',
    category: '특수',
    power: 130,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, statChange: [{ target: 'self', stat: 'spAttack', change: -2 }] }],
    target: 'opponent',
  },
  {
    name: '화염방사',
    type: '불',
    category: '특수',
    power: 90,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.1, // 10% 확률
      status: '화상'
    }],
    target: 'opponent',
  },
  {
    name: '폭풍',
    type: '비행',
    category: '특수',
    power: 110,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 70,
    criticalRate: 0,
    effects: [{
      chance: 0.3,
      status: '혼란',
    }],
    target: 'opponent',
  },
  {
    name: '원시의힘',
    type: '바위',
    category: '특수',
    power: 60,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.1,
      statChange: [
        { target: 'self', stat: 'attack', change: 1 },
        { target: 'self', stat: 'defense', change: 1 },
        { target: 'self', stat: 'spAttack', change: 1 },
        { target: 'self', stat: 'spDefense', change: 1 },
        { target: 'self', stat: 'speed', change: 1 },
      ],
    }],
    target: 'opponent',
  },//리자몽
  {
    name: '하이드로펌프',
    type: '물',
    category: '특수',
    power: 110,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 80,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '냉동빔',
    type: '얼음',
    category: '특수',
    power: 90,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.1, status: '얼음' }],
    target: 'opponent',
  },
  {
    name: '껍질깨기',
    type: '노말',
    category: '변화',
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{
        target: 'self',
        stat: 'defense',
        change: -1
      }, {
        target: 'self',
        stat: 'spDefense',
        change: -1
      }, {
        target: 'self',
        stat: 'attack',
        change: 2
      },
      {
        target: 'self',
        stat: 'spAttack',
        change: 2,
      }, {
        target: 'self',
        stat: 'speed',
        change: 2
      }
      ]
    }],
    target: 'self',
  },
  {
    name: '악의파동',
    type: '악',
    category: '특수',
    power: 80,
    pp: 15,
    isTouch: false,
    affiliation: '파동',
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.3,
      status: '풀죽음',
    }],
    target: 'opponent',
  },
  {
    name: '파동탄',
    type: '격투',
    category: '특수',
    power: 80,
    pp: 20,
    isTouch: false,
    affiliation: '파동',
    accuracy: 1000,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '러스터캐논',
    type: '강철',
    category: '특수',
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.1,
      statChange: [
        { target: 'opponent', stat: 'spDefense', change: -1 },
      ],
    }],
    target: 'opponent',
  },//거북왕
  {
    name: "와일드볼트",
    type: "전기",
    category: "물리",
    power: 90,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, recoil: 0.25 }],
    target: "opponent"
  },
  {
    name: "니트로차지",
    type: "불",
    category: "물리",
    power: 50,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{ target: "self", stat: "speed", change: 1 }]
    }],
    target: "opponent"
  },
  {
    name: '암석봉인',
    type: '바위',
    category: '물리',
    power: 60,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 95,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'opponent', stat: 'speed', change: -1 },
      ],
    }],
    target: 'opponent',
  },// 블레이범
  {
    name: '드래곤테일',
    type: '드래곤',
    category: '물리',
    power: 60,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    priority: -1,
    exile: true, // 강제로 상대 교체
    target: 'opponent',
  },// 메가니움
  {
    name: "용의춤",
    type: "드래곤",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1, statChange:
        [{ target: "self", stat: "attack", change: 1 }, { target: "self", stat: "speed", change: 1 }]
    }],
    target: "self"
  },
  {
    name: "아쿠아브레이크",
    type: "물",
    category: "물리",
    power: 85,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.2, statChange: [{ target: "opponent", stat: "defense", change: -1 }] }],
    target: "opponent"
  },
  {
    name: "냉동펀치",
    type: "얼음",
    category: "물리",
    power: 75,
    pp: 15,
    isTouch: true,
    affiliation: "펀치",
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.1, status: "얼음" }],
    target: "opponent"
  },
  {
    name: "엄청난힘",
    type: "격투",
    category: "물리",
    power: 120,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{
      chance: 1,
      statChange: [
        { target: "self", stat: "attack", change: -1 },
        { target: "self", stat: "defense", change: -1 }
      ]
    }],
    target: "opponent"
  },
  {
    name: '스톤샤워',
    type: '바위',
    category: '물리',
    power: 75,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [{
      chance: 0.3,
      status: '풀죽음',
    }],
    target: 'opponent',
  },
  {
    name: '깨물어부수기',
    type: '악',
    category: '물리',
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.2,
      statChange: [
        { target: 'opponent', stat: 'defense', change: -1 },
      ],
    }],
    target: 'opponent',
  },
  {
    name: '개척하기',
    type: '풀',
    category: '물리',
    power: 50,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'self', stat: 'speed', change: 1 },
      ],
    }],
    target: 'opponent',
  },// 장크로다일 
  {
    name: "칼춤",
    type: "노말",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{ target: "self", stat: "attack", change: 2 }]
    }],
    target: "self"
  },
  {
    name: "플레어드라이브",
    type: "불",
    category: "물리",
    power: 120,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{
      chance: 1,
      recoil: 0.33,
    }],
    effects: [{ chance: 0.1, status: "화상" }],
    target: "opponent"
  },
  {
    name: "인파이트",
    type: "격투",
    category: "물리",
    power: 120,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{
      chance: 1,
      statChange: [
        { target: "self", stat: "defense", change: -1 },
        { target: "self", stat: "spDefense", change: -1 }
      ]
    }],
    target: "opponent"
  },
  {
    name: "스톤에지",
    type: "바위",
    category: "물리",
    power: 100,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 80,
    criticalRate: 1,
    target: "opponent"
  },
  {
    name: '블레이즈킥',
    type: '불',
    category: '물리',
    power: 85,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 1,
    effects: [{
      chance: 0.1,
      status: '화상',
    }],
    target: 'opponent',
  },// 번치코 
  {
    name: "진공파",
    type: "격투",
    category: "특수",
    power: 40,
    pp: 30,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: "opponent"
  },
  {
    name: "용의파동",
    type: "드래곤",
    category: "특수",
    power: 85,
    pp: 15,
    isTouch: false,
    affiliation: '파동',
    accuracy: 100,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: '애크러뱃',
    type: '비행',
    category: '물리',
    power: 110,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },// 나무킹 
  {
    name: "퀵턴",
    type: "물",
    category: "물리",
    power: 60,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    uTurn: true,
    target: "opponent"
  },
  {
    name: "눈사태",
    type: "얼음",
    category: "물리",
    power: 120,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: -4,
    target: "opponent"
  },
  {
    name: '독찌르기',
    type: '독',
    category: '물리',
    power: 80,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.3,
      status: '독',
    }],
    target: 'opponent',
  },
  {
    name: '벌크업',
    type: '격투',
    category: '변화',
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'self', stat: 'attack', change: 1 },
        { target: 'self', stat: 'defense', change: 1 }
      ],
    }],
    target: 'self',
  },
  {
    name: '스텔스록',
    type: '바위',
    category: '변화',
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    trap: '스텔스록',
    target: 'none',
  },// 대짱이 
  {
    name: "번개펀치",
    type: "전기",
    category: "물리",
    power: 75,
    pp: 15,
    isTouch: true,
    affiliation: "펀치",
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.1, status: "마비" }],
    target: "opponent"
  },
  {
    name: "드레인펀치",
    type: "격투",
    category: "물리",
    power: 75,
    pp: 10,
    isTouch: true,
    affiliation: "펀치",
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1, heal: 0.5 }],
    target: "opponent"
  },
  {
    name: '마하펀치',
    type: '격투',
    category: '물리',
    power: 40,
    pp: 30,
    isTouch: true,
    affiliation: '펀치',
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: 'opponent',
  },
  {
    name: '더스트슈트',
    type: '독',
    category: '물리',
    power: 120,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 80,
    criticalRate: 0,
    effects: [{
      chance: 0.3,
      status: '독',
    }],
    target: 'opponent',
  },// 초염몽 
  {
    name: "아이언헤드",
    type: "강철",
    category: "물리",
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 0.3, status: "풀죽음" }],
    target: "opponent"
  },
  {
    name: "우드해머",
    type: "풀",
    category: "물리",
    power: 120,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, recoil: 0.33 }],
    target: "opponent"
  },
  {
    name: "들이받기",
    type: "땅",
    category: "물리",
    power: 120,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{
      chance: 1,
      statChange: [
        { target: "self", stat: "defense", change: -1 },
        { target: "self", stat: "spDefense", change: -1 }
      ]
    }],
    target: "opponent"
  },// 토대부기 
  {
    name: "풀묶기",
    type: "풀",
    category: "특수",
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: '날개쉬기',
    type: '비행',
    category: '변화',
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      heal: 0.5,
    }],
    target: 'self',
  }, // 엠페르트 
  {
    name: "양날박치기",
    type: "바위",
    category: "물리",
    power: 150,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 80,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, recoil: 0.5 }],
    target: "opponent",
  }, // 염무왕 
  {
    name: "리프스톰",
    type: "풀",
    category: "특수",
    power: 130,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, statChange: [{ target: "self", stat: "spAttack", change: -2 }] }],
    target: "opponent",
  },
  {
    name: "뱀눈초리",
    type: "노말",
    category: "변화",
    power: 0,
    pp: 30,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1, status: "마비" }],
    target: "opponent",
  },
  {
    name: '아쿠아테일',
    type: '물',
    category: '물리',
    power: 90,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    target: 'opponent',
  },// 샤로다 
  {
    name: "아쿠아제트",
    type: "물",
    category: "물리",
    power: 40,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: "opponent",
  },
  {
    name: '땅고르기',
    type: '땅',
    category: '물리',
    power: 60,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'opponent', stat: 'speed', change: -1 }
      ],
    }],
    target: 'opponent',
  },
  {
    name: '성스러운칼',
    type: '격투',
    category: '물리',
    power: 90,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      rank_nullification: true,
    }],
    target: 'opponent',
  },// 대검귀 
  {
    name: '매지컬플레임',
    type: '불',
    category: '특수',
    power: 75,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{ target: 'opponent', stat: 'spAttack', change: -1 }]
    }],
    target: 'opponent',
  },
  {
    name: '사이코키네시스',
    type: '에스퍼',
    category: '특수',
    power: 90,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.1,
      statChange: [{ target: 'opponent', stat: 'spDefense', change: -1 }]
    }],
    target: 'opponent',
  },
  {
    name: '에너지볼',
    type: '풀',
    category: '특수',
    power: 90,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.1,
      statChange: [{ target: 'opponent', stat: 'spDefense', change: -1 }]
    }],
    target: 'opponent',
  },
  {
    name: '명상',
    type: '에스퍼',
    category: '변화',
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'self', stat: 'spAttack', change: 1 },
        { target: 'self', stat: 'spDefense', change: 1 }
      ]
    }],
    target: 'self',
  },
  {
    name: '이상한빛',
    type: '고스트',
    category: '변화',
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      status: '혼란'
    }],
    target: 'opponent',
  },
  {
    name: '매지컬샤인',
    type: '페어리',
    category: '특수',
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },// 마폭시 
  {
    name: '바디프레스',
    type: '격투',
    category: '물리',
    power: 80,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '철벽',
    type: '강철',
    category: '변화',
    power: 0,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{ target: 'self', stat: 'defense', change: 2 }]
    }],
    target: 'self',
  },
  {
    name: '씨기관총',
    type: '풀',
    category: '물리',
    power: 25,
    pp: 30,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1, multiHit: true }],
    target: 'opponent',
  },
  {
    name: '바늘미사일',
    type: '벌레',
    category: '물리',
    power: 25,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 95,
    criticalRate: 0,
    effects: [{
      chance: 1,
      multiHit: true
    }],
    target: 'opponent',
  },
  {
    name: '니들가드',
    type: '풀',
    category: '변화',
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    protect: true,
    priority: 4,
    target: 'self'
  },// 브리가론 
  {
    name: '물수리검',
    type: '물',
    category: '특수',
    power: 15,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    effects: [{ chance: 1, multiHit: true }],
    target: 'opponent',
  },
  {
    name: '독압정',
    type: '독',
    category: '변화',
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: 'none',
    trap: '독압정'
  },// 개굴닌자 
  {
    name: '도깨비불',
    type: '불',
    category: '변화',
    power: 0,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 85,
    criticalRate: 0,
    effects: [{
      chance: 1,
      status: '화상'
    }],
    target: 'opponent',
  },
  {
    name: 'DD래리어트',
    type: '악',
    category: '물리',
    power: 85,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      rank_nullification: true
    }],
    target: 'opponent',
  },
  {
    name: '막말내뱉기',
    type: '악',
    category: '변화',
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    uTurn: true,
    effects: [{
      chance: 1, statChange: [
        { target: 'opponent', stat: 'spAttack', change: -1 },
        { target: 'opponent', stat: 'attack', change: -1 }
      ],
    }],
    target: 'opponent',
  },
  {
    name: '크로스촙',
    type: '격투',
    category: '물리',
    power: 100,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 80,
    criticalRate: 1, // 높은 급소율
    target: 'opponent',
  },// 어흥염 
  {
    name: '리프블레이드',
    type: '풀',
    category: '물리',
    power: 90,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 1,
    target: 'opponent',
  },
  {
    name: '폴터가이스트',
    type: '고스트',
    category: '물리',
    power: 110,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '더블윙',
    type: '비행',
    category: '물리',
    power: 40,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [{
      chance: 1,
      doubleHit: true
    }],
    target: 'opponent',
  },
  {
    name: "야습",
    type: "고스트",
    category: "물리",
    power: 40,
    pp: 30,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: "opponent"
  },
  {
    name: '섀도클로',
    type: '고스트',
    category: '물리',
    power: 70,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 1,
    target: 'opponent',
  },// 모크나이퍼
  {
    name: '물거품아리아',
    type: '물',
    category: '특수',
    power: 90,
    pp: 10,
    isTouch: false,
    affiliation: '소리',
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '문포스',
    type: '페어리',
    category: '특수',
    power: 95,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 0.3,
      statChange: [{ target: 'opponent', stat: 'spAttack', change: -1 }]
    }],
    target: 'opponent',
  },
  {
    name: '드레인키스',
    type: '페어리',
    category: '특수',
    power: 50,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      heal: 0.75 // 준 피해의 75% 회복
    }],
    target: 'opponent',
  },// 누리레느
  {
    name: '화염볼',
    type: '불',
    category: '물리',
    power: 120,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [{ chance: 0.1, status: '화상' }],
    target: 'opponent',
  },
  {
    name: '무릎차기',
    type: '격투',
    category: '물리',
    power: 130,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, fail: 0.5 }], // 빗맞을 시 반동
    target: 'opponent',
  },
  {
    name: '유턴',
    type: '벌레',
    category: '물리',
    power: 70,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    uTurn: true,
    target: 'opponent',
  }, // 에이스번 
  {
    name: '그래스슬라이더',
    type: '풀',
    category: '물리',
    power: 55,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: 'opponent',
  },
  {
    name: '10만마력',
    type: '땅',
    category: '물리',
    power: 95,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 95,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: "드럼어택",
    type: "풀",
    category: "물리",
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{ target: "opponent", stat: "speed", change: -1 }]
    }],
    target: "opponent"
  },
  {
    name: '로킥',
    type: '격투',
    category: '물리',
    power: 65,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'opponent', stat: 'speed', change: -1 }
      ]
    }],
    target: 'opponent',
  },// 고릴타 
  {
    name: '기충전',
    type: '노말',
    category: '변화',
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'self', stat: 'critical', change: 2 },
      ]
    }],
    target: 'self',
  },
  {
    name: '노려맞히기',
    type: '물',
    category: '특수',
    power: 80,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },
  {
    name: '에어커터',
    type: '비행',
    category: '특수',
    power: 60,
    pp: 25,
    isTouch: false,
    affiliation: '바람',
    accuracy: 95,
    criticalRate: 1, // 높은 급소율
    target: 'opponent',
  },// 인텔리레온 
  {
    name: '게으름피우기',
    type: '노말',
    category: '변화',
    power: 0,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1, heal: 0.5 }],
    target: 'self',
  },
  {
    name: '플레어송',
    type: '불',
    category: '특수',
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'self', stat: 'spAttack', change: 1 },
      ],
    }],
    target: 'opponent',
  },
  {
    name: '씨폭탄',
    type: '풀',
    category: '물리',
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: '폭탄',
    accuracy: 100,
    criticalRate: 0,
    target: 'opponent',
  },// 라우드본 
  {
    name: '치근거리기',
    type: '페어리',
    category: '물리',
    power: 90,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [{
      chance: 0.1,
      statChange: [
        { target: 'opponent', stat: 'spAttack', change: -1 },
      ],
    }],
    target: 'opponent',
  },
  {
    name: '트릭플라워',
    type: '풀',
    category: '물리',
    power: 70,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 1000, // 확정명중
    criticalRate: 3, // 확정급소
    target: 'opponent',
  },
  {
    name: '깜짝베기',
    type: '악',
    category: '물리',
    power: 70,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 1, // 급소율 높음 
    target: 'opponent',
  },
  {
    name: '트리플악셀',
    type: '얼음',
    category: '물리',
    power: 20, // 실제로는 20 → 40 → 60으로 점점 강해짐
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [{
      chance: 1,
      tripleHit: true // 세 번 연속 공격
    }],
    target: 'opponent',
  },
  {
    name: '찬물끼얹기',
    type: '물',
    category: '특수',
    power: 50,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [{ target: 'opponent', stat: 'attack', change: -1 }]
    }],
    target: 'opponent',
  },// 마스카나 
  {
    name: '아쿠아스텝',
    type: '물',
    category: '물리',
    power: 80,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{
      chance: 1,
      statChange: [
        { target: 'self', stat: 'speed', change: 1 },
      ],
    }],
    target: 'opponent',
  },
  {
    name: '웨이브태클',
    type: '물',
    category: '물리',
    power: 120,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, recoil: 0.33 }], // 반동 1/3
    target: 'opponent',
  },
  {
    name: '브레이브버드',
    type: '비행',
    category: '물리',
    power: 120,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    demeritEffects: [{ chance: 1, recoil: 0.33 }],
    target: 'opponent',
  }, // 웨이니발 
  {
    name: "폭포오르기",
    type: "물",
    category: "물리",
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      { chance: 0.2, status: "풀죽음" }
    ],
    target: "opponent"
  },
  {
    name: "열불내기",
    type: "불",
    category: "물리",
    power: 75,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    boostOnMissedPrev: true,
    target: "opponent"
  },
  {
    name: "분함의발구르기",
    type: "땅",
    category: "물리",
    power: 75,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    boostOnMissedPrev: true,
    target: "opponent"
  },
  {
    name: "기습",
    type: "악",
    category: "물리",
    power: 70,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    // 특수 구현: 상대의 공격 기술에만 발동. 상대방이 반동으로 움직일 수 없게 되어도 성공한다.

    // 상대방이 기술을 사용하기 위해 힘을 모으는 중이어도 성공한다.

    // 상대방이 잠듦, 얼음으로 움직일 수 없게 되어도 공격기술을 선택했다면 성공한다.
    target: "opponent"
  },
  {
    name: "트릭룸",
    type: "에스퍼",
    category: "변화",
    power: 0,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    room: "트릭룸",
    target: "none"
  },
  {
    name: "열탕",
    type: "물",
    category: "특수",
    power: 80,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 0.3,
        status: "화상"
      }
    ],
    target: "opponent"
  },
  {
    name: "미러코트",
    type: "에스퍼",
    category: "특수",
    power: 0, // 실질적 위력은 계산에서 2배로 따로 처리됨
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: -4,
    counter: true,
    target: "opponent"
  },
  {
    name: "나비춤",
    type: "벌레",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1.0,
        statChange: [
          { target: "self", stat: "spAttack", change: 1 },
          { target: "self", stat: "spDefense", change: 1 },
          { target: "self", stat: "speed", change: 1 }
        ]
      }
    ],
    target: "self"
  },
  {
    name: "힘흡수",
    type: "풀",
    category: "변화",
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1.0,
        heal: 1.0, // 상대 공격력만큼 회복. base.attack * rankEffect
        statChange: [
          {
            target: 'opponent', stat: 'attack',
            change: -1
          }
        ]
      }
    ],
    target: "opponent"
  },
  {
    name: "분연",
    type: "불",
    category: "특수",
    power: 80,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 0.3,
        status: "화상"
      }
    ],
    target: "opponent"
  },
  {
    name: "솔라빔",
    type: "풀",
    category: "특수",
    power: 120,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    chargeTurn: true,
    target: "opponent"
  },
  {
    name: "땅가르기",
    type: "땅",
    category: "물리",
    power: 0,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 30, // 명중률 보정 없음, 상대 회피 랭크 무시 
    criticalRate: 0,
    oneHitKO: true,
    target: "opponent"
    // 옹골참 특성인 포켓몬은 이 기술에 맞지 않는다. 하지만 특성 틀깨기로 옹골참의 포켓몬에게도 이 기술을 사용할 수 있다. 
    // 구멍파기로 땅에 들어간 상태인 포켓몬에게도 맞출수 있다.
  },
  {
    name: "HP회복",
    type: "노말",
    category: "변화",
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        heal: 0.5
      }
    ],
    target: "self"
  },
  {
    name: "매혹의보이스",
    type: "페어리",
    category: "특수",
    power: 80,
    pp: 15,
    isTouch: false,
    affiliation: "소리",
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        status: '혼란',
      }
    ],
    target: "opponent"
  },
  {
    name: "얼어붙은바람",
    type: "얼음",
    category: "특수",
    power: 55,
    pp: 15,
    isTouch: false,
    affiliation: "바람",
    accuracy: 95,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [
          {
            target: "opponent",
            stat: "speed",
            change: -1
          }
        ]
      }
    ],
    target: "opponent"
  },
  {
    name: "발경",
    type: "격투",
    category: "물리",
    power: 60,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 0.3,
        status: "마비"
      }
    ],
    target: "opponent"
  },
  {
    name: "기합구슬",
    type: "격투",
    category: "특수",
    power: 120,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 70,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: "애시드봄",
    type: "독",
    category: "특수",
    power: 40,
    pp: 20,
    isTouch: false,
    affiliation: "폭탄",
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [
          {
            target: "opponent",
            stat: "spDefense",
            change: -2
          }
        ]
      }
    ],
    target: "opponent"
  },
  {
    name: "불꽃춤",
    type: "불",
    category: "특수",
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 0.5,
        statChange: [
          {
            target: "self",
            stat: "spAttack",
            change: 1
          }
        ]
      }
    ],
    target: "opponent"
  },
  {
    name: "파워휩",
    type: "풀",
    category: "물리",
    power: 120,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 85,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: "덤벼들기",
    type: "벌레",
    category: "물리",
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [
          {
            target: "opponent",
            stat: "attack",
            change: -1
          }
        ]
      }
    ],
    target: "opponent"
  },
  {
    name: "전광석화",
    type: "노말",
    category: "물리",
    power: 40,
    pp: 30,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: "opponent"
  },
  {
    name: "신속",
    type: "노말",
    category: "물리",
    power: 80,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 2,
    target: "opponent"
  },
  {
    name: "물의파동",
    type: "물",
    category: "특수",
    power: 60,
    pp: 20,
    isTouch: false,
    affiliation: "파동",
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 0.2,
        status: "혼란"
      }
    ],
    target: "opponent"
  },
  {
    name: "고스트다이브",
    type: "고스트",
    category: "물리",
    power: 90,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    chargeTurn: true,
    position: '공허',
    target: "opponent"
  },
  {
    name: "전기자석파",
    type: "전기",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        status: "마비"
      }
    ],
    target: "opponent"
  },
  {
    name: "트로피컬킥",
    type: "풀",
    category: "물리",
    power: 70,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [
          {
            target: "opponent",
            stat: "attack",
            change: -1
          }
        ]
      }
    ],
    target: "opponent"
  },
  {
    name: "대폭발",
    type: "노말",
    category: "물리",
    power: 250,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    selfKill: true,
    demeritEffects: [
      {
        chance: 1,
        fail: 1, // 자기 자신 기절 처리 (battleSequence에서 따로 처리 필요)
        recoil: 1,
      }
    ],
    target: "opponent"
  },
  {
    name: "성묘",
    type: "고스트",
    category: "물리",
    power: 100,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    getPower: (team) => {
      const aliveCount = team.filter(p => p.currentHp > 0).length;
      return Math.max(0, (4 - aliveCount) * 50);
    },
    target: "opponent"
  },
  {
    name: "드래곤클로",
    type: "드래곤",
    category: "물리",
    power: 80,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: 'G의힘',
    type: '풀',
    category: '물리',
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [
          {
            target: 'opponent',
            stat: 'defense',
            change: -1
          }
        ]
      }
    ],
    target: 'opponent'
  },
  {
    name: '원념의칼',
    type: '불',
    category: '물리',
    power: 90,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        heal: 0.5
      }
    ],
    target: 'opponent'
  },
  {
    name: '방어',
    type: '노말',
    category: '변화',
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    protect: true,
    priority: 4,
    target: 'self'
  },
  {
    name: '마지막일침',
    type: '벌레',
    category: '물리',
    power: 50,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [{ chance: 1 }],
    target: 'opponent'
  },
  {
    name: "볼부비부비",
    type: "전기",
    category: "물리",
    power: 20,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      { chance: 1, status: "마비" }
    ],
    target: "opponent"
  },
  {
    name: "나쁜음모",
    type: "악",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [
          { target: "self", stat: "spAttack", change: 2 }
        ]
      }
    ],
    target: "self"
  },
  {
    name: "10만볼트",
    type: "전기",
    category: "특수",
    power: 90,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [
      { chance: 0.1, status: "마비" }
    ],
    target: "opponent"
  },
  {
    name: "볼트체인지",
    type: "전기",
    category: "특수",
    power: 70,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    effects: [],
    uTurn: true,
    target: "opponent"
  },
  {
    name: "구멍파기",
    type: "땅",
    category: "물리",
    power: 80,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    chargeTurn: true,
    target: "opponent"
  },
  {
    name: "메가혼",
    type: "벌레",
    category: "물리",
    power: 120,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 85,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: "파도타기",
    type: "물",
    category: "특수",
    power: 90,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: "일렉트릭네트",
    type: "전기",
    category: "특수",
    power: 55,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 95,
    criticalRate: 0,
    effects: [
      {
        chance: 1,
        statChange: [{ target: "opponent", stat: "speed", change: -1 }]
      }
    ],
    target: "opponent"
  },
  {
    name: "차지빔",
    type: "전기",
    category: "특수",
    power: 50,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    effects: [
      {
        chance: 0.5,
        statChange: [{ target: "self", stat: "spAttack", change: 1 }]
      }
    ],
    target: "opponent"
  },
  {
    name: "얼음뭉치",
    type: "얼음",
    category: "물리",
    power: 40,
    pp: 30,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: "opponent"
  },
  {
    name: "절대영도",
    type: "얼음",
    category: "특수",
    power: 0, // 명중 시 기절이므로 위력은 0으로 표기
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 30,
    criticalRate: 0,
    priority: 0,
    oneHitKO: true,
    target: "opponent"
  },
  {
    name: "메테오빔",
    type: "바위",
    category: "특수",
    power: 120,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    priority: 0,
    chargeTurn: true,
    effects: [{ chance: 1, statChange: [{ target: "self", stat: "spAttack", change: 1 }] }],
    target: "opponent"
  },
  {
    name: "흡혈",
    type: "벌레",
    category: "물리",
    power: 80,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    effects: [{ chance: 1, heal: 0.5 }],
    target: "opponent"
  },
  {
    name: "크로스포이즌",
    type: "독",
    category: "물리",
    power: 70,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 1,
    priority: 0,
    effects: [{ chance: 0.1, status: "독" }],
    target: "opponent"
  },
  {
    name: "공중날기",
    type: "비행",
    category: "물리",
    power: 90,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 95,
    criticalRate: 0,
    priority: 0,
    chargeTurn: true,
    position: "하늘",
    target: "opponent"
  },
  {
    name: '얼음엄니',
    type: '얼음',
    category: '물리',
    power: 65,
    isTouch: true,
    affiliation: '물기',
    accuracy: 95,
    pp: 15,
    priority: 0,
    effects: [{ chance: 0.1, status: '얼음' }, { chance: 0.1, status: '풀죽음' }],
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: '불꽃엄니',
    type: '불꽃',
    category: '물리',
    power: 65,
    accuracy: 95,
    pp: 15,
    priority: 0,
    effects: [{ chance: 0.1, status: '화상' }, { chance: 0.1, status: '풀죽음' }],
    isTouch: true,
    affiliation: '물기',
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: '번개엄니',
    type: '전기',
    category: '물리',
    power: 65,
    accuracy: 95,
    pp: 15,
    priority: 0,
    effects: [{ chance: 0.1, status: '마비' }, { chance: 0.1, status: '풀죽음' }],
    isTouch: true,
    affiliation: '물기',
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: '누르기',
    type: '노말',
    category: '물리',
    power: 85,
    accuracy: 100,
    pp: 10,
    priority: 0,
    effects: [{ chance: 0.3, status: '마비' }],
    isTouch: true,
    affiliation: null,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: '헤비봄버',
    type: '강철',
    category: '물리',
    power: 80, // 위력은 상대의 무게에 따라 변동하지만... 일단은 고정
    accuracy: 100,
    pp: 10,
    priority: 0,
    isTouch: true,
    affiliation: null,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: "파워젬",
    type: "바위",
    category: "특수",
    power: 80,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    target: "opponent"
  },
  {
    name: "시그널빔",
    type: "벌레",
    category: "특수",
    power: 75,
    pp: 15,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    effects: [{ chance: 0.1, status: "혼란" }],
    target: "opponent"
  },
  {
    name: "불릿펀치",
    type: "강철",
    category: "물리",
    power: 40,
    pp: 30,
    isTouch: true,
    affiliation: "펀치",
    accuracy: 100,
    criticalRate: 0,
    priority: 1,
    target: "opponent"
  },
  {
    name: "카운터",
    type: "격투",
    category: "물리",
    power: 0,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: -4,
    target: "opponent",
    counter: true // 특수 속성
  },
  {
    name: "지옥찌르기",
    type: "악",
    category: "물리",
    power: 80,
    pp: 20,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    target: "opponent",
    effects: [{ chance: 1, status: '소리기술사용불가' }],
  },
  {
    name: "비바라기",
    type: "물",
    category: "변화",
    power: 0,
    pp: 5,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    weather: "비",
    target: "none",
  },
  {
    name: "스케일샷",
    type: "드래곤",
    category: "물리",
    power: 25,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 90,
    criticalRate: 0,
    priority: 0,
    effects: [{ chance: 1, multiHit: true },
    {
      chance: 1, statChange: [
        { target: "self", stat: "speed", change: 1 }, { target: "self", stat: "defense", change: -1 }
      ]
    }
    ],
    target: "opponent"
  },
  {
    name: "메탈버스트",
    type: "강철",
    category: "물리",
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    counter: true,
    target: "opponent"
  },
  {
    name: "만나자마자",
    type: "벌레",
    category: "물리",
    power: 90,
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 1,
    priority: 2,
    firstTurnOnly: true,
    getPower(team, side) {
      const { activeEnemy, activeMy } = useBattleStore.getState();
      const activeIndex = side === 'my' ? activeMy : activeEnemy;
      const activePokemon = team[activeIndex];
      return activePokemon.isFirstTurn ? 90 : 0;
    },
    target: "opponent"
  },
  {
    name: "록커트",
    type: "바위",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    effects: [{ chance: 1, statChange: [{ target: "self", stat: "speed", change: 2 }] }],
    target: "self"
  },
  {
    name: "이판사판태클",
    type: "노말",
    category: "물리",
    power: 120,
    pp: 15,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    target: "opponent",
    demeritEffects: [
      {
        chance: 1,
        recoil: 0.33, // 주는 피해의 1/4 반동
      }
    ]
  },
  {
    name: "목숨걸기", // 쓰면 죽는 로직 만들기 
    type: "격투",
    category: "특수",
    power: 0, // 포켓몬의 현재 체력만큼 데미지. 
    pp: 5,
    isTouch: true,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    target: "opponent",
    selfKill: true,
    demeritEffects: [
      {
        chance: 1,
        fail: 1, // 자기 자신 기절 처리 (battleSequence에서 따로 처리 필요)
        recoil: 1,
      }
    ],
    getPower: (team, side?: 'my' | 'enemy') => {
      const { activeEnemy, activeMy } = useBattleStore.getState();
      const activeIndex = side === 'my' ? activeMy : activeEnemy;
      const activePokemon = team[activeIndex];
      return activePokemon.currentHp;
    },
  },
  {
    name: "썬더다이브",
    type: "비행",
    category: "물리",
    power: 100,
    pp: 10,
    isTouch: true,
    affiliation: null,
    accuracy: 95,
    criticalRate: 0,
    priority: 0,
    target: "opponent",
    demeritEffects: [{ chance: 1, fail: 0.5 }], // 반동 50%
  },
  {
    name: "겁나는얼굴",
    type: "노말",
    category: "변화",
    power: 0,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    target: "opponent",
    effects: [
      {
        chance: 1,
        statChange: [
          {
            target: "opponent",
            stat: "speed",
            change: -2
          }
        ]
      }
    ]
  },
  {
    name: "신통력",
    type: "에스퍼",
    category: "특수",
    power: 80,
    pp: 10,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    priority: 0,
    target: "opponent",
    effects: [
      {
        chance: 0.1,
        status: "풀죽음"
      }
    ]
  },
  {
    name: "아이스스피너",
    type: "얼음",
    category: "물리",
    power: 80,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    target: "opponent"
  },
  {
    name: "추억의선물",
    type: "악",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 100,
    criticalRate: 0,
    selfKill: true,
    demeritEffects: [
      {
        chance: 1,
        fail: 1, // 자기 자신 기절 처리 (battleSequence에서 따로 처리 필요)
        recoil: 1,
      }
    ],
    effects: [{
      chance: 1, statChange: [
        { target: "opponent", stat: "attack", change: -2 },
        { target: "opponent", stat: "spAttack", change: -2 },
      ]
    }],
    target: "opponent"
  },
  {
    name: "바크아웃",
    type: "악",
    category: "특수",
    power: 55,
    pp: 15,
    isTouch: false,
    affiliation: "소리",
    accuracy: 95,
    criticalRate: 0,
    effects: [{ chance: 1, statChange: [{ target: "opponent", stat: "spAttack", change: -1 }] }],
    target: "opponent"
  },
  {
    name: "아픔나누기",
    type: "노말",
    category: "변화",
    power: 0,
    pp: 20,
    isTouch: false,
    affiliation: null,
    accuracy: 1000,
    criticalRate: 0,
    // 이거 기술 효과는 따로 구현해야함
    target: "opponent"
  },
]

export function moveData(moveNames: string[], types: string[]): MoveInfo[] {
  const selected = moveNames
    .map(name => moveDatas.find(m => m.name === name))
    .filter((m): m is MoveInfo => !!m);

  // 1. 자속 기술만 골라냄 (power ≥ 10)
  const preferred = selected.filter(
    (move) => types.includes(move.type) && move.power >= 10
  );

  // 2. 나머지 기술 (non-preferred)
  const nonPreferred = selected.filter((move) => !preferred.includes(move));

  const chosen: MoveInfo[] = [];

  // 3. 자속 기술 중 하나만 강제로 포함
  if (preferred.length > 0) {
    const randomPreferred = preferred[Math.floor(Math.random() * preferred.length)];
    chosen.push(randomPreferred);
  }

  // 4. 나머지 풀 구성 (자속 기술 제외한 전체 기술)
  const remainingPool = shuffleArray(selected.filter(m => !chosen.includes(m)));

  for (const move of remainingPool) {
    const isStatus = move.category === "변화";
    const statusCount = chosen.filter(m => m.category === "변화").length;

    if (isStatus && statusCount >= 3) continue; // 변화기술은 최대 3개까지 제한
    if (chosen.length >= 4) break;

    chosen.push(move);
  }

  return shuffleArray(chosen);
}