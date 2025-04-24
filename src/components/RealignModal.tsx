import React, { useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { PokemonDetailModal } from "./PokemonSelect";
import { getHpImagePath } from "./PokemonArea";

const RealignModal = ({
  myTeam,
  onConfirm,
}: {
  myTeam: BattlePokemon[];
  onConfirm: (newOrder: number[]) => void;
}) => {
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // 이미지 로딩 (최초 1회만)
  useState(() => {
    (async () => {
      const result: Record<number, string> = {};
      for (const p of myTeam) {
        const url = await getHpImagePath(p.base.id, 1); // 체력 100% 기준
        result[p.base.id] = url;
      }
      setThumbnails(result);
    })();
  });

  const handleSelect = (index: number) => {
    setSelectedPokemonIndex(index);
  };

  const handleRegister = (index: number) => {
    if (!selectedOrder.includes(index)) {
      setSelectedOrder((prev) => [...prev, index]);
    }
    setSelectedPokemonIndex(null);
  };

  const handleRemove = (index: number) => {
    setSelectedOrder((prev) => prev.filter((i) => i !== index));
    setSelectedPokemonIndex(null);
  };

  const getSelectedPosition = (index: number) => {
    const pos = selectedOrder.indexOf(index);
    return pos >= 0 ? pos + 1 : null;
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>🎯 포켓몬 출전 순서 선택</h2>
        <p>원하는 순서대로 3마리를 등록해 주세요.</p>

        <div style={styles.grid}>
          {myTeam.map((poke, i) => {
            const selectedPos = getSelectedPosition(i);
            const isSelected = selectedPos !== null;

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  ...styles.card,
                  backgroundColor: isSelected ? "#aed581" : "#f5f5f5",
                  border: isSelected ? "2px solid #558b2f" : "1px solid #ccc"
                }}
              >
                <img
                  src={thumbnails[poke.base.id]}
                  alt={poke.base.name}
                  style={styles.thumbnail}
                />
                <div>{poke.base.name}</div>
                <div>{poke.base.types.join(", ")}</div>
                {isSelected && (
                  <div style={styles.badge}>
                    {selectedPos}번째
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedOrder.length === myTeam.length && (
          <button style={styles.confirmButton} onClick={() => onConfirm(selectedOrder)}>
            출전 순서 확정
          </button>
        )}

        {selectedPokemonIndex !== null && (
          <PokemonDetailModal
            pokemon={myTeam[selectedPokemonIndex].base}
            onClose={() => setSelectedPokemonIndex(null)}
            onSelect={() =>
              selectedOrder.includes(selectedPokemonIndex)
                ? handleRemove(selectedPokemonIndex)
                : handleRegister(selectedPokemonIndex)
            }
            isAlreadySelected={selectedOrder.includes(selectedPokemonIndex)}
            realign={true}
          />
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0, left: 0, width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "600px",
    textAlign: "center" as const
  },
  grid: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap" as React.CSSProperties["flexWrap"],
    gap: "1rem",
    marginTop: "1rem",
    marginBottom: "1rem"
  },
  card: {
    padding: "0.8rem",
    borderRadius: "10px",
    width: "120px",
    height: "120px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    position: "relative" as const,
    cursor: "pointer",
  },
  thumbnail: {
    width: "48px",
    height: "48px",
    marginBottom: "0.5rem"
  },
  badge: {
    position: "absolute" as const,
    top: "-8px",
    right: "-8px",
    backgroundColor: "#558b2f",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem"
  },
  confirmButton: {
    marginTop: "1rem",
    padding: "0.6rem 1.2rem",
    backgroundColor: "#3f51b5",
    color: "#fff",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  }
};

export default RealignModal;