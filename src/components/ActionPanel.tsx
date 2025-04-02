import React, { useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import SwapPanel from "./SwapPanel";

type ActionPanelParams = {
  myPokemon: BattlePokemon,
  myTeam: BattlePokemon[],
  activeMy: number,
  isTurnProcessing: boolean,
  onAction: any;
}

function ActionPanel({ myPokemon, myTeam, activeMy, isTurnProcessing, onAction }: ActionPanelParams) {
  return (
    <div className="action-panel">
      <div className="move-grid">
        {myPokemon.base.moves.map((move) => (
          <button
            key={move.name}
            className="move-button"
            onClick={() => onAction(move)}
            disabled={isTurnProcessing}
          >
            <span className="move-name">{move.name}</span>
            <span className="move-pp">PP: {myPokemon.pp[move.name]}</span>
          </button>
        ))}
      </div>

      <SwapPanel
        team={myTeam}
        activeIndex={activeMy}
        isProcessing={isTurnProcessing}
        onSwitch={(index) => onAction({ type: "switch", index })}
      />
    </div>
  );
}

export default ActionPanel;