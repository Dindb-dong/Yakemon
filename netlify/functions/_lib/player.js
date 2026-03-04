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
  ensurePlayer,
};
