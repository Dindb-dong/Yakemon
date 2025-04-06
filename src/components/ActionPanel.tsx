import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import SwapPanel from "./SwapPanel";
import { useBattleStore } from "../Context/useBattleStore";

type ActionPanelParams = {
  myPokemon: BattlePokemon,
  myTeam: BattlePokemon[],
  activeMy: number,
  isTurnProcessing: boolean,
  onAction: any;
};

function ActionPanel({ myPokemon, myTeam, activeMy, isTurnProcessing, onAction }: ActionPanelParams) {
  const isFainted = myPokemon.currentHp <= 0;

  // ✅ 현재 모드: 'fight' | 'switch' | null (초기값은 null)
  const [currentTab, setCurrentTab] = useState<"fight" | "switch" | null>(null);
  const { turn } = useBattleStore.getState();
  useEffect(() => {
    setCurrentTab(null);
  }, [turn])

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="action-panel">
      {/* 모바일 전용: 처음엔 싸운다/교체 버튼만 보여줌 */}
      {isMobile && currentTab === null && (
        <div className="action-toggle">
          <button
            className="action-toggle-btn"
            onClick={() => setCurrentTab("fight")}
            disabled={isFainted || isTurnProcessing}
          >싸운다</button>
          <button
            className="action-toggle-btn"
            onClick={() => setCurrentTab("switch")}
            disabled={isTurnProcessing}
          >교체</button>
        </div>
      )}

      {/* 싸운다 모드 */}
      {(!isMobile || currentTab === "fight") && (
        <>
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
          {/* 모바일일 경우: 하단에 '교체' 버튼 보여줌 */}
          {isMobile && (
            <button
              className="action-toggle-btn"
              onClick={() => setCurrentTab("switch")}
              disabled={isTurnProcessing}
            >교체</button>
          )}
        </>
      )}

      {/* 교체 모드 */}
      {(!isMobile || currentTab === "switch") && (
        <>
          <SwapPanel
            team={myTeam}
            activeIndex={activeMy}
            isProcessing={isTurnProcessing}
            onSwitch={(index) => onAction({ type: "switch", index })}
          />
          {/* 모바일일 경우: 하단에 '싸운다' 버튼 보여줌 */}
          {isMobile && (
            <button
              className="action-toggle-btn"
              onClick={() => setCurrentTab("fight")}
              disabled={isTurnProcessing}
            >싸운다</button>
          )}
        </>
      )}
    </div>
  );
}

export default ActionPanel;