import React, { useState } from "react";
import { mockPokemon } from "../data/mockPokemon";
import { PokemonInfo } from "../models/Pokemon";

type Props = {
  onSelect: (playerPokemons: PokemonInfo[], watchMode: boolean, watchCount?: number, watchDelay?: number) => void;
};

function PokemonSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<PokemonInfo[]>([]);
  const [watchCount, setWatchCount] = useState(1); // 관전 반복 횟수
  const [watchDelay, setWatchDelay] = useState(1.5);

  const handleSelect = (pokemon: PokemonInfo) => {
    if (selected.includes(pokemon)) {
      setSelected(selected.filter((p) => p !== pokemon));
    } else if (selected.length < 3) {
      setSelected([...selected, pokemon]);
    }
  };

  // 도감번호 기준으로 정렬
  const sortedPokemon = [...mockPokemon].sort((a, b) => a.id - b.id);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>내 포켓몬 3마리 선택</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {sortedPokemon.map((p) => {
          const selectedIndex = selected.indexOf(p);
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                backgroundColor: selected.includes(p) ? "#00bcd4" : "#eee",
                margin: "0.5rem",
                padding: "0.5rem 1rem",
                position: "relative",
                border: "1px solid #ccc",
                borderRadius: "6px",
                minWidth: "80px",
              }}
            >
              {p.name}
              {selectedIndex >= 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-16px",
                    fontSize: "0.75rem",
                    color: "#fff",
                    backgroundColor: "#333",
                    padding: "2px 6px",
                    borderRadius: "12px",
                  }}
                >
                  {selectedIndex + 1}번째
                </div>
              )}
            </button>
          );
        })}
      </div>
      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // 세로축 중앙 정렬
        }}
      >
        <button
          disabled={selected.length !== 3}
          onClick={() => onSelect(selected, false)}
          style={{
            marginTop: "1rem",
            padding: "1rem 2rem",
            backgroundColor: selected.length !== 3 ? "#FF0000FF" : "#2E6DFFFF",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "1rem",
            border: "none",
            cursor: selected.length === 3 ? "pointer" : "not-allowed"
          }}
        >
          배틀 시작
        </button>
      </div>

      <div>
        <h3>관전 모드</h3>
        <div style={{ marginTop: "2rem", flexDirection: "row", flex: 1, display: "flex" }}>
          <div style={{ flex: 0.3 }}>
            <h5>관전 횟수</h5>
            <input
              type="number"
              min={1}
              value={watchCount}
              onChange={(e) => setWatchCount(parseInt(e.target.value))}
              style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
            />
          </div>
          <div style={{ flex: 0.3 }}>
            <h5>관전 딜레이 타임</h5>
            <input
              type="number"
              min={1}
              value={watchDelay}
              onChange={(t) => setWatchDelay(parseFloat(t.target.value))}
              style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
            />
          </div>

          <button
            onClick={() => onSelect(selected.length === 3 ? selected : [], true, watchCount, watchDelay)}
            style={{ padding: "0.5rem 1rem", flex: 0.4 }}
          >
            관전 시작
          </button>
        </div>
      </div>

    </div>
  );
}

export default PokemonSelect;