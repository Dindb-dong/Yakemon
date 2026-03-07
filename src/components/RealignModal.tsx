import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { getHpImagePath } from "./PokemonArea";
import PokemonDetailViewModal from "./PokemonDetailViewModal";

type RealignModalProps = {
  myTeam: BattlePokemon[];
  onConfirm: (newOrder: number[]) => void;
};

function RealignModal({ myTeam, onConfirm }: RealignModalProps) {
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [selectedPokemonIndex, setSelectedPokemonIndex] = useState<number | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadThumbnails = async () => {
      const result: Record<number, string> = {};
      for (const pokemon of myTeam) {
        const imagePath = await getHpImagePath(pokemon.base.id, 1);
        result[pokemon.base.id] = imagePath;
      }
      setThumbnails(result);
    };
    loadThumbnails();
  }, [myTeam]);

  const handleRegister = (index: number) => {
    if (selectedOrder.includes(index)) {
      return;
    }
    setSelectedOrder((prev) => [...prev, index]);
    setSelectedPokemonIndex(null);
  };

  const handleRemove = (index: number) => {
    setSelectedOrder((prev) => prev.filter((orderIndex) => orderIndex !== index));
    setSelectedPokemonIndex(null);
  };

  const getSelectedPosition = (index: number) => {
    const position = selectedOrder.indexOf(index);
    return position >= 0 ? position + 1 : null;
  };

  return (
    <div className="realign-overlay">
      <div className="realign-modal">
        <h2 className="realign-title">출전 순서 선택</h2>
        <p className="realign-subtitle">원하는 순서대로 3마리를 등록해 주세요.</p>

        <div className="realign-grid">
          {myTeam.map((pokemon, index) => {
            const selectedPosition = getSelectedPosition(index);
            const isSelected = selectedPosition !== null;

            return (
              <button
                key={`${pokemon.base.id}-${index}`}
                onClick={() => setSelectedPokemonIndex(index)}
                className={`realign-card ${isSelected ? "selected" : ""}`}
              >
                <img
                  src={thumbnails[pokemon.base.id]}
                  alt={pokemon.base.name}
                  className="realign-thumb"
                />
                <div className="realign-name">{pokemon.base.name}</div>
                <div className="realign-types">{pokemon.base.types.join(", ")}</div>
                {isSelected && <div className="realign-badge">{selectedPosition}번째</div>}
              </button>
            );
          })}
        </div>

        <div className="realign-actions">
          <button
            className="realign-confirm-button"
            onClick={() => onConfirm(selectedOrder)}
            disabled={selectedOrder.length !== myTeam.length}
          >
            출전 순서 확정
          </button>
        </div>

        {selectedPokemonIndex !== null && (
          <PokemonDetailViewModal
            pokemon={myTeam[selectedPokemonIndex]}
            side="my"
            avoidPad={false}
            showActionButtons
            onClose={() => setSelectedPokemonIndex(null)}
            onConfirm={() =>
              selectedPokemonIndex !== null && !selectedOrder.includes(selectedPokemonIndex)
                ? handleRegister(selectedPokemonIndex)
                : undefined
            }
            onCancel={() =>
              selectedOrder.includes(selectedPokemonIndex)
                ? handleRemove(selectedPokemonIndex)
                : undefined
            }
            isSelected={selectedOrder.includes(selectedPokemonIndex)}
          />
        )}
      </div>
    </div>
  );
}

export default RealignModal;
