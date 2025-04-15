import React, { useEffect, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import SwapPanel from "./SwapPanel";
import { useBattleStore } from "../Context/useBattleStore";
import { calculateTypeEffectiveness } from "../utils/typeRalation";

type ActionPanelParams = {
  myPokemon: BattlePokemon,
  myTeam: BattlePokemon[],
  activeMy: number,
  isTurnProcessing: boolean,
  onAction: any;
  watchMode: boolean;
};

function ActionPanel({ myPokemon, myTeam, activeMy, isTurnProcessing, onAction, watchMode }: ActionPanelParams) {
  const isFainted = myPokemon.currentHp <= 0;

  // ✅ 현재 모드: 'fight' | 'switch' | null (초기값은 null)
  const [currentTab, setCurrentTab] = useState<"fight" | "switch" | null>(null);
  const [hintMode, setHintMode] = useState<boolean>(true);
  const { turn, enemyTeam, activeEnemy } = useBattleStore.getState();
  const enemyTypes = enemyTeam[activeEnemy].base.types;
  useEffect(() => {
    setCurrentTab(null);
  }, [turn])

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="action-panel">
      <button className="hint-toggle"
        onClick={() => setHintMode(!hintMode)}
      >타입 상성 힌트 모드 전환</button>
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
            {hintMode && (
              <>
                {myPokemon.base.moves.map((move) => {
                  const effectiveness = calculateTypeEffectiveness(move.type, enemyTypes);
                  let effectivenessClass = "";
                  if (effectiveness === 4 && move.category !== '변화') effectivenessClass = "very-effective";
                  else if (effectiveness === 2 && move.category !== '변화') effectivenessClass = "effective";
                  else if (effectiveness === 0.5 && move.category !== '변화') effectivenessClass = "not-effective";
                  else if (effectiveness === 0.25 && move.category !== '변화') effectivenessClass = "not-very-effective";
                  else if (effectiveness === 0 && move.category !== '변화') effectivenessClass = "no-effect";

                  return (
                    <button
                      key={move.name}
                      className={`move-button ${effectivenessClass}`}
                      onClick={() => onAction(move)}
                      disabled={isTurnProcessing || isFainted || watchMode}
                    >
                      <span className="move-name">{move.name}</span>
                      <span className="move-power">{move.category}</span>
                      <span className="move-pp">pp: {myPokemon.pp[move.name]} / {
                        myPokemon.base.moves.find((m) => m.name === move.name)?.pp ?? "?"}</span>
                      <span className="move-power">
                        위력: {move.getPower ? move.getPower(myTeam) : move.power}
                      </span>
                      <span className="move-accuracy">명중율: {move.accuracy}</span>
                      <span className={`move-type ${move.type}`}>{move.type}</span>
                    </button>
                  );
                })}</>
            )
            }
            {!hintMode && (
              <>
                {myPokemon.base.moves.map((move) => {

                  return (
                    <button
                      key={move.name}
                      className={`move-button`}
                      onClick={() => onAction(move)}
                      disabled={isTurnProcessing || isFainted || watchMode}
                    >
                      <span className="move-name">{move.name}</span>
                      <span className="move-pp">pp: {myPokemon.pp[move.name]} / {
                        myPokemon.base.moves.find((m) => m.name === move.name)?.pp ?? "?"}</span>
                      <span className="move-power">위력: {move.power}</span>
                      <span className="move-accuracy">명중율: {move.accuracy}</span>
                      <span className={`move-type ${move.type}`}>{move.type}</span>
                    </button>
                  );
                })}</>
            )
            }

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
            onSwitch={(index) => onAction({ type: "switch", index })}
            watchMode={watchMode}
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