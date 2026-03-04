const EFFORT_STAT_KEYS = ["hp", "attack", "defense", "spAttack", "spDefense", "speed"];
const MAX_TOTAL_EFFORT = 510;
const MAX_STAT_EFFORT = 252;
const DEFAULT_REWARD_PER_BATTLE = 8;

/**
 * Return empty EV object.
 */
function createEmptyEffort() {
  return {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  };
}

/**
 * Normalize stat key from request.
 */
function normalizeEffortStat(rawStat) {
  if (typeof rawStat !== "string") {
    return "";
  }
  return EFFORT_STAT_KEYS.includes(rawStat) ? rawStat : "";
}

/**
 * Safely parse non-negative integer.
 */
function parsePositiveInt(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.floor(parsed));
}

/**
 * Return sum of EV values.
 */
function getTotalEffort(ev) {
  return EFFORT_STAT_KEYS.reduce((sum, key) => sum + parsePositiveInt(ev?.[key]), 0);
}

/**
 * Calculate applied stat bonus from EV (4 EV = +1).
 */
function getEffortStatBonus(ev) {
  return {
    hp: Math.floor(parsePositiveInt(ev?.hp) / 4),
    attack: Math.floor(parsePositiveInt(ev?.attack) / 4),
    defense: Math.floor(parsePositiveInt(ev?.defense) / 4),
    spAttack: Math.floor(parsePositiveInt(ev?.spAttack) / 4),
    spDefense: Math.floor(parsePositiveInt(ev?.spDefense) / 4),
    speed: Math.floor(parsePositiveInt(ev?.speed) / 4),
  };
}

/**
 * Build one pokemon effort row for API response.
 */
function toEffortRow(rawProgress) {
  const ev = {
    ...createEmptyEffort(),
    ...(rawProgress?.ev || {}),
  };
  const totalEffort = getTotalEffort(ev);
  return {
    pokemonId: parsePositiveInt(rawProgress?.pokemonId),
    pokemonName: typeof rawProgress?.pokemonName === "string" ? rawProgress.pokemonName : "Unknown",
    ev,
    totalEffort,
    unspentEffort: parsePositiveInt(rawProgress?.unspentEffort),
    battles: parsePositiveInt(rawProgress?.battles),
    statBonus: getEffortStatBonus(ev),
  };
}

/**
 * Reward effort points for participated pokemons.
 */
function settleBattleEffort(currentPokemonEffort, participatedPokemons, rewardPerBattle = DEFAULT_REWARD_PER_BATTLE) {
  const next = { ...(currentPokemonEffort || {}) };
  const reward = parsePositiveInt(rewardPerBattle, DEFAULT_REWARD_PER_BATTLE);

  participatedPokemons.forEach((pokemon) => {
    const pokemonId = parsePositiveInt(pokemon?.pokemonId);
    if (!pokemonId) {
      return;
    }
    const key = String(pokemonId);
    const existing = next[key] || {
      pokemonId,
      pokemonName: typeof pokemon?.pokemonName === "string" ? pokemon.pokemonName : `Pokemon-${pokemonId}`,
      ev: createEmptyEffort(),
      unspentEffort: 0,
      battles: 0,
    };

    next[key] = {
      ...existing,
      pokemonId,
      pokemonName:
        typeof pokemon?.pokemonName === "string" && pokemon.pokemonName.trim().length > 0
          ? pokemon.pokemonName.trim()
          : existing.pokemonName,
      ev: {
        ...createEmptyEffort(),
        ...(existing.ev || {}),
      },
      unspentEffort: parsePositiveInt(existing.unspentEffort) + reward,
      battles: parsePositiveInt(existing.battles) + 1,
    };
  });

  return next;
}

/**
 * Invest effort points into one stat.
 */
function investEffort(currentPokemonEffort, pokemonId, pokemonName, stat, amount) {
  const normalizedStat = normalizeEffortStat(stat);
  if (!normalizedStat) {
    return { ok: false, message: "투자 능력치를 확인해주세요." };
  }

  const normalizedPokemonId = parsePositiveInt(pokemonId);
  if (!normalizedPokemonId) {
    return { ok: false, message: "pokemonId가 필요합니다." };
  }

  const requestedAmount = parsePositiveInt(amount);
  if (requestedAmount <= 0) {
    return { ok: false, message: "투자 포인트는 1 이상이어야 합니다." };
  }

  const key = String(normalizedPokemonId);
  const next = { ...(currentPokemonEffort || {}) };
  const existing = next[key] || {
    pokemonId: normalizedPokemonId,
    pokemonName: typeof pokemonName === "string" && pokemonName.trim() ? pokemonName.trim() : `Pokemon-${normalizedPokemonId}`,
    ev: createEmptyEffort(),
    unspentEffort: 0,
    battles: 0,
  };

  const ev = {
    ...createEmptyEffort(),
    ...(existing.ev || {}),
  };

  const unspent = parsePositiveInt(existing.unspentEffort);
  const totalEffort = getTotalEffort(ev);
  const currentStatEffort = parsePositiveInt(ev[normalizedStat]);

  const totalRemain = Math.max(0, MAX_TOTAL_EFFORT - totalEffort);
  const statRemain = Math.max(0, MAX_STAT_EFFORT - currentStatEffort);
  const investable = Math.min(requestedAmount, unspent, totalRemain, statRemain);

  if (investable <= 0) {
    return { ok: false, message: "투자 가능한 노력치가 없습니다." };
  }

  ev[normalizedStat] = currentStatEffort + investable;
  next[key] = {
    ...existing,
    pokemonId: normalizedPokemonId,
    pokemonName:
      typeof pokemonName === "string" && pokemonName.trim().length > 0
        ? pokemonName.trim()
        : existing.pokemonName,
    ev,
    unspentEffort: unspent - investable,
    battles: parsePositiveInt(existing.battles),
  };

  return {
    ok: true,
    message: "노력치가 반영되었습니다.",
    spent: investable,
    pokemonEffort: next,
    updated: toEffortRow(next[key]),
  };
}

module.exports = {
  EFFORT_STAT_KEYS,
  MAX_TOTAL_EFFORT,
  MAX_STAT_EFFORT,
  DEFAULT_REWARD_PER_BATTLE,
  createEmptyEffort,
  normalizeEffortStat,
  getTotalEffort,
  getEffortStatBonus,
  toEffortRow,
  settleBattleEffort,
  investEffort,
};
