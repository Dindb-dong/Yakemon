export function stateToTextEnglish(state: number[]): string {
  const allTypes = [
    "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground",
    "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
  ];
  const statusList = ['Poison', 'Paralysis', 'Burn', 'Sleep', 'Freeze', 'Confusion', 'None'];
  const ranks = ['Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed', 'Accuracy', 'Evasion'];
  const terrains = ['Grassy Terrain', 'Psychic Terrain', 'Misty Terrain', 'Electric Terrain'];

  let idx = 0;

  // Player
  const myHp = Math.round(state[idx++] * 100);
  const myTypes = allTypes.filter((_, i) => state[idx++] === 1);
  const myStats = {
    Attack: Math.round(state[idx++] * 255),
    Defense: Math.round(state[idx++] * 255),
    SpAtk: Math.round(state[idx++] * 255),
    SpDef: Math.round(state[idx++] * 255),
    Speed: Math.round(state[idx++] * 255)
  };
  const myStatus = statusList.filter((_, i) => state[idx++] === 1);
  const myRanks = ranks.map((r) => `${r}: ${Math.round(state[idx++] * 12 - 6)}`);
  const myMovePPs = Array.from({ length: 4 }, () => `${Math.round(state[idx++] * 100)}%`);

  // Opponent
  const oppHp = Math.round(state[idx++] * 100);
  const oppTypes = allTypes.filter((_, i) => state[idx++] === 1);
  const oppStats = {
    Attack: Math.round(state[idx++] * 255),
    Defense: Math.round(state[idx++] * 255),
    SpAtk: Math.round(state[idx++] * 255),
    SpDef: Math.round(state[idx++] * 255),
    Speed: Math.round(state[idx++] * 255)
  };
  const oppStatus = statusList.filter((_, i) => state[idx++] === 1);
  const oppRanks = ranks.map((r) => `${r}: ${Math.round(state[idx++] * 12 - 6)}`);

  // Teams
  const myTeam = Array.from({ length: 3 }, () => {
    const hp = Math.round(state[idx++] * 100);
    const hasStatus = state[idx++] === 1 ? '⚠️' : '';
    return `${hp}%${hasStatus}`;
  });
  const oppTeam = Array.from({ length: 3 }, () => {
    const hp = Math.round(state[idx++] * 100);
    const hasStatus = state[idx++] === 1 ? '⚠️' : '';
    return `${hp}%${hasStatus}`;
  });

  // Turn
  const turn = Math.round(state[idx++] * 30);

  // Terrain
  const activeTerrain = terrains.find((_, i) => state[idx + i] === 1);
  idx += 4;
  const terrainTurns = Math.round(state[idx++] * 5);

  return `
🧑‍🎮 Your Pokémon
- HP: ${myHp}%
- Type: ${myTypes.join('/')}
- Status: ${myStatus.length > 0 ? myStatus.join(', ') : 'None'}
- Base Stats: ${Object.entries(myStats).map(([k, v]) => `${k} ${v}`).join(', ')}
- Stat Stages: ${myRanks.join(', ')}
- Move PPs: ${myMovePPs.join(', ')}

👾 Opponent Pokémon
- HP: ${oppHp}%
- Type: ${oppTypes.join('/')}
- Status: ${oppStatus.length > 0 ? oppStatus.join(', ') : 'None'}
- Base Stats: ${Object.entries(oppStats).map(([k, v]) => `${k} ${v}`).join(', ')}
- Stat Stages: ${oppRanks.join(', ')}

🧵 Team Overview
- Your Team: ${myTeam.join(' | ')}
- Opponent Team: ${oppTeam.join(' | ')}

🌍 Field Info
- Turn: ${turn}
- Terrain: ${activeTerrain ?? 'None'} (${terrainTurns} turns left)
`.trim();
}