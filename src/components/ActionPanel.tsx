import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BattlePokemon } from "../models/BattlePokemon";
import SwapPanel from "./SwapPanel";
import { useBattleStore } from "../Context/useBattleStore";
import { calculateTypeEffectiveness } from "../utils/typeRalation";
import { BattlePadAction } from "./BattlePad";

type ActionPanelParams = {
  myPokemon: BattlePokemon;
  myTeam: BattlePokemon[];
  activeMy: number;
  isTurnProcessing: boolean;
  onAction: any;
  watchMode: boolean;
  padCommand: { id: number; action: BattlePadAction } | null;
};

function ActionPanel({
  myPokemon,
  myTeam,
  activeMy,
  isTurnProcessing,
  onAction,
  watchMode,
  padCommand,
}: ActionPanelParams) {
  const isFainted = myPokemon.currentHp <= 0;
  const [currentTab, setCurrentTab] = useState<"fight" | "switch" | null>(null);
  const [hintMode, setHintMode] = useState<boolean>(true);
  const [fightCursor, setFightCursor] = useState(0);
  const [switchCursor, setSwitchCursor] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const { turn, enemyTeam, activeEnemy } = useBattleStore.getState();
  const enemyTypes = enemyTeam[activeEnemy].base.types;
  const switchTargets = useMemo(
    () => myTeam.map((pokemon, index) => ({ pokemon, index })).filter(({ pokemon, index }) => index !== activeMy && pokemon.currentHp > 0),
    [activeMy, myTeam]
  );

  const getMoveDisabledState = useCallback(
    (move: BattlePokemon["base"]["moves"][number]) =>
      isTurnProcessing || isFainted || watchMode || myPokemon.unUsableMove?.name === move.name || myPokemon.pp[move.name] === 0,
    [isFainted, isTurnProcessing, myPokemon.pp, myPokemon.unUsableMove?.name, watchMode]
  );

  useEffect(() => {
    setCurrentTab(null);
    setFightCursor(0);
    setSwitchCursor(0);
  }, [turn]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (switchCursor >= switchTargets.length) {
      setSwitchCursor(0);
    }
  }, [switchCursor, switchTargets.length]);

  const moveFightCursor = useCallback((direction: "up" | "down" | "left" | "right") => {
    setFightCursor((prev) => {
      const totalMoves = 4;
      const row = Math.floor(prev / 2);
      const col = prev % 2;

      if (direction === "left") {
        return row * 2 + ((col + 1) % 2);
      }
      if (direction === "right") {
        return row * 2 + ((col + 1) % 2);
      }
      if (direction === "up") {
        return ((row + 1) % 2) * 2 + col;
      }
      if (direction === "down") {
        return ((row + 1) % 2) * 2 + col;
      }
      return prev % totalMoves;
    });
  }, []);

  const moveSwitchCursor = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (switchTargets.length === 0) {
      return;
    }
    setSwitchCursor((prev) => {
      if (direction === "up" || direction === "left") {
        return (prev - 1 + switchTargets.length) % switchTargets.length;
      }
      return (prev + 1) % switchTargets.length;
    });
  }, [switchTargets.length]);

  const handlePadAction = useCallback(
    (action: BattlePadAction) => {
      if (action === "x") {
        setHintMode((prev) => !prev);
        return;
      }

      if (action === "y") {
        if (myPokemon.status.includes("교체불가")) {
          setCurrentTab("fight");
          return;
        }
        setCurrentTab((prev) => (prev === "switch" ? "fight" : "switch"));
        return;
      }

      if (action === "b") {
        setCurrentTab(null);
        return;
      }

      if (action === "up" || action === "down" || action === "left" || action === "right") {
        if (!currentTab) {
          setCurrentTab("fight");
          return;
        }
        if (currentTab === "fight") {
          moveFightCursor(action);
          return;
        }
        moveSwitchCursor(action);
        return;
      }

      if (action === "a") {
        if (watchMode || isTurnProcessing) {
          return;
        }
        if (!currentTab) {
          setCurrentTab("fight");
          return;
        }
        if (currentTab === "fight") {
          const selectedMove = myPokemon.base.moves[fightCursor];
          if (!selectedMove || getMoveDisabledState(selectedMove)) {
            return;
          }
          onAction(selectedMove);
          return;
        }
        const selectedSwitch = switchTargets[switchCursor];
        if (selectedSwitch) {
          onAction({ type: "switch", index: selectedSwitch.index });
        }
      }
    },
    [currentTab, fightCursor, getMoveDisabledState, isTurnProcessing, moveFightCursor, moveSwitchCursor, myPokemon.base.moves, myPokemon.status, onAction, switchCursor, switchTargets, watchMode]
  );

  useEffect(() => {
    if (!padCommand) {
      return;
    }
    handlePadAction(padCommand.action);
  }, [handlePadAction, padCommand]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement | null;
      if (targetElement && ["INPUT", "TEXTAREA", "SELECT"].includes(targetElement.tagName)) {
        return;
      }

      let mappedAction: BattlePadAction | null = null;
      switch (event.code) {
        case "ArrowUp":
          mappedAction = "up";
          break;
        case "ArrowDown":
          mappedAction = "down";
          break;
        case "ArrowLeft":
          mappedAction = "left";
          break;
        case "ArrowRight":
          mappedAction = "right";
          break;
        case "Enter":
        case "Space":
        case "KeyA":
          mappedAction = "a";
          break;
        case "Escape":
        case "Backspace":
        case "KeyB":
          mappedAction = "b";
          break;
        case "KeyX":
          mappedAction = "x";
          break;
        case "KeyY":
          mappedAction = "y";
          break;
        default:
          break;
      }

      if (!mappedAction) {
        return;
      }
      event.preventDefault();
      handlePadAction(mappedAction);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePadAction]);

  return (
    <div className="action-panel">
      <button className="hint-toggle"
        onClick={() => setHintMode(!hintMode)}
      >타입 상성 힌트 모드 전환</button>
      <div className="pad-help">방향키/D-Pad: 이동, A: 선택, B: 뒤로, X: 힌트, Y: 탭 전환</div>
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
            disabled={isTurnProcessing || myPokemon.status.includes('교체불가')}
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
                      className={`move-button ${effectivenessClass} ${currentTab === "fight" && myPokemon.base.moves[fightCursor]?.name === move.name ? "pad-focused" : ""}`}
                      onClick={() => onAction(move)}
                      disabled={getMoveDisabledState(move)}
                    >
                      <span className="move-name">{move.name}</span>
                      <span className="move-power">{move.category}</span>
                      <span className="move-pp">pp: {myPokemon.pp[move.name]} / {
                        myPokemon.base.moves.find((m) => m.name === move.name)?.pp ?? "?"}</span>
                      <span className="move-power">
                        위력: {move.getPower ? move.getPower(myTeam, 'my') : move.power}
                      </span>
                      <span className="move-accuracy">명중율: {move.getAccuracy ? move.getAccuracy(useBattleStore.getState().publicEnv, 'my') : move.accuracy}</span>
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
                      className={`move-button ${currentTab === "fight" && myPokemon.base.moves[fightCursor]?.name === move.name ? "pad-focused" : ""}`}
                      onClick={() => onAction(move)}
                      disabled={getMoveDisabledState(move)}
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
            focusedSwitchIndex={currentTab === "switch" ? switchTargets[switchCursor]?.index ?? null : null}
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
