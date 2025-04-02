import React, { useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";

type Props = {
  team: BattlePokemon[];
  activeIndex: number;
  isProcessing: boolean;
  onSwitch: (index: number) => void;
};

function SwapPanel({ team, activeIndex, isProcessing, onSwitch }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  const toggleView = (index: number) => {
    setViewingIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="swap-panel">
      <h3>교체하기</h3>
      {team.map((poke, i) => {
        const isCurrent = i === activeIndex;
        const isFainted = poke.currentHp <= 0;
        const isSelected = i === selectedIndex;
        const isViewing = i === viewingIndex;

        return (
          <div key={poke.base.name} className="swap-slot">
            <button
              disabled={isProcessing || isCurrent || isFainted}
              onClick={() => setSelectedIndex(i)}
            >
              {poke.base.name} {isCurrent ? "(현재)" : ""}
            </button>

            {isSelected && (
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => toggleView(i)}>
                  상태 보기
                </button>
                <button onClick={() => onSwitch(i)} style={{ marginLeft: "0.5rem" }}>
                  교체하기
                </button>

                {isViewing && (
                  <div className="status-card" style={{ marginTop: "0.5rem", padding: "0.5rem", border: "1px solid #ccc" }}>
                    <p>체력: {poke.currentHp} / {poke.base.hp}</p>
                    <p>상태: {poke.status.join(", ") || "없음"}</p>
                    <p>위치: {poke.position || "없음"}</p>
                    <div>
                      <strong>기술 PP</strong>
                      <ul>
                        {poke.base.moves.map((m) => (
                          <li key={m.name}>
                            {m.name}: {poke.pp[m.name]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SwapPanel;