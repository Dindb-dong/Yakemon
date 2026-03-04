const { getDb } = require("./_lib/mongo");
const { json, parseBody } = require("./_lib/http");
const { normalizePlayerId } = require("./_lib/player");

/**
 * Append one battle history event.
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
  const mode = typeof body.mode === "string" ? body.mode.slice(0, 40) : "normal";

  if (!playerId) {
    return json(400, { message: "playerId is required" });
  }

  if (result !== "win" && result !== "lose") {
    return json(400, { message: "result must be win or lose" });
  }

  try {
    const db = await getDb();
    const history = db.collection("play_history");

    await history.insertOne({
      playerId,
      result,
      mode,
      createdAt: new Date(),
    });

    return json(201, { ok: true });
  } catch (error) {
    console.error("[history] failed", error);
    return json(500, { message: "Failed to save history" });
  }
};
