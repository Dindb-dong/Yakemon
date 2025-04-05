import React, { useState } from "react";
import { mockPokemon } from "../data/mockPokemon";
import { PokemonInfo } from "../models/Pokemon";

type Props = {
  onSelect: (playerPokemons: PokemonInfo[], watchMode: boolean, watchCount?: number) => void;
};

function PokemonSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<PokemonInfo[]>([]);
  const [watchCount, setWatchCount] = useState(1); // 관전 반복 횟수

  const handleSelect = (pokemon: PokemonInfo) => {
    if (selected.includes(pokemon)) {
      setSelected(selected.filter((p) => p !== pokemon));
    } else if (selected.length < 3) {
      setSelected([...selected, pokemon]);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>내 포켓몬 3마리 선택</h2>
      {mockPokemon.map((p) => (
        <button
          key={p.id}
          onClick={() => handleSelect(p)}
          style={{
            backgroundColor: selected.includes(p) ? "#00bcd4" : "",
            margin: "0.5rem",
          }}
        >
          {p.name}
        </button>
      ))}
      <br />
      <button disabled={selected.length !== 3} onClick={() => onSelect(selected, false)}>
        배틀 시작
      </button>
      <div style={{ marginTop: "2rem" }}>
        <h3>관전 모드</h3>
        <input
          type="number"
          min={1}
          value={watchCount}
          onChange={(e) => setWatchCount(parseInt(e.target.value))}
        />
        <button onClick={() => onSelect([], true, watchCount)}>
          관전 모드 시작
        </button>
      </div>
    </div>
  );
}

export default PokemonSelect;