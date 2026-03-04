import axios from "axios";

export interface GameResult {
  playerId: string;
  winCount: number;
  loseCount: number;
  winStreak: number;
  bestWinStreak: number;
}

export class GameError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GameError";
  }
}

const GUEST_PLAYER_KEY = "guestPlayerId";

/**
 * Return existing guest player id or create a new stable id for this browser.
 */
export function getOrCreateGuestPlayerId(): string {
  const existing = localStorage.getItem(GUEST_PLAYER_KEY);
  if (existing) {
    return existing;
  }

  const generated = `guest_${crypto.randomUUID()}`;
  localStorage.setItem(GUEST_PLAYER_KEY, generated);
  return generated;
}

/**
 * Send a result update to Netlify Functions and return updated aggregate values.
 */
async function postGameResult(path: string, result: "win" | "lose"): Promise<GameResult> {
  const playerId = getOrCreateGuestPlayerId();

  try {
    const response = await axios.post<GameResult>(`/api${path}`, {
      playerId,
      result,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new GameError("요청 값이 올바르지 않습니다.", 400);
    }
    throw new GameError("전적 저장에 실패했습니다.", error.response?.status);
  }
}

/**
 * Update win/lose counts in the database.
 */
export async function updateWinCount(result: "win" | "lose"): Promise<GameResult> {
  return postGameResult("/count", result);
}

/**
 * Update current win streak data in the database.
 */
export async function updateWinStreak(result: "win" | "lose"): Promise<GameResult> {
  return postGameResult("/streak", result);
}

/**
 * Append one play history record.
 */
export async function addPlayHistory(result: "win" | "lose", mode: "normal" | "random" = "normal"): Promise<void> {
  const playerId = getOrCreateGuestPlayerId();

  try {
    await axios.post("/api/history", {
      playerId,
      result,
      mode,
    });
  } catch (error: any) {
    throw new GameError("게임 히스토리 저장에 실패했습니다.", error.response?.status);
  }
}
