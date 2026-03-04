const { getDb } = require("./_lib/mongo");
const { json, parseBody } = require("./_lib/http");
const { ensurePlayer, normalizePlayerId } = require("./_lib/player");
const { investEffort, toEffortRow } = require("./_lib/effort");

/**
 * Invest unspent effort points into one pokemon stat.
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
  if (!playerId) {
    return json(400, { message: "playerId is required" });
  }

  try {
    const db = await getDb();
    const players = db.collection("players");
    const player = await ensurePlayer(players, playerId);

    const invested = investEffort(
      player.pokemonEffort || {},
      body.pokemonId,
      body.pokemonName,
      body.stat,
      body.amount
    );

    if (!invested.ok) {
      return json(400, { message: invested.message });
    }

    await players.updateOne(
      { playerId },
      {
        $set: {
          pokemonEffort: invested.pokemonEffort,
          updatedAt: new Date(),
        },
      }
    );

    const effortRows = Object.values(invested.pokemonEffort)
      .map((row) => toEffortRow(row))
      .filter((row) => row.pokemonId > 0)
      .sort((a, b) => {
        if (b.battles !== a.battles) {
          return b.battles - a.battles;
        }
        return b.totalEffort - a.totalEffort;
      });

    return json(200, {
      ok: true,
      spent: invested.spent,
      updated: invested.updated,
      pokemonEffort: effortRows,
    });
  } catch (error) {
    console.error("[effort-invest] failed", error);
    return json(500, { message: "Failed to invest effort" });
  }
};
