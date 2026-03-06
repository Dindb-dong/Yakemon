import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import { getHpImagePath } from "./PokemonArea";

type Props = {
  team: BattlePokemon[];
  activeIndex: number;
  onSwitch: (index: number) => void;
  watchMode: boolean;
  focusedSwitchIndex?: number | null;
  selectedSwitchIndex?: number | null;
};

function SwapPanel({ team, activeIndex, focusedSwitchIndex = null, selectedSwitchIndex = null }: Props) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const loadThumbnails = async () => {
      const entries = await Promise.all(team.map(async (pokemon, index) => {
        const imageUrl = await getHpImagePath(pokemon.base.id, Math.max(pokemon.currentHp / Math.max(pokemon.base.hp, 1), 0), pokemon.formNum);
        return [`${pokemon.base.id}-${index}`, imageUrl] as const;
      }));
      if (!isMounted) {
        return;
      }
      setThumbnails(Object.fromEntries(entries));
    };
    loadThumbnails();
    return () => {
      isMounted = false;
    };
  }, [team]);

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
            <div className="swap-name-row">
              <img
                className="swap-thumb"
                src={thumbnails[`${pokemon.base.id}-${index}`]}
                alt={pokemon.base.name}
              />
              <span className="swap-name">{pokemon.base.name}</span>
            </div>
            <div className="swap-meta-row">
              <span className="swap-meta">
                {isCurrent ? "현재 출전" : isFainted ? "기절" : "교체 가능"}
              </span>
              <span className="swap-meta">
                HP {pokemon.currentHp} / {pokemon.base.hp}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SwapPanel;
