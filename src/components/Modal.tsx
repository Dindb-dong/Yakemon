import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { getHpImagePath } from "./PokemonArea";
import { useBattleStore } from "../Context/useBattleStore";

type Props = {
  myTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  onExchange: (myIndex: number, enemyIndex: number) => void;
  onSkip: () => void;
};

function PokemonDetailModal({
  pokemon,
  isSelected,
  onConfirm,
  onCancel,
  onClose,
}: {
  pokemon: BattlePokemon;
  isSelected: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: "2rem", borderRadius: 10, width: 400 }}>
        <h2>{pokemon.base.name}</h2>
        <p>타입: {pokemon.base.types.join(", ")}</p>
        <p>특성: {typeof pokemon.base.originalAbility === 'object' && pokemon.base.originalAbility !== null && 'name' in pokemon.base.originalAbility ? pokemon.base.originalAbility.name : pokemon.base.ability?.name ?? '없음'}</p>
        <p>체력: {pokemon.base.hp}</p>
        <p>공격력: {pokemon.base.attack}</p>
        <p>방어력: {pokemon.base.defense}</p>
        <p>특수공격력: {pokemon.base.spAttack}</p>
        <p>특수방어력: {pokemon.base.spDefense}</p>
        <p>스피드: {pokemon.base.speed}</p>
        <div>
          <h4>기술 목록</h4>
          <ul>
            {pokemon.base.moves.map((m) => (
              <li key={m.name}>{m.name} ({m.category},{m.type}, {m.power}, {m.accuracy}, {m.pp})</li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          {isSelected ? (
            <button onClick={onCancel} style={{ marginRight: "0.5rem" }}>취소하기</button>
          ) : (
            <button onClick={onConfirm} style={{ marginRight: "0.5rem" }}>이 포켓몬 선택</button>
          )}
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ myTeam, enemyTeam, onExchange, onSkip }: Props) {
  const { winCount } = useBattleStore.getState();
  const [selectedMy, setSelectedMy] = useState<number | null>(null);
  const [selectedEnemy, setSelectedEnemy] = useState<number | null>(null);
  const [viewing, setViewing] = useState<{ side: 'my' | 'enemy', index: number } | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadThumbnails = async () => {
      const all = [...myTeam, ...enemyTeam];
      const thumbMap: Record<string, string> = {};

      for (const p of all) {
        const url = await getHpImagePath(p.base.id, 1, p.formNum);
        thumbMap[`${p.base.name}-${p.base.id}`] = url;
      }

      setThumbnails(thumbMap);
    };

    loadThumbnails();
  }, [myTeam, enemyTeam]);

  const renderButton = (
    p: BattlePokemon,
    i: number,
    side: 'my' | 'enemy',
    selected: boolean,
    onClick: () => void
  ) => {
    return (
      <button
        key={`${side}-${i}`}
        onClick={onClick}
        style={{
          width: "100%",
          marginBottom: 10,
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 8,
          backgroundColor: selected ? "#007bff" : "#fff",
          color: selected ? "white" : "black",
          cursor: "pointer",
          textAlign: "left",
          transition: "background-color 0.2s",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <img
            src={thumbnails[`${p.base.name}-${p.base.id}`]}
            alt={p.base.name}
            style={{ width: 32, height: 32, marginRight: 8 }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{p.base.name}</div>
            <div style={{ fontSize: "0.75rem", color: selected ? "#e0e0e0" : "#666" }}>{p.base.types.join(", ")}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="modal" style={{ padding: "2rem", background: "#f9f9f9", borderRadius: 10, maxWidth: 800, margin: "2rem auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>🎉 승리! 상대 포켓몬과 교체할 수 있어요</h2>
      <div style={{ textAlign: "center", fontWeight: 'bold', fontSize: '1.5rem' }}>{winCount + 1} 연승중!</div>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h3>내 포켓몬</h3>
          {myTeam.map((p, i) =>
            renderButton(p, i, 'my', selectedMy === i, () => setViewing({ side: 'my', index: i }))
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h3>상대 포켓몬</h3>
          {enemyTeam.map((p, i) =>
            renderButton(p, i, 'enemy', selectedEnemy === i, () => setViewing({ side: 'enemy', index: i }))
          )}
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => {
            if (selectedMy !== null && selectedEnemy !== null) {
              onExchange(selectedMy, selectedEnemy);
            }
          }}
          disabled={selectedMy === null || selectedEnemy === null}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: selectedMy !== null && selectedEnemy !== null ? "#28a745" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: selectedMy !== null && selectedEnemy !== null ? "pointer" : "not-allowed"
          }}
        >
          선택한 포켓몬으로 교체
        </button>
        <button
          onClick={onSkip}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#888",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          그냥 넘어가기
        </button>
      </div>

      {viewing && (
        <PokemonDetailModal
          pokemon={viewing.side === 'my' ? myTeam[viewing.index] : enemyTeam[viewing.index]}
          isSelected={
            viewing.side === 'my'
              ? selectedMy === viewing.index
              : selectedEnemy === viewing.index
          }
          onConfirm={() => {
            if (viewing.side === 'my') setSelectedMy(viewing.index);
            else setSelectedEnemy(viewing.index);
            setViewing(null);
          }}
          onCancel={() => {
            if (viewing.side === 'my') setSelectedMy(null);
            else setSelectedEnemy(null);
            setViewing(null);
          }}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

export default Modal;