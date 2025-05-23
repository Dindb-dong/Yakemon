import { request } from '../utils/request';
import { User } from '../types/user';

export interface GameResult {
  winCount: number;
  loseCount: number;
  winStreak?: number;
}

export class GameError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GameError';
  }
}

export const updateWinCount = async (result: 'win' | 'lose'): Promise<GameResult> => {
  try {
    const response = await request.post<GameResult>('/count', { result });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new GameError('로그인이 필요합니다.');
    } else if (error.response?.status === 404) {
      throw new GameError('사용자를 찾을 수 없습니다.');
    }
    throw new GameError('승리/패배 기록 업데이트에 실패했습니다.');
  }
};

export const updateWinStreak = async (result: 'win' | 'lose'): Promise<GameResult> => {
  try {
    const response = await request.post<GameResult>('/streak', { result });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new GameError('로그인이 필요합니다.');
    } else if (error.response?.status === 404) {
      throw new GameError('사용자를 찾을 수 없습니다.');
    }
    throw new GameError('연승 기록 업데이트에 실패했습니다.');
  }
};

export const addPlayHistory = async (result: 'win' | 'lose'): Promise<void> => {
  try {
    await request.post('/history', { result });
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new GameError('로그인이 필요합니다.');
    } else if (error.response?.status === 404) {
      throw new GameError('사용자를 찾을 수 없습니다.');
    }
    throw new GameError('게임 기록 추가에 실패했습니다.');
  }
};