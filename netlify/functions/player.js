const { getDb } = require("./_lib/mongo");
const { json } = require("./_lib/http");
const { normalizePlayerId } = require("./_lib/player");
const { toEffortRow } = require("./_lib/effort");

/**
 * Return one player's stats by playerId.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { message: "Method not allowed" });
  }

  const playerId = normalizePlayerId(event.queryStringParameters?.playerId || "");
  if (!playerId) {
    return json(400, { message: "playerId is required" });
  }

  try {
    const db = await getDb();
    const players = db.collection("players");
    const player = await players.findOne({ playerId });

    if (!player) {
      return json(404, { message: "Player not found" });
    }

    const effortRows = Object.values(player.pokemonEffort || {})
      .map((row) => toEffortRow(row))
      .filter((row) => row.pokemonId > 0)
      .sort((a, b) => {
        if (b.battles !== a.battles) {
          return b.battles - a.battles;
        }
        return b.totalEffort - a.totalEffort;
      });

    return json(200, {
      playerId: player.playerId,
      username: player.displayName || `Trainer-${String(player.playerId || "").slice(-6).toUpperCase()}`,
      winCount: player.winCount || 0,
      loseCount: player.loseCount || 0,
      winStreak: player.winStreak || 0,
      bestWinStreak: player.bestWinStreak || 0,
      pokemonEffort: effortRows,
    });
  } catch (error) {
    console.error("[player] failed", error);
    return json(500, { message: "Failed to load player" });
  }
};
