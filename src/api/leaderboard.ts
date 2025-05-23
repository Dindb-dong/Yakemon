import { request } from '../utils/request';
import { User } from '../types/user';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  streak: number;
  wins: number;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await request.get<User[]>('/api/leaderboard');
  return response.data.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    streak: user.winStreak,
    wins: user.winCount,
  }));
}; 