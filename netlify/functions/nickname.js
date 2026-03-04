const { getDb } = require("./_lib/mongo");
const { json, parseBody } = require("./_lib/http");
const { normalizePlayerId, normalizeNickname, ensurePlayer } = require("./_lib/player");

/**
 * Update player's nickname with validation.
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
  const nicknameCheck = normalizeNickname(body.nickname);

  if (!playerId) {
    return json(400, { message: "playerId is required" });
  }
  if (!nicknameCheck.ok) {
    return json(400, { message: nicknameCheck.message });
  }

  try {
    const db = await getDb();
    const players = db.collection("players");
    await ensurePlayer(players, playerId);

    await players.updateOne(
      { playerId },
      {
        $set: {
          displayName: nicknameCheck.value,
          updatedAt: new Date(),
        },
      }
    );

    return json(200, {
      ok: true,
      playerId,
      username: nicknameCheck.value,
    });
  } catch (error) {
    console.error("[nickname] failed", error);
    return json(500, { message: "Failed to update nickname" });
  }
};
