const { getDb } = require("./_lib/mongo");
const { json } = require("./_lib/http");

/**
 * Return top player rankings by best win streak.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { message: "Method not allowed" });
  }

  try {
    const db = await getDb();
    const players = db.collection("players");
    const docs = await players
      .find({})
      .sort({ bestWinStreak: -1, winStreak: -1, updatedAt: 1 })
      .limit(50)
      .toArray();

    const payload = docs.map((doc, index) => ({
      rank: index + 1,
      playerId: doc.playerId,
      username: doc.displayName || `Trainer-${String(doc.playerId || "").slice(-6).toUpperCase()}`,
      winStreak: doc.winStreak || 0,
      bestWinStreak: doc.bestWinStreak || 0,
      winCount: doc.winCount || 0,
      loseCount: doc.loseCount || 0,
    }));

    return json(200, payload);
  } catch (error) {
    console.error("[leaderboard] failed", error);
    return json(500, { message: "Failed to load leaderboard" });
  }
};
