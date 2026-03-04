const { getDb } = require("./_lib/mongo");
const { json, parseBody } = require("./_lib/http");
const { ensurePlayer, normalizePlayerId } = require("./_lib/player");
const { DEFAULT_REWARD_PER_BATTLE, settleBattleEffort, toEffortRow } = require("./_lib/effort");

/**
 * Reward effort points to my pokemons that participated in one battle.
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
  const participatedPokemons = Array.isArray(body.participatedPokemons) ? body.participatedPokemons : [];

  if (!playerId) {
    return json(400, { message: "playerId is required" });
  }

  if (participatedPokemons.length === 0) {
    return json(400, { message: "participatedPokemons is required" });
  }

  try {
    const db = await getDb();
    const players = db.collection("players");
    const player = await ensurePlayer(players, playerId);

    const nextPokemonEffort = settleBattleEffort(
      player.pokemonEffort || {},
      participatedPokemons,
      DEFAULT_REWARD_PER_BATTLE
    );

    await players.updateOne(
      { playerId },
      {
        $set: {
          pokemonEffort: nextPokemonEffort,
          updatedAt: new Date(),
        },
      }
    );

    const effortRows = Object.values(nextPokemonEffort)
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
      rewardPerBattle: DEFAULT_REWARD_PER_BATTLE,
      pokemonEffort: effortRows,
    });
  } catch (error) {
    console.error("[effort-settle] failed", error);
    return json(500, { message: "Failed to settle effort" });
  }
};
