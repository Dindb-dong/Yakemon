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
  const isFainted = myPokemon.currentHp <= 0;
  return (
    <div className="action-panel">
      <div className="move-grid">
        {myPokemon.base.moves.map((move) => (
          <button
            key={move.name}
            className="move-button"
            onClick={() => onAction(move)}
            disabled={isTurnProcessing || isFainted}
          >
            <span className="move-name">{move.name}</span>
            <span className="move-pp">pp: {myPokemon.pp[move.name]} / {
              myPokemon.base.moves.find((m) => m.name === move.name)?.pp ?? "?"}</span>
            <span className="move-power">위력: {move.power}</span>
            <span className="move-accuracy">명중율: {move.accuracy}</span>
            <span className={`move-type ${move.type}`}>{move.type}</span>
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