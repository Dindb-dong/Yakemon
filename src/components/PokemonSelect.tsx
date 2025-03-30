import React, { useState } from 'react';

function PokemonSelect({ pokemons, onSelect }) {
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>포켓몬 선택</h2>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h3>플레이어 1</h3>
          {pokemons.map((p: any) => (
            <button key={p.id} onClick={() => setP1(p)}>{p.name}</button>
          ))}
        </div>
        <div>
          <h3>플레이어 2</h3>
          {pokemons.map((p: any) => (
            <button key={p.id} onClick={() => setP2(p)}>{p.name}</button>
          ))}
        </div>
      </div>
      <br />
      <button disabled={!p1 || !p2} onClick={() => onSelect(p1, p2)}>배틀 시작</button>
    </div>
  );
}

export default PokemonSelect;