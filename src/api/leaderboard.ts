import axios from "axios";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  bestStreak: number;
  winRate: number;
}

interface LeaderboardResponseRow {
  rank: number;
  username: string;
  bestWinStreak: number;
  winCount: number;
  loseCount: number;
}

export class LeaderboardError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "LeaderboardError";
  }
}

/**
 * Fetch leaderboard rows from Netlify Functions and map them for UI.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await axios.get<LeaderboardResponseRow[]>("/api/leaderboard");
    return response.data.map((row) => ({
      rank: row.rank,
      username: row.username,
      bestStreak: row.bestWinStreak ?? 0,
      winRate: row.winCount + row.loseCount > 0
        ? Math.round((row.winCount / (row.winCount + row.loseCount)) * 100)
        : 0,
    }));
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new LeaderboardError("리더보드를 불러오는데 실패했습니다.", 400);
    }
    throw new LeaderboardError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", error.response?.status);
  }
}
