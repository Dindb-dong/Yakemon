import React from "react";
import { BattlePokemon } from "../models/BattlePokemon";

type Props = {
  team: BattlePokemon[];
  activeIndex: number;
  onSwitch: (index: number) => void;
  watchMode: boolean;
  focusedSwitchIndex?: number | null;
  selectedSwitchIndex?: number | null;
};

function SwapPanel({ team, activeIndex, focusedSwitchIndex = null, selectedSwitchIndex = null }: Props) {
  return (
    <div className="swap-panel">
      <h3>교체하기</h3>
      {team.map((pokemon, index) => {
        const isCurrent = index === activeIndex;
        const isFainted = pokemon.currentHp <= 0;
        const isFocused = focusedSwitchIndex === index;
        const isSelected = selectedSwitchIndex === index;

        return (
          <div
            key={pokemon.base.name}
            className={`swap-slot-static ${isFocused ? "pad-focused" : ""} ${isSelected ? "is-selected" : ""} ${isCurrent ? "is-current" : ""} ${isFainted ? "is-fainted" : ""}`}
          >
            <span className="swap-name">{pokemon.base.name}</span>
            <span className="swap-meta">
              {isCurrent ? "현재 출전" : isFainted ? "기절" : "교체 가능"}
            </span>
            <span className="swap-meta">
              HP {pokemon.currentHp} / {pokemon.base.hp}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default SwapPanel;
