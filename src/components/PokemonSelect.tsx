import React, { useState } from "react";
import { mockPokemon } from "../data/mockPokemon";
import { PokemonInfo } from "../models/Pokemon";

type Props = {
  onSelect: (playerPokemons: PokemonInfo[], watchMode?: boolean) => void;
};

function PokemonSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<PokemonInfo[]>([]);

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
      <button disabled={selected.length !== 3} onClick={() => onSelect(selected)}>
        배틀 시작
      </button>
      <button
        disabled={selected.length !== 3}
        onClick={() => {
          // 관전 모드일 경우 상태 전달
          onSelect(selected, true);
        }}
      >
        관전 모드 시작
      </button>
    </div>
  );
}

export default PokemonSelect;