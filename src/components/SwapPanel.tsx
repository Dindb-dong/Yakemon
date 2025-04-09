import React, { useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { useBattleStore } from "../Context/useBattleStore";

type Props = {
  team: BattlePokemon[];
  activeIndex: number;
  onSwitch: (index: number) => void;
  watchMode: boolean;
};

function SwapPanel({ team, activeIndex, onSwitch, watchMode }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const { isSwitchWaiting } = useBattleStore.getState()
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
              onClick={() => setSelectedIndex(i)} disabled={isFainted || watchMode}
            >
              {poke.base.name} {isCurrent ? "(현재)" : ""}
            </button>

            {isSelected && (
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => toggleView(i)}>
                  {isViewing ? "닫기" : "상세보기"}
                </button>
                <button disabled={isCurrent} onClick={() => onSwitch(i)} style={{ marginLeft: "0.5rem" }}>
                  교체하기
                </button>

                {isViewing && (
                  <div className="status-card" style={{ marginTop: "0.5rem", padding: "0.5rem", border: "1px solid #ccc" }}>
                    <p>타입: {poke.base.types.join(", ")}</p>
                    <p>체력: {poke.currentHp} / {poke.base.hp}</p>
                    <p>공격력: {poke.base.attack}</p>
                    <p>방어력: {poke.base.defense}</p>
                    <p>특수공격력: {poke.base.spAttack}</p>
                    <p>특수방어력: {poke.base.spDefense}</p>
                    <p>스피드: {poke.base.speed}</p>
                    <p>체력: {poke.currentHp} / {poke.base.hp}</p>
                    <p>상태이상: {poke.status.join(", ") || "없음"}</p>
                    <p>위치: {poke.position || "없음"}</p>
                    <div>
                      <strong>기술 정보</strong>
                      <ul>
                        {poke.base.moves.map((m) => (
                          <li key={m.name}>
                            {m.name}: {poke.pp[m.name]}, ({m.power}, {m.accuracy}), {m.type}
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