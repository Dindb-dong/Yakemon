import axios from "axios";

export interface GameResult {
  playerId: string;
  winCount: number;
  loseCount: number;
  winStreak: number;
  bestWinStreak: number;
}

export interface PlayerRecord extends GameResult {
  username: string;
  pokemonEffort: PokemonEffortRow[];
}

export interface NicknameUpdateResult {
  ok: boolean;
  playerId: string;
  username: string;
}

export type EffortStatKey = "hp" | "attack" | "defense" | "spAttack" | "spDefense" | "speed";

export interface PokemonEffortRow {
  pokemonId: number;
  pokemonName: string;
  ev: Record<EffortStatKey, number>;
  totalEffort: number;
  unspentEffort: number;
  battles: number;
  statBonus: Record<EffortStatKey, number>;
}

export interface EffortSettleResult {
  ok: boolean;
  rewardPerBattle: number;
  pokemonEffort: PokemonEffortRow[];
}

export interface EffortInvestResult {
  ok: boolean;
  spent: number;
  updated: PokemonEffortRow;
  pokemonEffort: PokemonEffortRow[];
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
 * Persist a user-provided player id for record linking across sessions/devices.
 */
export function setGuestPlayerId(rawPlayerId: string): string {
  const normalized = rawPlayerId.trim();
  if (!normalized) {
    throw new GameError("ID를 입력해주세요.");
  }

  localStorage.setItem(GUEST_PLAYER_KEY, normalized);
  return normalized;
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

/**
 * Load one player's aggregate record by id.
 */
export async function loadPlayerRecord(playerId?: string): Promise<PlayerRecord> {
  const targetId = (playerId ?? getOrCreateGuestPlayerId()).trim();
  if (!targetId) {
    throw new GameError("ID를 입력해주세요.");
  }

  try {
    const response = await axios.get<PlayerRecord>("/api/player", {
      params: { playerId: targetId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new GameError("해당 ID의 기록을 찾을 수 없습니다.", 404);
    }
    if (error.response?.status === 400) {
      throw new GameError("ID 형식이 올바르지 않습니다.", 400);
    }
    throw new GameError("기록 조회에 실패했습니다.", error.response?.status);
  }
}

/**
 * Update player's nickname with server-side validation.
 */
export async function updatePlayerNickname(nickname: string, playerId?: string): Promise<NicknameUpdateResult> {
  const targetId = (playerId ?? getOrCreateGuestPlayerId()).trim();
  if (!targetId) {
    throw new GameError("ID를 찾을 수 없습니다.");
  }

  try {
    const response = await axios.post<NicknameUpdateResult>("/api/nickname", {
      playerId: targetId,
      nickname,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new GameError(error.response.data?.message || "닉네임 형식이 올바르지 않습니다.", 400);
    }
    throw new GameError("닉네임 저장에 실패했습니다.", error.response?.status);
  }
}

/**
 * Reward effort points to participated pokemons after one battle.
 */
export async function settleEffortAfterBattle(
  participatedPokemons: Array<{ pokemonId: number; pokemonName: string }>,
  playerId?: string
): Promise<EffortSettleResult> {
  const targetId = (playerId ?? getOrCreateGuestPlayerId()).trim();
  if (!targetId) {
    throw new GameError("ID를 찾을 수 없습니다.");
  }

  try {
    const response = await axios.post<EffortSettleResult>("/api/effort/settle", {
      playerId: targetId,
      participatedPokemons,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new GameError(error.response.data?.message || "노력치 정산 요청이 올바르지 않습니다.", 400);
    }
    throw new GameError("노력치 정산에 실패했습니다.", error.response?.status);
  }
}

/**
 * Invest player's unspent effort points into one pokemon stat.
 */
export async function investPokemonEffort(
  payload: { pokemonId: number; pokemonName: string; stat: EffortStatKey; amount: number },
  playerId?: string
): Promise<EffortInvestResult> {
  const targetId = (playerId ?? getOrCreateGuestPlayerId()).trim();
  if (!targetId) {
    throw new GameError("ID를 찾을 수 없습니다.");
  }

  try {
    const response = await axios.post<EffortInvestResult>("/api/effort/invest", {
      playerId: targetId,
      ...payload,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new GameError(error.response.data?.message || "노력치 투자 요청이 올바르지 않습니다.", 400);
    }
    throw new GameError("노력치 투자에 실패했습니다.", error.response?.status);
  }
}
