const { getDb } = require("./_lib/mongo");
const { json, parseBody } = require("./_lib/http");
const { normalizePlayerId, ensurePlayer } = require("./_lib/player");

/**
 * Update win streak-centric result and return current stats.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }

  const body = parseBody(event.body);
  if (!body) {
    return json(400, { message: "Invalid JSON body" });
  }

  const playerId = normalizePlayerId(body.playerId);
  const result = body.result;

  if (!playerId) {
    return json(400, { message: "playerId is required" });
  }

  if (result !== "win" && result !== "lose") {
    return json(400, { message: "result must be win or lose" });
  }

  try {
    const db = await getDb();
    const players = db.collection("players");
    const current = await ensurePlayer(players, playerId);
    const now = new Date();

    const nextWinCount = (current.winCount || 0) + (result === "win" ? 1 : 0);
    const nextLoseCount = (current.loseCount || 0) + (result === "lose" ? 1 : 0);
    const nextWinStreak = result === "win" ? (current.winStreak || 0) + 1 : 0;
    const nextBestWinStreak = Math.max(current.bestWinStreak || 0, nextWinStreak);

    await players.updateOne(
      { playerId },
      {
        $set: {
          winCount: nextWinCount,
          loseCount: nextLoseCount,
          winStreak: nextWinStreak,
          bestWinStreak: nextBestWinStreak,
          lastResult: result,
          updatedAt: now,
        },
      }
    );

    return json(200, {
      playerId,
      winCount: nextWinCount,
      loseCount: nextLoseCount,
      winStreak: nextWinStreak,
      bestWinStreak: nextBestWinStreak,
    });
  } catch (error) {
    console.error("[streak] failed", error);
    return json(500, { message: "Failed to update streak" });
  }
};
