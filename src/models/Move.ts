import { RankState } from "./RankState";
import { FieldType } from "./Field";
import { StatusState } from "./Status";
import { BattlePokemon } from "./BattlePokemon";

type StatChange = {
  target: 'opponent' | 'self';
  stat: keyof RankState;
  change: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export type ScreenType = '빛의장막' | '리플렉터' | '오로라베일' | null;

type MoveEffect = {
  chance: number; // 발동 확률, 0.1 ~ 1
  status?: StatusState;
  recoil?: number; // 반동, 0.1 ~ 1
  fail?: number; // 공격 빗나갔을 때 데미지 비율, 0.1 ~ 1
  heal?: number; // 흡혈 또는 자힐, 0.1 ~ 1 
  statChange?: StatChange[];
  multiHit?: boolean; // 2~5회 타격 여부 (isAlwaysHit), 명중 여부는 초기에 계산 
  doubleHit?: boolean; // 2회 타격 (isAlwaysHit)
  tripleHit?: boolean; // 3회타격, 트리플악셀이나 트리플킥..
  breakScreen?: boolean; // 빛의장막, 리플렉터 부수는 기술 (사이코팽, 깨트리다)
  rank_nullification?: boolean; // DD래리어트, 성스러운칼, 야금야금 같이 상대 능력변화 무시하고 데미지 주는 기술.
}

export type MoveInfo = {
  name: string;
  type: string;
  category: '물리' | '특수' | '변화';
  power: number; // 위력 
  pp: number;
  isTouch: boolean; // 접촉 기술 여부 
  affiliation?: '펀치' | '폭탄' | '바람' | '가루' | '소리' | '파동' | '물기' | '베기' | null; // 계열 
  accuracy: number; // 명중율. 
  criticalRate: number; // 급소율. 랭크로 나타냄. 0이 기본, 1이 깜짝베기같은거, 3은 확정임 
  demeritEffects?: MoveEffect[]; // 엄청난힘, 인파이트, 플레어드라이브 같은 디메리트 효과. 
  effects?: MoveEffect[];
  priority?: number; // 우선도. 신속은 2, 방어는 4, 기습은 1 등...
  trap?: '독압정' | '스텔스록' | '압정뿌리기' | '압정뿌리기2' | '압정뿌리기3' | '끈적끈적네트';
  field?: FieldType;
  room?: string;
  weather?: string;
  uTurn?: boolean; // 유턴이나 퀵턴, 볼트체인치같이 교체하는 기술.
  exile?: boolean; // 드래곤테일이나 울부짖기, 날려버리기 등 강제교체 기술. 
  protect?: boolean; // 방어나 니들가드 같은 기술.
  counter?: boolean; // 미러코트, 카운터, 메탈버스트 등 
  revenge?: boolean; // 리벤지, 눈사태 등 데미지 받은게 0보다 크면 rate 2배.
  boostOnMissedPrev?: boolean; // 분함의발구르기, 열불내기 등 전 턴 빗나가면 위력 상승. rate 8/5. hadMissed 상태로 비교하면됨
  chargeTurn?: boolean; // 솔라빔같이 차징하는 기술 
  position?: '땅' | '하늘' | '바다' | '공허' | null; // 공허(고스트, 섀도우다이브), 하늘, 바다, 땅 등 
  oneHitKO?: boolean; // 일격필살기 여부. 절대영도, 땅가르기, 뿔드릴, 가위자르기 
  firstTurnOnly?: boolean; // 등장한 턴에만 사용 가능한 기술.
  getPower?: (team: BattlePokemon[], side: 'my' | 'enemy', basePower?: number) => number;
  getAccuracy?: (env: any, side: 'my' | 'enemy', baseAccuracy?: number) => number;
  selfKill?: boolean; // 목숨걸기, 추억의선물, 자폭, 대폭발 등
  screen?: ScreenType;
  cannotMove?: boolean;  // 파괴광선 등 ㅍ
  target: 'self' | 'opponent' | 'none'; // 상대를 때리는 기술인지, 나에게 거는 기술인지, 대상이 없는 기술 (독압정, 쾌청, 씨뿌리기 등 )
};

// 지금은 mockPokemon에 하드코딩했지만, 나중에는 확장성 위해서 아래 로직 사용.

// let movesCache: MoveInfo[] | null = null; // 캐시를 저장할 변수
// const movesFilePath = path.resolve(__dirname, "../data/moves.json"); // 경로 문제 방지

// async function loadMoves(): Promise<MoveInfo[] | null> {
//   if (!movesCache) {
//     // 캐시가 없을 때만 파일을 읽음
//     const fileData = await fs.promises.readFile(movesFilePath, "utf-8");
//     movesCache = JSON.parse(fileData).moves;
//   }
//   return movesCache;
// }

// export async function getMoveInfo(moveName: string): Promise<MoveInfo> {
//   const moves = await loadMoves();
//   const move = moves?.find((move) => move.name === moveName);
//   if (!move) {
//     throw new Error(`Move with name: ${moveName} not found.`);
//   }
//   return move as MoveInfo;
// }