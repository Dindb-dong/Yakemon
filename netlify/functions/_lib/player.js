/**
 * Sanitize and normalize player id from client payload.
 */
function normalizePlayerId(playerId) {
  if (!playerId || typeof playerId !== "string") {
    return "";
  }
  return playerId.trim().slice(0, 120);
}

/**
 * Build a fallback display name from the player id.
 */
function buildDefaultName(playerId) {
  const suffix = playerId.slice(-6).toUpperCase();
  return `Trainer-${suffix}`;
}

const PROFANITY_TOKENS = [
  "fuck", "shit", "bitch", "asshole", "dick", "pussy", "sex", "porn", "boob", "cum",
  "섹스", "야동", "보지", "자지", "딸딸", "걸레", "창녀", "좆", "씨발", "병신", "개새", "존나", "미친놈", "미친년",
];

/**
 * Validate nickname format and prohibited words.
 */
function normalizeNickname(rawNickname) {
  if (typeof rawNickname !== "string") {
    return { ok: false, value: "", message: "닉네임을 입력해주세요." };
  }

  const value = rawNickname.trim();
  const length = Array.from(value).length;
  if (length < 2 || length > 6) {
    return { ok: false, value, message: "닉네임은 2~6자로 입력해주세요." };
  }

  const pattern = /^[\p{L}\p{N}\p{P}\p{S}]+$/u;
  if (!pattern.test(value)) {
    return { ok: false, value, message: "닉네임에는 한글/영문/숫자/특수문자만 사용할 수 있습니다." };
  }

  const lowered = value.toLowerCase();
  if (PROFANITY_TOKENS.some((token) => lowered.includes(token))) {
    return { ok: false, value, message: "사용할 수 없는 단어가 포함되어 있습니다." };
  }

  return { ok: true, value, message: "" };
}

/**
 * Ensure a player document exists and return the upserted player.
 */
async function ensurePlayer(playersCollection, playerId) {
  const now = new Date();
  await playersCollection.updateOne(
    { playerId },
    {
      $setOnInsert: {
        playerId,
        displayName: buildDefaultName(playerId),
        winCount: 0,
        loseCount: 0,
        winStreak: 0,
        bestWinStreak: 0,
        pokemonEffort: {},
        createdAt: now,
      },
      $set: {
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  return playersCollection.findOne({ playerId });
}

module.exports = {
  normalizePlayerId,
  normalizeNickname,
  ensurePlayer,
};
