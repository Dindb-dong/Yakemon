import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  inputLocked?: boolean;
};

function ActionPanel({
  myPokemon,
  myTeam,
  activeMy,
  isTurnProcessing,
  onAction,
  watchMode,
  padCommand,
  inputLocked = false,
}: ActionPanelParams) {
  const isFainted = myPokemon.currentHp <= 0;
  const [currentTab, setCurrentTab] = useState<"fight" | "switch" | null>("fight");
  const [hintMode, setHintMode] = useState<boolean>(true);
  const [fightCursor, setFightCursor] = useState(0);
  const [switchCursor, setSwitchCursor] = useState(0);
  const [selectedSwitchIndex, setSelectedSwitchIndex] = useState<number | null>(null);
  const [switchOption, setSwitchOption] = useState<"detail" | "switch">("detail");
  const [showSwitchDetail, setShowSwitchDetail] = useState(false);
  const lastHandledPadCommandId = useRef(0);
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
    setCurrentTab("fight");
    setFightCursor(0);
    setSwitchCursor(0);
    setSelectedSwitchIndex(null);
    setSwitchOption("detail");
    setShowSwitchDetail(false);
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
    if (selectedSwitchIndex !== null) {
      setSwitchOption((prev) => (prev === "detail" ? "switch" : "detail"));
      return;
    }
    if (switchTargets.length === 0) {
      return;
    }
    setSwitchCursor((prev) => {
      if (direction === "up" || direction === "left") {
        return (prev - 1 + switchTargets.length) % switchTargets.length;
      }
      return (prev + 1) % switchTargets.length;
    });
  }, [selectedSwitchIndex, switchTargets.length]);

  const handlePadAction = useCallback(
    (action: BattlePadAction) => {
      if (isTurnProcessing || watchMode || inputLocked) {
        return;
      }

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
        if (currentTab === "switch" && selectedSwitchIndex !== null) {
          setSelectedSwitchIndex(null);
          setShowSwitchDetail(false);
          setSwitchOption("detail");
          return;
        }
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
        if (!selectedSwitch) {
          return;
        }
        if (selectedSwitchIndex === null) {
          setSelectedSwitchIndex(selectedSwitch.index);
          setSwitchOption("detail");
          setShowSwitchDetail(false);
          return;
        }
        if (switchOption === "detail") {
          setShowSwitchDetail((prev) => !prev);
          return;
        }
        onAction({ type: "switch", index: selectedSwitchIndex });
        setSelectedSwitchIndex(null);
        setShowSwitchDetail(false);
        setSwitchOption("detail");
      }
    },
    [currentTab, fightCursor, getMoveDisabledState, inputLocked, isTurnProcessing, moveFightCursor, moveSwitchCursor, myPokemon.base.moves, myPokemon.status, onAction, selectedSwitchIndex, switchCursor, switchOption, switchTargets, watchMode]
  );

  useEffect(() => {
    if (!padCommand) {
      return;
    }
    if (isTurnProcessing || watchMode || inputLocked) {
      return;
    }
    if (padCommand.id === lastHandledPadCommandId.current) {
      return;
    }
    lastHandledPadCommandId.current = padCommand.id;
    handlePadAction(padCommand.action);
  }, [handlePadAction, inputLocked, isTurnProcessing, padCommand, watchMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetElement = event.target as HTMLElement | null;
      if (targetElement && ["INPUT", "TEXTAREA", "SELECT"].includes(targetElement.tagName)) {
        return;
      }
      if (event.repeat) {
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
      <span className="hint-toggle">타입 상성 힌트 모드 전환 (X 버튼)</span>
      <div className="pad-help">방향키/D-Pad: 이동, A: 선택, B: 뒤로, X: 힌트, Y: 탭 전환</div>
      {isMobile && currentTab === null && (
        <div className="action-toggle">
          <span className="action-toggle-btn">싸운다</span>
          <span className="action-toggle-btn">교체</span>
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
                    <span
                      key={move.name}
                      className={`move-button ${effectivenessClass} ${currentTab === "fight" && myPokemon.base.moves[fightCursor]?.name === move.name ? "pad-focused" : ""} ${getMoveDisabledState(move) ? "is-disabled" : ""}`}
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
                    </span>
                  );
                })}</>
            )
            }
            {!hintMode && (
              <>
                {myPokemon.base.moves.map((move) => {

                  return (
                    <span
                      key={move.name}
                      className={`move-button ${currentTab === "fight" && myPokemon.base.moves[fightCursor]?.name === move.name ? "pad-focused" : ""} ${getMoveDisabledState(move) ? "is-disabled" : ""}`}
                    >
                      <span className="move-name">{move.name}</span>
                      <span className="move-pp">pp: {myPokemon.pp[move.name]} / {
                        myPokemon.base.moves.find((m) => m.name === move.name)?.pp ?? "?"}</span>
                      <span className="move-power">위력: {move.power}</span>
                      <span className="move-accuracy">명중율: {move.accuracy}</span>
                      <span className={`move-type ${move.type}`}>{move.type}</span>
                    </span>
                  );
                })}</>
            )
            }

          </div>
          {/* 모바일일 경우: 하단에 '교체' 버튼 보여줌 */}
          {isMobile && (
            <span className="action-toggle-btn">교체</span>
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
            selectedSwitchIndex={selectedSwitchIndex}
          />
          {currentTab === "switch" && selectedSwitchIndex !== null && (
            <div className="switch-option-panel">
              <span className={`switch-option-item ${switchOption === "detail" ? "pad-focused" : ""}`}>상세 보기</span>
              <span className={`switch-option-item ${switchOption === "switch" ? "pad-focused" : ""}`}>교체하기</span>
              {showSwitchDetail && (
                <div className="switch-option-detail">
                  {(() => {
                    const selectedPokemon = myTeam[selectedSwitchIndex];
                    if (!selectedPokemon) return null;
                    return (
                      <>
                        <p>타입: {selectedPokemon.base.types.join(", ")}</p>
                        <p>특성: {typeof selectedPokemon.base.ability === "string" ? selectedPokemon.base.ability : selectedPokemon.base.ability?.name ?? "없음"}</p>
                        <p>체력: {selectedPokemon.currentHp} / {selectedPokemon.base.hp}</p>
                        <p>공격력: {selectedPokemon.base.attack}</p>
                        <p>방어력: {selectedPokemon.base.defense}</p>
                        <p>특수공격력: {selectedPokemon.base.spAttack}</p>
                        <p>특수방어력: {selectedPokemon.base.spDefense}</p>
                        <p>스피드: {selectedPokemon.base.speed}</p>
                        <p>상태이상: {selectedPokemon.status.join(", ") || "없음"}</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          {/* 모바일일 경우: 하단에 '싸운다' 버튼 보여줌 */}
          {isMobile && (
            <span className="action-toggle-btn">싸운다</span>
          )}
        </>
      )}
    </div>
  );
}

export default ActionPanel;
