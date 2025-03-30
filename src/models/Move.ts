import * as fs from "fs";
import * as path from "path";

type StatChange = {
  target: 'opponent' | 'self';
  stat: '공격' | '방어' | '특수공격' | '특수방어' | '스피드' | '명중률' | '회피율';
  change: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

type MoveEffect = {
  chance: number; // 발동 확률, 0.1 ~ 1
  status?: '화상' | '마비' | '독' | '맹독' | '얼음' | '잠듦' | '혼란' | '풀죽음' | '앵콜' | '트집' | '도발';
  recoil?: number; // 반동, 0.1 ~ 1
  heal?: number; // 흡혈, 0.1 ~ 1 
  statChange?: StatChange[];
  multiHit?: boolean; // 다중타격 여부
}

export type MoveInfo = {
  name: string;
  type: string;
  category: '물리' | '특수' | '변화';
  power: number; // 위력 
  pp?: number;
  isTouch: boolean; // 접촉 기술 여부 
  affiliation?: '펀치' | '폭탄' | '바람' | '가루' | null; // 계열 
  accuracy: number; // 명중율. 
  criticalRate: number; // 급소율. 랭크로 나타냄. 0은 6.25프로, ..4는 50프로. 
  effects?: MoveEffect;
};

let movesCache: MoveInfo[] | null = null; // 캐시를 저장할 변수
const movesFilePath = path.resolve(__dirname, "../data/moves.json"); // 경로 문제 방지

async function loadMoves(): Promise<MoveInfo[] | null> {
  if (!movesCache) {
    // 캐시가 없을 때만 파일을 읽음
    const fileData = await fs.promises.readFile(movesFilePath, "utf-8");
    movesCache = JSON.parse(fileData).moves;
  }
  return movesCache;
}

export async function getMoveInfo(moveName: string): Promise<MoveInfo> {
  const moves = await loadMoves();
  const move = moves?.find((move) => move.name === moveName);
  if (!move) {
    throw new Error(`Move with name: ${moveName} not found.`);
  }
  return move as MoveInfo;
}