import { request } from '../utils/request';
import { User } from '../types/user';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  streak: number;
}

export class LeaderboardError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'LeaderboardError';
  }
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await request.get<User[]>('/leaderboard');
    return response.data.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      streak: user.winStreak,
    }));
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new LeaderboardError('리더보드를 불러오는데 실패했습니다.');
    }
    throw new LeaderboardError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}; 